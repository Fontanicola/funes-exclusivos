import type {
  EvolutionConnectionState,
  EvolutionMessageUpsertPayload,
  EvolutionWebhookPayload,
  NormalizedEvolutionConnection,
  NormalizedEvolutionMessage,
  NormalizedEvolutionQr,
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

function getCandidateSource(payload: EvolutionWebhookPayload) {
  if (isRecord(payload.data)) return payload.data;
  if (isRecord(payload.message)) return payload.message;
  return isRecord(payload) ? payload : null;
}

export function normalizePhone(raw: string | null | undefined) {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits || null;
}

export function extractInstanceName(payload: EvolutionWebhookPayload) {
  const source = getCandidateSource(payload);
  return firstString(
    payload.instanceName,
    payload.instance,
    source?.instanceName,
    source?.instance,
    source && isRecord(source.data) ? source.data.instanceName : null,
    source && isRecord(source.data) ? source.data.instance : null,
    source && isRecord(source.data) ? source.data.instanceName : null,
    source && isRecord(source.data) ? source.data.instance : null
  );
}

export function detectEvolutionEvent(payload: EvolutionWebhookPayload) {
  const source = getCandidateSource(payload);
  const event = firstString(
    payload.event,
    source?.event,
    source && isRecord(source.data) ? source.data.event : null,
    source && isRecord(source.message) ? source.message.event : null,
    source && isRecord(source.data) ? source.data.type : null,
    source && isRecord(source.message) ? source.message.type : null
  );

  if (!event) return null;

  const normalized = event.toLowerCase().replace(/[\s_.]+/g, "-");
  if (["qrcode-updated", "qrcodeupdated", "qr", "qr-updated"].includes(normalized)) {
    return "QRCODE_UPDATED";
  }
  if (["connection-update", "connectionupdated", "connection-state"].includes(normalized)) {
    return "CONNECTION_UPDATE";
  }
  if (["messages-upsert", "message-upsert", "message-updated"].includes(normalized)) {
    return "MESSAGES_UPSERT";
  }

  return event.toUpperCase();
}

export function normalizeQrPayload(payload: unknown): NormalizedEvolutionQr {
  const source = isRecord(payload) ? payload : null;
  const data = source && isRecord(source.data) ? source.data : null;
  const qrBase64 = firstString(
    data?.base64,
    data?.qrcode,
    data?.qr,
    source?.base64,
    source?.qrcode,
    source?.qr
  );
  const qrCode = firstString(
    data?.qrcode,
    data?.qr,
    data?.qrCode,
    data?.code,
    data?.pairingCode,
    source?.qrcode,
    source?.qr,
    source?.qrCode,
    source?.code,
    source?.pairingCode
  );
  const pairingCode = firstString(data?.pairingCode, source?.pairingCode, data?.code, source?.code);
  const expiresAt = firstString(data?.expiresAt, data?.expires_at, source?.expiresAt, source?.expires_at);

  const normalizedQrBase64 =
    qrBase64 && qrBase64.startsWith("data:image/")
      ? qrBase64
      : qrBase64 && /^[A-Za-z0-9+/=]+$/.test(qrBase64) && qrBase64.length > 32
        ? qrBase64
        : null;

  const normalizedQrCode =
    qrCode && qrCode.startsWith("data:image/")
      ? null
      : qrCode && /^[A-Za-z0-9+/=]+$/.test(qrCode) && qrCode.length > 32
        ? null
        : qrCode;

  return {
    instanceName: source ? extractInstanceName(source as EvolutionWebhookPayload) : null,
    qrBase64: normalizedQrBase64 ?? null,
    qrCode: normalizedQrCode ?? null,
    pairingCode: pairingCode ?? null,
    expiresAt: expiresAt ?? null,
    rawPayload: payload,
  };
}

export function normalizeConnectionPayload(payload: unknown): NormalizedEvolutionConnection {
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

  let state: EvolutionConnectionState | null = null;
  if (rawState) {
    const normalized = rawState.toLowerCase();
    if (["open", "connected", "conectado", "online"].includes(normalized)) state = "open";
    else if (["close", "closed", "disconnected", "desconectado", "offline"].includes(normalized)) state = "close";
    else if (["connecting", "conectando", "pairing"].includes(normalized)) state = "connecting";
    else if (["qr", "qrcode", "qr_pendiente", "qr pending", "pairingcode"].includes(normalized)) state = "qr";
    else if (["error", "failed", "failure"].includes(normalized)) state = "error";
    else if (["pause", "paused", "pausado"].includes(normalized)) state = "pause";
    else state = rawState;
  }

  const phoneNumber = normalizePhone(
    firstString(data?.phoneNumber, data?.phone_number, data?.userJid, data?.wid, data?.me)
  );

  const profileName = firstString(data?.profileName, data?.name, data?.pushName, data?.push_name);
  const reason = firstString(data?.reason, data?.message, source?.reason, source?.message);

  return {
    instanceName: source ? extractInstanceName(source as EvolutionWebhookPayload) : null,
    state,
    status: rawState,
    phoneNumber,
    profileName,
    reason,
    rawPayload: payload,
  };
}

function extractMessageBody(source: Record<string, unknown> | null) {
  if (!source) return null;

  const message = getNestedRecord(source, "message") ?? getNestedRecord(getNestedRecord(source, "data"), "message");
  const conversationMessage = firstString(
    source.body,
    source.text,
    source.content,
    source.messageText,
    message?.conversation
  );
  if (conversationMessage) return conversationMessage;

  const extendedTextMessage = message ? getNestedRecord(message, "extendedTextMessage") : null;
  const imageMessage = message ? getNestedRecord(message, "imageMessage") : null;
  const videoMessage = message ? getNestedRecord(message, "videoMessage") : null;
  const documentMessage = message ? getNestedRecord(message, "documentMessage") : null;
  const audioMessage = message ? getNestedRecord(message, "audioMessage") : null;
  const stickerMessage = message ? getNestedRecord(message, "stickerMessage") : null;
  const buttonsResponseMessage = message ? getNestedRecord(message, "buttonsResponseMessage") : null;
  const listResponseMessage = message ? getNestedRecord(message, "listResponseMessage") : null;

  return firstString(
    extendedTextMessage?.text,
    imageMessage?.caption,
    videoMessage?.caption,
    documentMessage?.caption,
    audioMessage?.caption,
    buttonsResponseMessage?.selectedButtonId,
    buttonsResponseMessage?.selectedDisplayText,
    listResponseMessage?.title,
    stickerMessage ? "Sticker" : null,
    imageMessage ? "Imagen" : null,
    videoMessage ? "Video" : null,
    documentMessage ? "Documento" : null,
    audioMessage ? "Audio" : null
  );
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

export function normalizeMessagePayload(payload: EvolutionWebhookPayload): NormalizedEvolutionMessage {
  const source = getCandidateSource(payload);
  const key = source && isRecord(source.key) ? source.key : null;
  const nestedMessage = source && isRecord(source.message) ? source.message : null;
  const message = nestedMessage ?? source;
  const remoteJid = firstString(
    key?.remoteJid,
    source?.remoteJid,
    source?.remote_jid,
    nestedMessage?.remoteJid,
    nestedMessage?.remote_jid
  );
  const isGroup = Boolean(remoteJid?.endsWith("@g.us"));

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

  const senderNumber = normalizePhone(
    fromMeValue ? firstString(key?.participant, source?.participant, nestedMessage?.participant) ?? remoteJid : remoteJid
  );
  const remoteNumber = normalizePhone(remoteJid);

  const normalized: EvolutionMessageUpsertPayload = {
    instanceName: extractInstanceName(payload),
    externalChatId: remoteJid,
    externalMessageId,
    fromMe: fromMeValue,
    contactPhone: senderNumber,
    contactName,
    body: body ?? null,
    messageType,
    sentAt,
    rawPayload: payload,
    isGroup,
  };

  return {
    instanceName: normalized.instanceName ?? null,
    externalMessageId: normalized.externalMessageId ?? null,
    externalChatId: normalized.externalChatId ?? null,
    direction: fromMeValue ? "outbound" : "inbound",
    fromNumber: fromMeValue ? remoteNumber : senderNumber,
    toNumber: fromMeValue ? senderNumber : remoteNumber,
    contactName: normalized.contactName ?? null,
    body: normalized.body ?? null,
    messageType: normalized.messageType ?? null,
    sentAt: normalized.sentAt ?? null,
    isGroup,
    rawPayload: payload,
  };
}

// Backwards-compatible aliases for existing imports.
export const normalizePhoneNumber = normalizePhone;
export const getEvolutionEvent = detectEvolutionEvent;
export const getEvolutionInstanceName = extractInstanceName;
export const normalizeQr = (payload: unknown) => normalizeQrPayload(payload).qrCode;
export const normalizeConnectionState = (payload: unknown) => normalizeConnectionPayload(payload).state;
export const normalizeEvolutionMessage = normalizeMessagePayload;
