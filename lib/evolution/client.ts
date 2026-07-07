import "server-only";

import type {
  EvolutionConnectionStateResponse,
  EvolutionInstanceCreateResponse,
  EvolutionQrResponse,
} from "./types";
import { normalizeQrPayload } from "./payload-normalizer";

type EvolutionConfig = {
  baseUrl: string;
  apiKey: string;
  appUrl: string;
  webhookSecret: string;
};

export function cleanEnvValue(value: string | undefined) {
  return (value ?? "")
    .replace(/[\u2028\u2029\u200B\uFEFF]/g, "")
    .replace(/[\r\n]/g, "")
    .trim();
}

function collectObjectKeys(value: unknown, output = new Set<string>()) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return output;
  for (const key of Object.keys(value as Record<string, unknown>)) {
    output.add(key);
  }
  const record = value as Record<string, unknown>;
  if (record.data && typeof record.data === "object") {
    collectObjectKeys(record.data, output);
  }
  if (record.instance && typeof record.instance === "object") {
    collectObjectKeys(record.instance, output);
  }
  return output;
}

function getEvolutionConfig(): EvolutionConfig {
  const baseUrl = cleanEnvValue(process.env.EVOLUTION_API_BASE_URL).replace(/\/+$/, "");
  const apiKey = cleanEnvValue(process.env.EVOLUTION_API_KEY);
  const appUrl = cleanEnvValue(process.env.NEXT_PUBLIC_APP_URL).replace(/\/+$/, "");
  const webhookSecret = cleanEnvValue(process.env.EVOLUTION_WEBHOOK_SECRET);

  if (!baseUrl) {
    throw new Error("Evolution API no está configurada: falta EVOLUTION_API_BASE_URL");
  }
  if (!apiKey) {
    throw new Error("Evolution API no está configurada: falta EVOLUTION_API_KEY");
  }
  if (!appUrl) {
    throw new Error("Evolution API no está configurada: falta NEXT_PUBLIC_APP_URL");
  }
  if (!webhookSecret) {
    throw new Error("Evolution API no está configurada: falta EVOLUTION_WEBHOOK_SECRET");
  }

  return { baseUrl, apiKey, appUrl, webhookSecret };
}

async function evolutionFetch<T>(path: string, init: RequestInit = {}) {
  const { baseUrl, apiKey } = getEvolutionConfig();
  const safeApiKey = cleanEnvValue(apiKey);
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      apikey: safeApiKey,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const raw = await response.text();
  let parsed: unknown = null;

  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw;
    }
  }

  if (!response.ok) {
    const bodyPreview =
      typeof parsed === "string"
        ? parsed
        : parsed && typeof parsed === "object"
          ? JSON.stringify(parsed).slice(0, 200)
          : raw || response.statusText;
    throw new Error(
      `Evolution API respondió ${response.status} ${response.statusText}${
        bodyPreview ? `: ${bodyPreview}` : ""
      }`
    );
  }

  return parsed as T;
}

function buildWebhookUrl() {
  const { appUrl, webhookSecret } = getEvolutionConfig();
  return `${appUrl}/api/evolution/webhook?secret=${encodeURIComponent(webhookSecret)}`;
}

export function extractQrFromEvolutionResponse(response: unknown): {
  qrBase64?: string;
  qrCode?: string;
  pairingCode?: string;
  expiresAt?: string | null;
} {
  const normalized = normalizeQrPayload(response);
  const keys = Array.from(collectObjectKeys(response)).sort();
  if (keys.length > 0) {
    console.info("Evolution QR payload keys:", keys.join(", "));
  }

  return {
    qrBase64: normalized.qrBase64 ?? undefined,
    qrCode: normalized.qrCode ?? undefined,
    pairingCode: normalized.pairingCode ?? undefined,
    expiresAt: normalized.expiresAt ?? undefined,
  };
}

export async function createEvolutionInstance(params: {
  instanceName: string;
  qrcode?: boolean;
}) {
  return evolutionFetch<EvolutionInstanceCreateResponse>("/instance/create", {
    method: "POST",
    body: JSON.stringify({
      instanceName: params.instanceName,
      qrcode: params.qrcode ?? true,
      integration: "WHATSAPP-BAILEYS",
      webhook: {
        enabled: true,
        url: buildWebhookUrl(),
        byEvents: true,
        base64: false,
        events: ["QRCODE_UPDATED", "CONNECTION_UPDATE", "MESSAGES_UPSERT"],
      },
    }),
  });
}

export async function connectEvolutionInstance(instanceName: string) {
  return evolutionFetch<EvolutionQrResponse>(`/instance/connect/${encodeURIComponent(instanceName)}`, {
    method: "GET",
  });
}

export async function fetchEvolutionQr(instanceName: string) {
  return evolutionFetch<EvolutionQrResponse>(`/instance/connect/${encodeURIComponent(instanceName)}`, {
    method: "GET",
  });
}

export async function getEvolutionConnectionState(instanceName: string) {
  return evolutionFetch<EvolutionConnectionStateResponse>(
    `/instance/connectionState/${encodeURIComponent(instanceName)}`,
    {
      method: "GET",
    }
  );
}

export async function logoutEvolutionInstance(instanceName: string) {
  return evolutionFetch<Record<string, unknown>>(`/instance/logout/${encodeURIComponent(instanceName)}`, {
    method: "DELETE",
  });
}

export async function deleteEvolutionInstance(instanceName: string) {
  return evolutionFetch<Record<string, unknown>>(`/instance/delete/${encodeURIComponent(instanceName)}`, {
    method: "DELETE",
  });
}

export async function setEvolutionWebhook(instanceName: string) {
  const { appUrl, webhookSecret } = getEvolutionConfig();
  const webhookUrl = `${appUrl}/api/evolution/webhook?secret=***`;
  console.info("[Evolution] set webhook", { instanceName, webhookUrl });
  return evolutionFetch<Record<string, unknown>>(`/webhook/set/${encodeURIComponent(instanceName)}`, {
    method: "POST",
    body: JSON.stringify({
      webhook: {
        enabled: true,
        url: `${appUrl}/api/evolution/webhook?secret=${encodeURIComponent(webhookSecret)}`,
        byEvents: true,
        base64: false,
        events: ["QRCODE_UPDATED", "CONNECTION_UPDATE", "MESSAGES_UPSERT"],
      },
    }),
  });
}

// Backwards-compatible exports used by existing code.
export const getEvolutionInstanceQr = fetchEvolutionQr;
export const getEvolutionInstanceStatus = getEvolutionConnectionState;
export const disconnectEvolutionInstance = logoutEvolutionInstance;
