import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  detectEvolutionEvent,
  extractInstanceName,
  normalizeConnectionPayload,
  normalizeMessagePayload,
  normalizePhone,
  normalizeQrPayload,
} from "@/lib/evolution/payload-normalizer";
import { persistConversationMessage } from "@/lib/whatsapp/conversations";
import type { EvolutionWebhookPayload } from "@/lib/evolution/types";

export const dynamic = "force-dynamic";

function sanitizeWebhookSecret(value: string | null): string {
  return (value ?? "")
    .replace(/[\u2028\u2029\u200B\uFEFF]/g, "")
    .replace(/[\r\n]/g, "")
    .trim()
    .split("/")[0]
    .trim();
}

function maskSecret(value: string) {
  if (!value) return "";
  if (value.length <= 10) return `${value.slice(0, 2)}***${value.slice(-2)}`;
  return `${value.slice(0, 6)}***${value.slice(-4)}`;
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

function safeMessageError(error: unknown) {
  if (error instanceof Error) {
    return { message: error.message, details: (error as Error & { details?: unknown }).details ?? null };
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    return {
      message: typeof record.message === "string" ? record.message : "Unknown error",
      details: record.details ?? null,
    };
  }

  return { message: String(error ?? "Unknown error"), details: null };
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
    data?.find((lead) => normalizePhone(lead.telefono ?? "") === phone) ?? data?.[0] ?? null
  );
}

export async function POST(request: NextRequest) {
  const expectedSecret = sanitizeWebhookSecret(process.env.EVOLUTION_WEBHOOK_SECRET ?? "");
  const receivedSecret = sanitizeWebhookSecret(request.nextUrl.searchParams.get("secret"));

  if (!expectedSecret || receivedSecret !== expectedSecret) {
    console.error("invalid webhook secret", {
      received: maskSecret(receivedSecret),
      expected: maskSecret(expectedSecret),
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: EvolutionWebhookPayload;

  try {
    payload = (await request.json()) as EvolutionWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const event = detectEvolutionEvent(payload);
  const instanceName = extractInstanceName(payload);

  if (!event || !instanceName) {
    return NextResponse.json({ ignored: true });
  }

  console.info("[Evolution webhook]", { event, instanceName });

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
    const { qrBase64, qrCode, pairingCode, expiresAt } = normalizeQrPayload(payload);
    const updates: Record<string, unknown> = {
      estado: "qr_pendiente",
      qr_base64: qrBase64 ?? null,
      qr_code: pairingCode ?? qrCode ?? null,
      last_error: null,
      last_sync_at: new Date().toISOString(),
    };

    if (expiresAt) {
      updates.qr_expires_at = expiresAt;
    }

    await supabase.from("whatsapp_instancias").update(updates).eq("id", instance.id);
    console.info("[Evolution webhook]", { event, instanceName, ok: true });
    return NextResponse.json({ ok: true });
  }

  if (event === "CONNECTION_UPDATE") {
    const connection = normalizeConnectionPayload(payload);
    const rawState = connection.state;
    const connectionState =
      rawState === "open"
        ? "conectado"
        : rawState === "close"
          ? "desconectado"
          : rawState === "connecting"
            ? "conectando"
            : rawState === "qr"
              ? "qr_pendiente"
              : rawState === "pause"
                ? "pausado"
                : rawState === "error"
                  ? "error"
                  : "desconectado";

    const updates: Record<string, unknown> = {
      estado: connectionState,
      last_sync_at: new Date().toISOString(),
    };

    if (connection.phoneNumber) updates.telefono_conectado = connection.phoneNumber;
    if (connection.profileName) updates.nombre_perfil = connection.profileName;
    if (connectionState === "conectado") {
      updates.last_connection_at = new Date().toISOString();
      updates.qr_code = null;
      updates.qr_expires_at = null;
      updates.last_error = null;
    } else if (connectionState === "desconectado" || connectionState === "error") {
      updates.last_disconnection_at = new Date().toISOString();
      updates.last_error = connection.reason;
    }

    await supabase
      .from("whatsapp_instancias")
      .update(updates)
      .eq("id", instance.id);

    console.info("[Evolution webhook]", { event, instanceName, ok: true });
    return NextResponse.json({ ok: true });
  }

  if (event === "MESSAGES_UPSERT") {
    const normalized = normalizeMessagePayload(payload);
    if (
      !normalized.instanceName ||
      !normalized.externalChatId ||
      normalized.isGroup
    ) {
      return NextResponse.json({ ignored: true });
    }

    const fromNumber = normalized.direction === "outbound" ? normalized.toNumber : normalized.fromNumber;
    const toNumber = normalized.direction === "outbound" ? normalized.fromNumber : normalized.toNumber;
    const contactNumber = normalizePhone(fromNumber ?? toNumber);
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

    const { data: currentConversation } = await supabase
      .from("conversaciones")
      .select("mensajes_count,unread_count")
      .eq("id", conversationId)
      .maybeSingle<{ mensajes_count: number | null; unread_count: number | null }>();

    const currentMessages = currentConversation?.mensajes_count ?? 0;
    const currentUnread = currentConversation?.unread_count ?? 0;

    const messageResult = await persistConversationMessage(supabase, {
      conversationId,
      whatsappInstanceId: instance.id,
      externalMessageId: normalized.externalMessageId,
      direction: normalized.direction === "outbound" ? "saliente" : "entrante",
      fromNumber: normalized.fromNumber,
      toNumber: normalized.toNumber,
      body: normalized.body,
      messageType: normalized.messageType,
      sentAt: normalized.sentAt ?? new Date().toISOString(),
      rawPayload: payload,
    });

    if (messageResult.error) {
      const safeError = safeMessageError(messageResult.error);
      console.error("[Evolution webhook] failed to persist message", {
        instanceName,
        externalChatId: normalized.externalChatId,
        conversationId,
        externalMessageId: messageResult.externalMessageId,
        message: safeError.message,
        details: safeError.details,
      });
      return NextResponse.json({ ok: false, error: "No pudimos guardar el mensaje recibido." }, { status: 500 });
    }

    const conversationUpdates: Record<string, unknown> = {
      mensajes_count: messageResult.duplicate ? currentMessages : currentMessages + 1,
      unread_count: messageResult.duplicate
        ? currentUnread
        : isInboundMessage(normalized.direction)
          ? currentUnread + 1
          : currentUnread,
      ultimo_mensaje_at: normalized.sentAt ?? new Date().toISOString(),
      last_message_preview: previewMessage(normalized.body),
      updated_by: instance.empleado_id,
    };

    if (isInboundMessage(normalized.direction)) {
      conversationUpdates.requiere_atencion = true;
    }

    await supabase.from("conversaciones").update(conversationUpdates).eq("id", conversationId);

    console.info("[Evolution webhook]", {
      event,
      instanceName,
      externalChatId: normalized.externalChatId,
      conversationId,
      externalMessageId: messageResult.externalMessageId,
      duplicate: messageResult.duplicate,
      ok: true,
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ignored: true });
}
