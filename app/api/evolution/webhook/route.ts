import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getEvolutionEvent,
  getEvolutionInstanceName,
  normalizeConnectionState,
  normalizeEvolutionMessage,
  normalizePhoneNumber,
  normalizeQr,
} from "@/lib/evolution/payload-normalizer";
import type { EvolutionWebhookPayload } from "@/lib/evolution/types";

export const dynamic = "force-dynamic";

function getWebhookSecret(request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get("secret");
}

function isInboundMessage(direction: string) {
  return direction !== "outbound";
}

function previewMessage(body: string | null) {
  if (!body) return null;
  const trimmed = body.trim();
  if (trimmed.length <= 140) return trimmed;
  return `${trimmed.slice(0, 137).trimEnd()}...`;
}

async function findLeadByPhone(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  phone: string | null
) {
  if (!phone) return null;

  const suffix8 = phone.slice(-8);
  const suffix7 = phone.slice(-7);

  const { data } = await supabase
    .from("leads")
    .select("id,nombre,telefono,email,estado,origen,vendedor_id")
    .or(`telefono.ilike.%${phone}%,telefono.ilike.%${suffix8}%,telefono.ilike.%${suffix7}%`)
    .limit(25);

  return (
    data?.find((lead) => normalizePhoneNumber(lead.telefono ?? "") === phone) ?? data?.[0] ?? null
  );
}

