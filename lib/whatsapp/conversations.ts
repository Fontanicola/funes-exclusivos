import type { SupabaseClient } from "@supabase/supabase-js";

type PersistConversationMessageInput = {
  conversationId: string;
  whatsappInstanceId: string;
  externalMessageId: string | null;
  direction: "entrante" | "saliente";
  fromNumber: string | null;
  toNumber: string | null;
  body: string | null;
  messageType: string | null;
  sentAt: string | null;
  rawPayload: unknown;
};

function buildFallbackExternalMessageId({
  conversationId,
  direction,
  fromNumber,
  toNumber,
  body,
  messageType,
  sentAt,
}: PersistConversationMessageInput) {
  const timestamp = sentAt ?? new Date().toISOString();
  const snippet = (body ?? messageType ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 80);

  return [
    conversationId,
    direction,
    fromNumber ?? "unknown",
    toNumber ?? "unknown",
    timestamp,
    snippet || "message",
  ].join(":");
}

export function resolveConversationMessageIdentifier(
  input: PersistConversationMessageInput
) {
  return input.externalMessageId?.trim() || buildFallbackExternalMessageId(input);
}

export async function persistConversationMessage(
  supabase: SupabaseClient,
  input: PersistConversationMessageInput
) {
  const externalMessageId = resolveConversationMessageIdentifier(input);

  const { data: existingMessage, error: existingError } = await supabase
    .from("conversacion_mensajes")
    .select("id")
    .eq("conversacion_id", input.conversationId)
    .eq("external_message_id", externalMessageId)
    .maybeSingle<{ id: string }>();

  if (existingError) {
    return {
      data: null,
      error: existingError,
      duplicate: false,
      externalMessageId,
    } as const;
  }

  if (existingMessage) {
    return {
      data: existingMessage,
      error: null,
      duplicate: true,
      externalMessageId,
    } as const;
  }

  const payload = {
    conversacion_id: input.conversationId,
    whatsapp_instancia_id: input.whatsappInstanceId,
    external_message_id: externalMessageId,
    direccion: input.direction,
    from_number: input.fromNumber,
    to_number: input.toNumber,
    body: input.body,
    message_type: input.messageType ?? "unknown",
    sent_at: input.sentAt ?? new Date().toISOString(),
    raw_payload: input.rawPayload,
  };

  const { data, error } = await supabase
    .from("conversacion_mensajes")
    .insert(payload)
    .select("id,external_message_id")
    .maybeSingle<{ id: string; external_message_id: string | null }>();

  if (error) {
    return {
      data: null,
      error,
      duplicate: false,
      externalMessageId,
    } as const;
  }

  return {
    data,
    error: null,
    duplicate: false,
    externalMessageId,
  } as const;
}
