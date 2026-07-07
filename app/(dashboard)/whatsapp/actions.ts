"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/demo-mode";
import {
  createEvolutionInstance,
  cleanEnvValue,
  deleteEvolutionInstance,
  connectEvolutionInstance,
  extractQrFromEvolutionResponse,
  fetchEvolutionQr,
  getEvolutionConnectionState,
  logoutEvolutionInstance,
  setEvolutionWebhook,
} from "@/lib/evolution/client";
import { summarizeWhatsappConversation } from "@/lib/ai/conversation-summary";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
  success?: boolean;
};

function toOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function toOptionalBoolean(value: FormDataEntryValue | null) {
  return value !== null;
}

async function getAuthUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, error: "Tu sesión expiró. Volvé a iniciar sesión." } as const;
  }

  return { supabase, user } as const;
}

async function isAdmin(supabase: ReturnType<typeof createSupabaseServerClient>, userId: string) {
  const { data: employee } = await supabase
    .from("empleados")
    .select("id,rol,activo")
    .eq("id", userId)
    .maybeSingle<{ id: string; rol: string | null; activo: boolean | null }>();

  return Boolean(employee && employee.activo === true && employee.rol === "admin");
}

function demoModeError() {
  return { error: "Modo demo activo: conectá Supabase y Evolution API para ejecutar esta acción." };
}

async function getEmployee(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  employeeId: string
) {
  const { data: employee } = await supabase
    .from("empleados")
    .select("id,nombre,email,rol,activo")
    .eq("id", employeeId)
    .maybeSingle<{ id: string; nombre: string | null; email: string | null; rol: string | null; activo: boolean | null }>();

  return employee ?? null;
}

