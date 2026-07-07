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
  | "pause"
  | string;

export type EvolutionInstanceCreateResponse = {
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

export type EvolutionWebhookPayload = {
  event?: string | null;
  instance?: string | null;
  instanceName?: string | null;
  data?: unknown;
  message?: unknown;
  [key: string]: unknown;
};

export type EvolutionMessageUpsertPayload = {
  instanceName?: string | null;
  externalChatId?: string | null;
  externalMessageId?: string | null;
  fromMe?: boolean | null;
  contactPhone?: string | null;
  contactName?: string | null;
  body?: string | null;
  messageType?: string | null;
  sentAt?: string | null;
  rawPayload?: unknown;
  isGroup?: boolean;
};

export type NormalizedEvolutionQr = {
  instanceName: string | null;
  qrCode: string | null;
  rawPayload: unknown;
};

export type NormalizedEvolutionConnection = {
  instanceName: string | null;
  state: EvolutionConnectionState | null;
  status: string | null;
  phoneNumber: string | null;
  profileName: string | null;
  reason: string | null;
  rawPayload: unknown;
};

export type NormalizedEvolutionMessage = {
  instanceName: string | null;
  externalMessageId: string | null;
  externalChatId: string | null;
  direction: "inbound" | "outbound";
  fromNumber: string | null;
  toNumber: string | null;
  contactName: string | null;
  body: string | null;
  messageType: string | null;
  sentAt: string | null;
  isGroup: boolean;
  rawPayload: unknown;
};

// Backwards-compatible aliases for existing imports.
export type EvolutionCreateInstanceResponse = EvolutionInstanceCreateResponse;
export type EvolutionConnectionStateResponse = {
  instance?: {
    instanceName?: string | null;
    status?: string | null;
    state?: string | null;
  } | null;
  [key: string]: unknown;
};

