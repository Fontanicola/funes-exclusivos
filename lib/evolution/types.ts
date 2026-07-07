export type EvolutionInstanceStatus =
  | "conectado"
  | "desconectado"
  | "qr_pendiente"
  | "conectando"
  | "error"
  | "pausado"
  | string;

export type EvolutionConnectionState =
  | "open"
  | "close"
  | "connecting"
  | "qr"
  | "error"
  | string;

export type EvolutionWebhookEvent =
  | "QRCODE_UPDATED"
  | "CONNECTION_UPDATE"
  | "MESSAGES_UPSERT"
  | string;

export type EvolutionCreateInstanceResponse = {
  instance?: {
    instanceName?: string | null;
    instanceId?: string | null;
    status?: string | null;
    state?: string | null;
  } | null;
  qrcode?: string | null;
  qrCode?: string | null;
  code?: string | null;
  pairingCode?: string | null;
  hash?: string | null;
  webhook?: Record<string, unknown> | null;
  [key: string]: unknown;
};

export type EvolutionQrResponse = {
  instance?: {
    instanceName?: string | null;
    status?: string | null;
    state?: string | null;
  } | null;
  qrcode?: string | null;
  qrCode?: string | null;
  code?: string | null;
  pairingCode?: string | null;
  expiresAt?: string | null;
  [key: string]: unknown;
};

export type EvolutionConnectionStateResponse = {
  instance?: {
    instanceName?: string | null;
    status?: string | null;
    state?: string | null;
  } | null;
  [key: string]: unknown;
};

export type EvolutionWebhookPayload = {
  event?: EvolutionWebhookEvent | string | null;
  instance?: string | null;
  instanceName?: string | null;
  data?: unknown;
  message?: unknown;
  [key: string]: unknown;
};

export type NormalizedEvolutionMessage = {
  externalMessageId: string | null;
  externalChatId: string | null;
  direction: "inbound" | "outbound" | string;
  fromNumber: string | null;
  toNumber: string | null;
  contactName: string | null;
  body: string | null;
  messageType: string | null;
  sentAt: string | null;
  rawPayload: unknown;
};