export async function createWhatsappInstanceAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) return demoModeError();

  const auth = await getAuthUser();
  if ("error" in auth) return { error: auth.error };

  const admin = await isAdmin(auth.supabase, auth.user.id);

  const empleadoId = toOptionalString(formData.get("empleado_id") ?? formData.get("employee_id"));

  const targetEmployeeId = empleadoId || auth.user.id;

  if (!admin && targetEmployeeId !== auth.user.id) {
    return { error: "Solo podés crear tu propia instancia de WhatsApp." };
  }

  const employee = await getEmployee(auth.supabase, targetEmployeeId);
  if (!employee || employee.activo !== true) {
    return { error: "El vendedor seleccionado no existe o está inactivo." };
  }

  const { data: existingInstance } = await auth.supabase
    .from("whatsapp_instancias")
    .select("id,estado,activo")
    .eq("empleado_id", targetEmployeeId)
    .eq("activo", true)
    .maybeSingle<{ id: string; estado: string | null; activo: boolean | null }>();

  if (existingInstance) {
    return { error: "Ese vendedor ya tiene una instancia activa de WhatsApp." };
  }

  const instanceName = `funes_emp_${targetEmployeeId.slice(0, 8)}`;
  const appUrl = cleanEnvValue(process.env.NEXT_PUBLIC_APP_URL).replace(/\/+$/, "");
  const webhookSecret = cleanEnvValue(process.env.EVOLUTION_WEBHOOK_SECRET);

  if (!appUrl || !webhookSecret) {
    return { error: "Faltan variables de entorno de Evolution API." };
  }

  let qrCode: string | null = null;
  let qrBase64: string | null = null;
  let qrExpiresAt: string | null = null;

  try {
    const createResult = await createEvolutionInstance({ instanceName });
    try {
      await setEvolutionWebhook(instanceName);
    } catch (error) {
      console.error("[Evolution] no pudimos configurar el webhook", {
        instanceName,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    const initialQr = extractQrFromEvolutionResponse(createResult);

    qrBase64 = initialQr.qrBase64 ?? null;
    qrCode = initialQr.pairingCode ?? initialQr.qrCode ?? null;
    qrExpiresAt = initialQr.expiresAt ?? null;

    if (!qrBase64 && !qrCode) {
      try {
        await connectEvolutionInstance(instanceName);
      } catch {
        // No-op: Evolution a veces requiere connect antes de devolver QR.
      }

      const qrResult = await fetchEvolutionQr(instanceName);
      const fetchedQr = extractQrFromEvolutionResponse(qrResult);
      qrBase64 = fetchedQr.qrBase64 ?? null;
      qrCode = fetchedQr.pairingCode ?? fetchedQr.qrCode ?? null;
      qrExpiresAt = fetchedQr.expiresAt ?? qrExpiresAt;
    }

  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "No pudimos crear la instancia en Evolution API.",
    };
  }

  const webhookUrl = `${appUrl}/api/evolution/webhook?secret=${encodeURIComponent(webhookSecret)}`;

  const { error } = await auth.supabase.from("whatsapp_instancias").insert({
    empleado_id: targetEmployeeId,
    provider: "evolution_api",
    instance_name: instanceName,
    estado: qrCode ? "qr_pendiente" : "conectando",
    qr_code: qrCode,
    qr_base64: qrBase64,
    qr_expires_at: qrExpiresAt ?? (qrCode || qrBase64 ? new Date(Date.now() + 2 * 60 * 1000).toISOString() : null),
    evolution_base_url: process.env.EVOLUTION_API_BASE_URL ?? null,
    webhook_url: webhookUrl,
    activo: true,
    created_by: auth.user.id,
    updated_by: auth.user.id,
  });

  if (error) {
    return {
      error: "No pudimos guardar la instancia en Supabase.",
    };
  }

  revalidatePath("/whatsapp");
  revalidatePath("/whatsapp/conexiones");
  return { success: true };
}

export async function refreshWhatsappQrAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) return demoModeError();

  const auth = await getAuthUser();
  if ("error" in auth) return { error: auth.error };

  const instanceId = toOptionalString(formData.get("whatsapp_instance_id") ?? formData.get("instancia_id"));
  if (!instanceId) return { error: "La instancia es obligatoria." };

  const { data: instance } = await auth.supabase
    .from("whatsapp_instancias")
    .select("id,empleado_id,instance_name,estado,activo")
    .eq("id", instanceId)
    .maybeSingle<{ id: string; empleado_id: string | null; instance_name: string | null; estado: string | null; activo: boolean | null }>();

  if (!instance) {
    return { error: "No encontramos la instancia seleccionada." };
  }

  const admin = await isAdmin(auth.supabase, auth.user.id);
  if (!admin && instance.empleado_id !== auth.user.id) {
    return { error: "No podés refrescar el QR de esta instancia." };
  }

  if (!instance.instance_name) {
    return { error: "La instancia no tiene un nombre válido en Evolution." };
  }

  let qrCode: string | null = null;
  let qrBase64: string | null = null;
  let qrExpiresAt: string | null = null;

  try {
    const connectResult = await connectEvolutionInstance(instance.instance_name);
    const normalizedConnect = extractQrFromEvolutionResponse(connectResult);
    qrBase64 = normalizedConnect.qrBase64 ?? null;
    qrCode = normalizedConnect.pairingCode ?? normalizedConnect.qrCode ?? null;
    qrExpiresAt = normalizedConnect.expiresAt ?? null;

    if (!qrBase64 && !qrCode) {
      const qrResult = await fetchEvolutionQr(instance.instance_name);
      const normalizedQr = extractQrFromEvolutionResponse(qrResult);
      qrBase64 = normalizedQr.qrBase64 ?? null;
      qrCode = normalizedQr.pairingCode ?? normalizedQr.qrCode ?? null;
      qrExpiresAt = normalizedQr.expiresAt ?? qrExpiresAt;
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No pudimos refrescar el QR.",
    };
  }

  if (!qrBase64 && !qrCode) {
    const { error } = await auth.supabase
      .from("whatsapp_instancias")
      .update({
        estado: "qr_pendiente",
        last_error: "Evolution no devolvió QR en la respuesta",
        last_sync_at: new Date().toISOString(),
        updated_by: auth.user.id,
      })
      .eq("id", instance.id);

    if (error) {
      return { error: "Evolution no devolvió QR en la respuesta." };
    }

    return { error: "Evolution no devolvió QR en la respuesta." };
  }

  const { error } = await auth.supabase
    .from("whatsapp_instancias")
    .update({
      qr_code: qrCode,
      qr_base64: qrBase64,
      qr_expires_at: qrExpiresAt ?? (qrCode || qrBase64 ? new Date(Date.now() + 2 * 60 * 1000).toISOString() : null),
      estado: "qr_pendiente",
      last_error: null,
      last_sync_at: new Date().toISOString(),
      updated_by: auth.user.id,
    })
    .eq("id", instance.id);

  if (error) {
    return { error: "No pudimos guardar el QR actualizado." };
  }

  revalidatePath("/whatsapp");
  revalidatePath("/whatsapp/conexiones");
  return { success: true };
}

export async function disconnectWhatsappInstanceAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) return demoModeError();

  const auth = await getAuthUser();
  if ("error" in auth) return { error: auth.error };

  const instanceId = toOptionalString(formData.get("whatsapp_instance_id") ?? formData.get("instancia_id"));
  if (!instanceId) return { error: "La instancia es obligatoria." };

  const { data: instance } = await auth.supabase
    .from("whatsapp_instancias")
    .select("id,instance_name,empleado_id")
    .eq("id", instanceId)
    .maybeSingle<{ id: string; instance_name: string | null; empleado_id: string | null }>();

  if (!instance?.instance_name) {
    return { error: "No encontramos la instancia seleccionada." };
  }

  const admin = await isAdmin(auth.supabase, auth.user.id);
  if (!admin && instance.empleado_id !== auth.user.id) {
    return { error: "No podés desconectar esta instancia." };
  }

  try {
    await logoutEvolutionInstance(instance.instance_name);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No pudimos desconectar la instancia en Evolution.",
    };
  }

  const { error } = await auth.supabase
    .from("whatsapp_instancias")
    .update({
      estado: "desconectado",
      last_disconnection_at: new Date().toISOString(),
      qr_code: null,
      qr_base64: null,
      qr_expires_at: null,
      updated_by: auth.user.id,
    })
    .eq("id", instance.id);

  if (error) {
    return { error: "No pudimos actualizar el estado de la instancia." };
  }

  revalidatePath("/whatsapp");
  revalidatePath("/whatsapp/conexiones");
  return { success: true };
}

export async function syncWhatsappConnectionAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) return demoModeError();

  const auth = await getAuthUser();
  if ("error" in auth) return { error: auth.error };

  const instanceId = toOptionalString(formData.get("whatsapp_instance_id") ?? formData.get("instancia_id"));
  if (!instanceId) return { error: "La instancia es obligatoria." };

  const { data: instance } = await auth.supabase
    .from("whatsapp_instancias")
    .select("id,empleado_id,instance_name,estado,activo")
    .eq("id", instanceId)
    .maybeSingle<{ id: string; empleado_id: string | null; instance_name: string | null; estado: string | null; activo: boolean | null }>();

  if (!instance) {
    return { error: "No encontramos la instancia seleccionada." };
  }

  const admin = await isAdmin(auth.supabase, auth.user.id);
  if (!admin && instance.empleado_id !== auth.user.id) {
    return { error: "No podés sincronizar esta instancia." };
  }

  if (!instance.instance_name) {
    return { error: "La instancia no tiene un nombre válido en Evolution." };
  }

  try {
    const result = await getEvolutionConnectionState(instance.instance_name);
    const rawState = String(result.instance?.status ?? result.instance?.state ?? "").toLowerCase();
    const qrResult = extractQrFromEvolutionResponse(result);
    const nextState =
      rawState === "open"
        ? "conectado"
        : rawState === "connecting"
          ? "conectando"
          : rawState === "qr"
            ? "qr_pendiente"
            : rawState === "pause"
              ? "pausado"
              : rawState === "error"
                ? "error"
                : rawState === "close"
                  ? "desconectado"
                  : instance.estado ?? "desconectado";

    const { error } = await auth.supabase
      .from("whatsapp_instancias")
      .update({
        estado: nextState,
        last_sync_at: new Date().toISOString(),
        qr_base64: qrResult.qrBase64 ?? null,
        qr_code: qrResult.pairingCode ?? qrResult.qrCode ?? null,
        last_error: null,
        updated_by: auth.user.id,
      })
      .eq("id", instance.id);

    if (error) {
      return { error: "No pudimos guardar el estado sincronizado." };
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No pudimos sincronizar la conexión.",
    };
  }

  revalidatePath("/whatsapp");
  revalidatePath("/whatsapp/conexiones");
  return { success: true };
}

export async function deleteWhatsappInstanceAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) return demoModeError();

  const auth = await getAuthUser();
  if ("error" in auth) return { error: auth.error };

  if (!(await isAdmin(auth.supabase, auth.user.id))) {
    return { error: "No tenés permisos para eliminar instancias de WhatsApp." };
  }

  const instanceId = toOptionalString(formData.get("whatsapp_instance_id") ?? formData.get("instancia_id"));
  if (!instanceId) return { error: "La instancia es obligatoria." };

  const { data: instance } = await auth.supabase
    .from("whatsapp_instancias")
    .select("id,instance_name")
    .eq("id", instanceId)
    .maybeSingle<{ id: string; instance_name: string | null }>();

  if (!instance?.instance_name) {
    return { error: "No encontramos la instancia seleccionada." };
  }

  try {
    await deleteEvolutionInstance(instance.instance_name);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No pudimos eliminar la instancia en Evolution.",
    };
  }

  const { error } = await auth.supabase
    .from("whatsapp_instancias")
    .update({
      activo: false,
      estado: "desconectado",
      qr_code: null,
      qr_base64: null,
      qr_expires_at: null,
      updated_by: auth.user.id,
    })
    .eq("id", instance.id);

  if (error) {
    return { error: "No pudimos desactivar la instancia en Supabase." };
  }

  revalidatePath("/whatsapp");
  revalidatePath("/whatsapp/conexiones");
  return { success: true };
}

export async function pauseWhatsappInstanceAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) return demoModeError();

  const auth = await getAuthUser();
  if ("error" in auth) return { error: auth.error };

  if (!(await isAdmin(auth.supabase, auth.user.id))) {
    return { error: "No tenés permisos para pausar o reactivar instancias." };
  }

  const instanceId = toOptionalString(formData.get("whatsapp_instance_id") ?? formData.get("instancia_id"));
  if (!instanceId) return { error: "La instancia es obligatoria." };

  const { data: instance } = await auth.supabase
    .from("whatsapp_instancias")
    .select("id,instance_name,estado")
    .eq("id", instanceId)
    .maybeSingle<{ id: string; instance_name: string | null; estado: string | null }>();

  if (!instance) {
    return { error: "No encontramos la instancia seleccionada." };
  }

  const nextState =
    instance.estado === "pausado"
        ? await (async () => {
          if (!instance.instance_name) return "desconectado";
          try {
            const statusResult = await getEvolutionConnectionState(instance.instance_name);
            const rawStatus =
              statusResult.instance?.status ?? statusResult.instance?.state ?? "close";
            return String(rawStatus).toLowerCase() === "open"
              ? "conectado"
              : String(rawStatus).toLowerCase() === "connecting"
                ? "conectando"
                : String(rawStatus).toLowerCase() === "qr"
                  ? "qr_pendiente"
                  : String(rawStatus).toLowerCase() === "pause"
                    ? "pausado"
                    : "desconectado";
          } catch {
            return "desconectado";
          }
        })()
      : "pausado";

  const { error } = await auth.supabase
    .from("whatsapp_instancias")
    .update({
      estado: nextState,
      updated_by: auth.user.id,
    })
    .eq("id", instance.id);

  if (error) {
    return { error: "No pudimos actualizar el estado de la instancia." };
  }

  revalidatePath("/whatsapp");
  revalidatePath("/whatsapp/conexiones");
  return { success: true };
}