export async function POST(request: Request) {
  const expectedSecret = process.env.EVOLUTION_WEBHOOK_SECRET;
  const receivedSecret = getWebhookSecret(request);

  if (!expectedSecret || receivedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: EvolutionWebhookPayload;

  try {
    payload = (await request.json()) as EvolutionWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const event = getEvolutionEvent(payload);
  const instanceName = getEvolutionInstanceName(payload);

  if (!event || !instanceName) {
    return NextResponse.json({ ignored: true });
  }

  const supabase = createSupabaseAdminClient();

  const { data: instance } = await supabase
    .from("whatsapp_instancias")
    .select("id,empleado_id,instance_name,estado,telefono_conectado,nombre_perfil")
    .eq("instance_name", instanceName)
    .maybeSingle<{ id: string; empleado_id: string | null; instance_name: string | null; estado: string | null; telefono_conectado: string | null; nombre_perfil: string | null }>();

  if (!instance) {
    return NextResponse.json({ ignored: true });
  }

  if (event === "QRCODE_UPDATED") {
    const qrCode = normalizeQr(payload);
    const updates: Record<string, unknown> = {
      estado: "qr_pendiente",
      last_sync_at: new Date().toISOString(),
    };

    if (qrCode) {
      updates.qr_code = qrCode;
      updates.qr_expires_at = new Date(Date.now() + 2 * 60 * 1000).toISOString();
    }

    await supabase.from("whatsapp_instancias").update(updates).eq("id", instance.id);
    return NextResponse.json({ ok: true });
  }

  if (event === "CONNECTION_UPDATE") {
    const normalizedState = normalizeConnectionState(payload);
    const data = typeof payload.data === "object" && payload.data ? (payload.data as Record<string, unknown>) : null;
    const connectionState =
      normalizedState === "open"
        ? "conectado"
        : normalizedState === "close"
          ? "desconectado"
          : normalizedState === "connecting"
            ? "conectando"
            : normalizedState === "qr"
              ? "qr_pendiente"
              : normalizedState === "pause"
                ? "pausado"
                : normalizedState === "error"
                  ? "error"
                  : "desconectado";

    const telephone = [
      data?.phoneNumber,
      data?.phone_number,
      data?.userJid,
      data?.wid,
      data?.me,
    ]
      .map((value) => (typeof value === "string" ? normalizePhoneNumber(value) : null))
      .find(Boolean) ?? null;

    const profileName = [
      data?.profileName,
      data?.name,
      data?.pushName,
      data?.push_name,
    ]
      .map((value) => (typeof value === "string" ? value.trim() : null))
      .find(Boolean) ?? null;

    const updates: Record<string, unknown> = {
      estado: connectionState,
      last_sync_at: new Date().toISOString(),
    };

    if (telephone) updates.telefono_conectado = telephone;
    if (profileName) updates.nombre_perfil = profileName;
    if (connectionState === "conectado") {
      updates.last_connection_at = new Date().toISOString();
      updates.qr_code = null;
      updates.qr_expires_at = null;
      updates.last_error = null;
    } else if (connectionState === "desconectado" || connectionState === "error") {
      updates.last_disconnection_at = new Date().toISOString();
      updates.last_error =
        typeof data?.reason === "string"
          ? data.reason
          : typeof data?.message === "string"
            ? data.message
            : null;
    }

    await supabase
      .from("whatsapp_instancias")
      .update(updates)
      .eq("id", instance.id);

    return NextResponse.json({ ok: true });
  }

  if (event === "MESSAGES_UPSERT") {
    const normalized = normalizeEvolutionMessage(payload);
    if (!normalized.body && !normalized.externalMessageId) {
      return NextResponse.json({ ignored: true });
    }

    const fromNumber = normalized.direction === "outbound" ? normalized.toNumber : normalized.fromNumber;
    const toNumber = normalized.direction === "outbound" ? normalized.fromNumber : normalized.toNumber;
    const contactNumber = normalizePhoneNumber(fromNumber ?? toNumber);
    const contactName = normalized.contactName ?? contactNumber ?? "Sin nombre";

    let lead = await findLeadByPhone(supabase, contactNumber);

    if (!lead && isInboundMessage(normalized.direction)) {
      const { data: createdLead, error: leadError } = await supabase
        .from("leads")
        .insert({
          nombre: contactName,
          telefono: contactNumber,
          origen: "whatsapp",
          estado: "nuevo",
          vendedor_id: instance.empleado_id,
          created_by: instance.empleado_id,
          updated_by: instance.empleado_id,
        })
        .select("id,nombre,telefono,email,estado,origen,vendedor_id")
        .maybeSingle();

      if (!leadError) {
        lead = createdLead as typeof lead;
      }
    }

    const externalChatId = normalized.externalChatId ?? contactNumber;

    const byExternalChat = externalChatId
      ? supabase
          .from("conversaciones")
          .select("id,lead_id,contacto_numero_normalizado")
          .eq("whatsapp_instancia_id", instance.id)
          .eq("external_chat_id", externalChatId)
          .maybeSingle<{ id: string; lead_id: string | null; contacto_numero_normalizado: string | null }>()
      : Promise.resolve({ data: null, error: null });

    const byNumber = contactNumber
      ? supabase
          .from("conversaciones")
          .select("id,lead_id,contacto_numero_normalizado")
          .eq("whatsapp_instancia_id", instance.id)
          .eq("contacto_numero_normalizado", contactNumber)
          .maybeSingle<{ id: string; lead_id: string | null; contacto_numero_normalizado: string | null }>()
      : Promise.resolve({ data: null, error: null });

    const [externalChatResult, numberResult] = await Promise.all([byExternalChat, byNumber]);
    const conversation = (numberResult.data ?? externalChatResult.data) as
      | { id: string; lead_id: string | null; contacto_numero_normalizado: string | null }
      | null;

    let conversationId = conversation?.id ?? null;

    if (!conversationId) {
      const { data: createdConversation, error: conversationError } = await supabase
        .from("conversaciones")
        .insert({
          whatsapp_instancia_id: instance.id,
          lead_id: lead?.id ?? null,
          vendedor_id: instance.empleado_id,
          canal: "whatsapp",
          estado: "abierta",
          external_chat_id: normalized.externalChatId,
          contacto_nombre: contactName,
          contacto_telefono: contactNumber,
          contacto_numero_normalizado: contactNumber,
          ultimo_mensaje_at: normalized.sentAt ?? new Date().toISOString(),
          last_message_preview: previewMessage(normalized.body),
          mensajes_count: 0,
          unread_count: isInboundMessage(normalized.direction) ? 1 : 0,
          requiere_atencion: isInboundMessage(normalized.direction),
          created_by: instance.empleado_id,
          updated_by: instance.empleado_id,
        })
        .select("id")
        .maybeSingle<{ id: string }>();

      if (conversationError || !createdConversation) {
        return NextResponse.json({ ignored: true });
      }

      conversationId = createdConversation.id;
    } else if (lead?.id && !conversation?.lead_id) {
      await supabase
        .from("conversaciones")
        .update({
          lead_id: lead.id,
          updated_by: instance.empleado_id,
        })
        .eq("id", conversationId);
    }

    const externalMessageId =
      normalized.externalMessageId ?? `${conversationId}:${normalized.sentAt ?? Date.now()}`;

    await supabase.from("conversacion_mensajes").upsert(
      {
        conversacion_id: conversationId,
        whatsapp_instancia_id: instance.id,
        external_message_id: externalMessageId,
        direccion: normalized.direction,
        from_number: normalized.fromNumber,
        to_number: normalized.toNumber,
        body: normalized.body,
        message_type: normalized.messageType,
        sent_at: normalized.sentAt ?? new Date().toISOString(),
        raw_payload: payload,
      },
      { onConflict: "external_message_id" }
    );

    await supabase
      .from("conversaciones")
      .update({
        ultimo_mensaje_at: normalized.sentAt ?? new Date().toISOString(),
        last_message_preview: previewMessage(normalized.body),
        updated_by: instance.empleado_id,
      })
      .eq("id", conversationId);

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ignored: true });
}
