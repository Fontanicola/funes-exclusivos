import type {
  EvolutionConnectionState,
  EvolutionWebhookPayload,
  NormalizedEvolutionMessage,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    const stringValue = getString(value);
    if (stringValue) return stringValue;
  }
  return null;
}

function getNestedRecord(value: unknown, key: string) {
  if (!isRecord(value)) return null;
  const nested = value[key];
  return isRecord(nested) ? nested : null;
}

export function normalizePhoneNumber(value: string | null | undefined) {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits || null;
}

export function getEvolutionEvent(payload: EvolutionWebhookPayload) {
  const rawEvent = firstString(
    payload.event,
    isRecord(payload.data) ? payload.data.event : null,
    isRecord(payload.message) ? payload.message.event : null
  );

  return rawEvent ? rawEvent.toUpperCase() : null;
}

export function getEvolutionInstanceName(payload: EvolutionWebhookPayload) {
  return firstString(
    payload.instanceName,
    payload.instance,
    isRecord(payload.data) ? payload.data.instanceName : null,
    isRecord(payload.data) ? payload.data.instance : null,
    isRecord(payload.message) ? payload.message.instanceName : null
  );
}

function extractMessageSource(payload: EvolutionWebhookPayload) {
  if (isRecord(payload.data)) return payload.data;
  if (isRecord(payload.message)) return payload.message;
  return isRecord(payload) ? payload : null;
}

function extractMessageBody(source: Record<string, unknown> | null) {
  if (!source) return null;

  const message = getNestedRecord(source, "message");
  const nestedMessage = message ?? getNestedRecord(getNestedRecord(source, "data"), "message");
  const extendedTextMessage = nestedMessage ? getNestedRecord(nestedMessage, "extendedTextMessage") : null;
  const imageMessage = nestedMessage ? getNestedRecord(nestedMessage, "imageMessage") : null;
  const videoMessage = nestedMessage ? getNestedRecord(nestedMessage, "videoMessage") : null;
  const documentMessage = nestedMessage ? getNestedRecord(nestedMessage, "documentMessage") : null;
  const buttonsResponseMessage = nestedMessage ? getNestedRecord(nestedMessage, "buttonsResponseMessage") : null;
  const listResponseMessage = nestedMessage ? getNestedRecord(nestedMessage, "listResponseMessage") : null;

  const parts = [
    firstString(source.body),
    firstString(source.text),
    firstString(source.content),
    firstString(source.messageText),
    firstString(nestedMessage?.conversation),
    firstString(extendedTextMessage?.text),
    firstString(imageMessage?.caption),
    firstString(videoMessage?.caption),
    firstString(documentMessage?.caption),
    firstString(buttonsResponseMessage?.selectedButtonId, buttonsResponseMessage?.selectedDisplayText),
    firstString(listResponseMessage?.title),
  ];

  return firstString(...parts);
}

function extractTimestamp(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value * 1000).toISOString();
  }

  if (typeof value === "string" && value.trim()) {
    const normalized = Number(value);
    if (Number.isFinite(normalized)) {
      return new Date(normalized * 1000).toISOString();
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }

  return null;
}

export function normalizeQr(payload: unknown) {
  const source = isRecord(payload) ? payload : null;
  const data = source && isRecord(source.data) ? source.data : null;
  const candidate = firstString(
    data?.qrcode,
    data?.qrCode,
    data?.code,
    data?.pairingCode,
    source?.qrcode,
    source?.qrCode,
    source?.code,
    source?.pairingCode
  );

  if (!candidate) return null;
  if (candidate.startsWith("data:image/")) return candidate;
  if (candidate.startsWith("http")) return candidate;
  if (candidate.length > 32) {
    return `data:image/png;base64,${candidate}`;
  }

  return candidate;
}

export function normalizeConnectionState(payload: unknown): EvolutionConnectionState | null {
  const source = isRecord(payload) ? payload : null;
  const data = source && isRecord(source.data) ? source.data : null;
  const rawState = firstString(
    data?.status,
    data?.state,
    source?.status,
    source?.state,
    source?.connectionState,
    data?.connectionState
  );

  if (!rawState) return null;

  const normalized = rawState.toLowerCase();
  if (["open", "connected", "conectado", "online"].includes(normalized)) return "open";
  if (["close", "closed", "disconnected", "desconectado", "offline"].includes(normalized)) return "close";
  if (["connecting", "conectando", "pairing"].includes(normalized)) return "connecting";
  if (["qr", "qrcode", "qr_pendente", "qr pending", "pairingcode"].includes(normalized)) return "qr";
  if (["error", "failed", "failure"].includes(normalized)) return "error";
  if (["pause", "paused", "pausado"].includes(normalized)) return "pause";

  return rawState as EvolutionConnectionState;
}

export function normalizeEvolutionMessage(payload: EvolutionWebhookPayload): NormalizedEvolutionMessage {
  const source = extractMessageSource(payload);
  const key = source && isRecord(source.key) ? source.key : null;
  const nestedMessage = source && isRecord(source.message) ? source.message : null;
  const message = nestedMessage ?? source;

  const fromMeValue =
    typeof key?.fromMe === "boolean"
      ? key.fromMe
      : typeof source?.fromMe === "boolean"
        ? source.fromMe
        : typeof source?.from_me === "boolean"
          ? source.from_me
          : typeof nestedMessage?.fromMe === "boolean"
            ? nestedMessage.fromMe
            : typeof nestedMessage?.from_me === "boolean"
              ? nestedMessage.from_me
              : false;

  const remoteJid = firstString(
    key?.remoteJid,
    source?.remoteJid,
    source?.remote_jid,
    nestedMessage?.remoteJid,
    nestedMessage?.remote_jid
  );

  const participant = firstString(key?.participant, source?.participant, nestedMessage?.participant);
  const contactName = firstString(
    source?.pushName,
    source?.push_name,
    source?.name,
    source?.profileName,
    nestedMessage?.pushName,
    nestedMessage?.push_name
  );

  const body = extractMessageBody(source);
  const messageType = firstString(
    source?.messageType,
    source?.message_type,
    nestedMessage?.messageType,
    nestedMessage?.message_type,
    typeof message === "object" && message ? Object.keys(message)[0] : null
  );

  const externalMessageId = firstString(
    key?.id,
    source?.messageId,
    source?.message_id,
    source?.id,
    nestedMessage?.messageId,
    nestedMessage?.message_id
  );

  const sentAt = extractTimestamp(
    source?.timestamp ??
      source?.messageTimestamp ??
      source?.message_timestamp ??
      key?.messageTimestamp ??
      key?.message_timestamp ??
      nestedMessage?.timestamp ??
      nestedMessage?.messageTimestamp
  );

  const senderNumber = normalizePhoneNumber(
    fromMeValue ? participant ?? remoteJid : participant ?? remoteJid
  );
  const remoteNumber = normalizePhoneNumber(remoteJid);

  return {
    externalMessageId,
    externalChatId: remoteJid,
    direction: fromMeValue ? "outbound" : "inbound",
    fromNumber: fromMeValue ? remoteNumber : senderNumber,
    toNumber: fromMeValue ? senderNumber : remoteNumber,
    contactName,
    body,
    messageType,
    sentAt,
    rawPayload: payload,
  };
}