export async function markConversationAsReadAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) return demoModeError();

  const auth = await getAuthUser();
  if ("error" in auth) return { error: auth.error };

  const conversationId = toOptionalString(formData.get("conversation_id"));
  if (!conversationId) return { error: "La conversación es obligatoria." };

  const { error } = await auth.supabase
    .from("conversaciones")
    .update({
      unread_count: 0,
      requiere_atencion: false,
      updated_by: auth.user.id,
    })
    .eq("id", conversationId);

  if (error) {
    return { error: "No pudimos marcar la conversación como atendida." };
  }

  revalidatePath("/whatsapp");
  revalidatePath(`/whatsapp/${conversationId}`);
  return { success: true };
}

export async function updateConversationFollowUpAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) return demoModeError();

  const auth = await getAuthUser();
  if ("error" in auth) return { error: auth.error };

  const conversationId = toOptionalString(formData.get("conversation_id"));
  const estado = toOptionalString(formData.get("estado")) || null;
  const interesCompra = toOptionalString(formData.get("interes_compra")) || null;
  const resumenIa = toOptionalString(formData.get("resumen_ia")) || null;
  const intencionDetectada = toOptionalString(formData.get("intencion_detectada")) || null;
  const proximaAccion = toOptionalString(formData.get("proxima_accion_sugerida")) || null;
  const requiereAtencion = toOptionalBoolean(formData.get("requiere_atencion"));

  if (!conversationId) return { error: "La conversación es obligatoria." };

  const { error } = await auth.supabase
    .from("conversaciones")
    .update({
      estado,
      interes_compra: interesCompra,
      resumen_ia: resumenIa,
      intencion_detectada: intencionDetectada,
      proxima_accion_sugerida: proximaAccion,
      requiere_atencion: requiereAtencion,
      updated_by: auth.user.id,
    })
    .eq("id", conversationId);

  if (error) {
    return { error: "No pudimos guardar el seguimiento de la conversación." };
  }

  revalidatePath("/whatsapp");
  revalidatePath(`/whatsapp/${conversationId}`);
  return { success: true };
}

