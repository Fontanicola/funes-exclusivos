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

function getEvolutionConfig(): EvolutionConfig {
  const baseUrl = process.env.EVOLUTION_API_BASE_URL?.replace(/\/+$/, "");
  const apiKey = process.env.EVOLUTION_API_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "");
  const webhookSecret = process.env.EVOLUTION_WEBHOOK_SECRET;

  if (!baseUrl || !apiKey || !appUrl || !webhookSecret) {
    throw new Error("Evolution API no está configurada. Revisá variables de entorno.");
  }

  return { baseUrl, apiKey, appUrl, webhookSecret };
}

async function evolutionFetch<T>(path: string, init: RequestInit = {}) {
  const { baseUrl, apiKey } = getEvolutionConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      apikey: apiKey,
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

function normalizeCreateResponse(response: EvolutionInstanceCreateResponse) {
  return {
    ...response,
    qrcode: normalizeQrPayload(response).qrCode,
  };
}

export async function createEvolutionInstance(params: {
  instanceName: string;
  qrcode?: boolean;
}) {
  return normalizeCreateResponse(
    await evolutionFetch<EvolutionInstanceCreateResponse>("/instance/create", {
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
    })
  );
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

