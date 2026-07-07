import "server-only";

import type {
  EvolutionConnectionStateResponse,
  EvolutionCreateInstanceResponse,
  EvolutionQrResponse,
} from "./types";
import { normalizeQr } from "./payload-normalizer";

const REQUIRED_CONFIG_ERROR = "Faltan variables de entorno de Evolution API.";

function getEvolutionConfig() {
  const baseUrl = process.env.EVOLUTION_API_BASE_URL?.replace(/\/+$/, "");
  const apiKey = process.env.EVOLUTION_API_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "");
  const webhookSecret = process.env.EVOLUTION_WEBHOOK_SECRET;

  if (!baseUrl || !apiKey || !appUrl || !webhookSecret) {
    throw new Error(REQUIRED_CONFIG_ERROR);
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
    const message =
      typeof parsed === "object" && parsed && "message" in parsed
        ? String((parsed as { message?: unknown }).message ?? raw ?? response.statusText)
        : typeof parsed === "string"
          ? parsed
          : raw || response.statusText;
    throw new Error(message || REQUIRED_CONFIG_ERROR);
  }

  return parsed as T;
}

function buildWebhookUrl() {
  const { appUrl, webhookSecret } = getEvolutionConfig();
  return `${appUrl}/api/evolution/webhook?secret=${encodeURIComponent(webhookSecret)}`;
}

function normalizeCreateResponse(response: EvolutionCreateInstanceResponse) {
  return {
    ...response,
    qrcode: normalizeQr(response),
  };
}

export async function createEvolutionInstance(instanceName: string) {
  const response = await evolutionFetch<EvolutionCreateInstanceResponse>("/instance/create", {
    method: "POST",
    body: JSON.stringify({
      instanceName,
      qrcode: true,
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

  return normalizeCreateResponse(response);
}

export async function getEvolutionInstanceQr(instanceName: string) {
  const response = await evolutionFetch<EvolutionQrResponse>(`/instance/connect/${encodeURIComponent(instanceName)}`, {
    method: "GET",
  });

  return {
    ...response,
    qrcode: normalizeQr(response),
  };
}

export async function getEvolutionInstanceStatus(instanceName: string) {
  return evolutionFetch<EvolutionConnectionStateResponse>(
    `/instance/connectionState/${encodeURIComponent(instanceName)}`,
    {
      method: "GET",
    }
  );
}

export async function disconnectEvolutionInstance(instanceName: string) {
  return evolutionFetch<Record<string, unknown>>(`/instance/logout/${encodeURIComponent(instanceName)}`, {
    method: "DELETE",
  });
}