export async function generateConversationAiSummaryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para generar resúmenes IA reales." };
  }

  const auth = await getAuthUser();
  if ("error" in auth) return { error: auth.error };

  const conversationId = toOptionalString(formData.get("conversation_id"));
  if (!conversationId) return { error: "La conversación es obligatoria." };

  const { data: actor } = await auth.supabase
    .from("empleados")
    .select("id,rol,activo")
    .eq("id", auth.user.id)
    .maybeSingle<{ id: string; rol: string | null; activo: boolean | null }>();

  const actorRecord = actor ?? null;
  if (!actorRecord || !actorRecord.activo || !["admin", "vendedor"].includes(actorRecord.rol ?? "")) {
    return { error: "No tenés permisos para generar resúmenes IA." };
  }

  const { data: conversation } = await auth.supabase
    .from("conversaciones")
    .select(
      "id,lead_id,vendedor_id,contacto_nombre,contacto_telefono,contacto_email,estado,canal,resumen_ia,interes_compra,ia_estado,ia_resumen,ia_interes_compra,ia_score,ia_intencion,ia_proximo_paso,ia_procesado_at,ia_error,requiere_atencion,lead:leads!conversaciones_lead_id_fkey(id,nombre,telefono,email,estado,origen,nivel_interes),vendedor:empleados!conversaciones_vendedor_id_fkey(id,nombre,email,rol),vehiculo:vehiculos!conversaciones_vehiculo_interes_id_fkey(id,marca,modelo,version,anio,dominio)"
    )
    .eq("id", conversationId)
    .maybeSingle<{
      id: string;
      lead_id: string | null;
      vendedor_id: string | null;
      contacto_nombre: string | null;
      contacto_telefono: string | null;
      contacto_email: string | null;
      estado: string | null;
      canal: string | null;
      resumen_ia: string | null;
      interes_compra: string | null;
      ia_estado: string | null;
      ia_resumen: string | null;
      ia_interes_compra: string | null;
      ia_score: number | null;
      ia_intencion: string | null;
      ia_proximo_paso: string | null;
      ia_procesado_at: string | null;
      ia_error: string | null;
      requiere_atencion: boolean | null;
      lead: {
        id: string;
        nombre: string | null;
        telefono: string | null;
        email: string | null;
        estado: string | null;
        origen: string | null;
        nivel_interes: number | null;
      } | null;
      vendedor: {
        id: string;
        nombre: string | null;
        email: string | null;
        rol: string | null;
      } | null;
      vehiculo: {
        id: string;
        marca: string | null;
        modelo: string | null;
        version: string | null;
        anio: number | null;
        dominio: string | null;
      } | null;
    }>();

  if (!conversation) {
    return { error: "No encontramos la conversación seleccionada." };
  }

  if (actorRecord.rol !== "admin" && conversation.vendedor_id !== auth.user.id) {
    return { error: "No tenés permisos para procesar esta conversación." };
  }

  const { data: messages } = await auth.supabase
    .from("conversacion_mensajes")
    .select("id,tipo,body,from_me,direction,sent_at,created_at")
    .eq("conversacion_id", conversationId)
    .order("sent_at", { ascending: false, nullsFirst: false })
    .limit(40);

  const orderedMessages = [...(messages ?? [])].reverse();

  if (!orderedMessages.length) {
    return { error: "No hay mensajes para resumir." };
  }

  const pendingUpdate = await auth.supabase
    .from("conversaciones")
    .update({
      ia_estado: "pendiente",
      ia_error: null,
      updated_by: auth.user.id,
    })
    .eq("id", conversationId);

  if (pendingUpdate.error) {
    return { error: "No pudimos preparar la conversación para el resumen IA." };
  }

  try {
    const summary = await summarizeWhatsappConversation(conversation, orderedMessages);
    const shouldEscalateLead = summary.interes_compra === "alto" && conversation.lead_id;

    const updates: Record<string, unknown> = {
      ia_estado: "procesado",
      ia_resumen: summary.resumen,
      ia_interes_compra: summary.interes_compra,
      interes_compra: summary.interes_compra,
      ia_intencion: summary.intencion,
      ia_proximo_paso: summary.proximo_paso,
      ia_score: summary.score,
      ia_modelo: cleanEnvValue(process.env.OPENAI_MODEL) || "gpt-4o-mini",
      ia_procesado_at: new Date().toISOString(),
      requiere_atencion: summary.requiere_atencion,
      ia_error: null,
      updated_by: auth.user.id,
    };

    const { error: updateError } = await auth.supabase
      .from("conversaciones")
      .update(updates)
      .eq("id", conversationId);

    if (updateError) {
      return { error: "No pudimos guardar el resumen IA en la conversación." };
    }

    if (shouldEscalateLead && conversation.lead_id) {
      const currentLeadLevel = conversation.lead?.nivel_interes ?? null;
      const nextLeadLevel = currentLeadLevel == null ? 5 : Math.max(currentLeadLevel, 5);

      const { error: leadError } = await auth.supabase
        .from("leads")
        .update({
          nivel_interes: nextLeadLevel,
          updated_by: auth.user.id,
        })
        .eq("id", conversation.lead_id);

      if (leadError) {
        console.warn("[WhatsApp AI] no pudimos actualizar el lead desde el resumen", {
          conversationId,
          leadId: conversation.lead_id,
          error: leadError.message,
        });
      }
    }

    revalidatePath("/whatsapp");
    revalidatePath(`/whatsapp/${conversationId}`);
    revalidatePath("/crm");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "No pudimos generar el resumen IA.";
    await auth.supabase
      .from("conversaciones")
      .update({
        ia_estado: "error",
        ia_error: message.slice(0, 240),
        updated_by: auth.user.id,
      })
      .eq("id", conversationId);

    revalidatePath("/whatsapp");
    revalidatePath(`/whatsapp/${conversationId}`);
    revalidatePath("/crm");
    revalidatePath("/dashboard");

    return { error: message };
  }
}
