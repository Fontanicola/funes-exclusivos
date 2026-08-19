import "server-only";

import { createChatCompletion } from "@/lib/ai/openai";

export type LeadPipelineState =
  | "nuevo"
  | "contactado"
  | "interesado"
  | "negociacion"
  | "reservado";

export type LeadPipelineInput = {
  id: string;
  nombre: string | null;
  origen: string | null;
  vendedor: string | null;
  vehiculoInteres: string | null;
  ultimoMensaje: string | null;
  ultimoMensajeAt: string | null;
  mensajesTotal: number;
  mensajesNoLeidos: number;
  vendedorRespondio: boolean;
  mensajesRecientes: Array<{ direccion: string | null; body: string | null }>;
};

export type LeadPipelineClassification = {
  id: string;
  estado: LeadPipelineState;
  motivo: string;
};

const validStates = new Set<LeadPipelineState>([
  "nuevo",
  "contactado",
  "interesado",
  "negociacion",
  "reservado",
]);

function normalizeState(value: unknown): LeadPipelineState | null {
  if (typeof value !== "string") return null;
  const normalized = value.toLowerCase().trim().replace(/\s+/g, "_");
  return validStates.has(normalized as LeadPipelineState)
    ? (normalized as LeadPipelineState)
    : null;
}

function normalizeClassifications(value: unknown, inputs: LeadPipelineInput[]) {
  const records = Array.isArray(value)
    ? value
    : value && typeof value === "object" && Array.isArray((value as { leads?: unknown }).leads)
      ? (value as { leads: unknown[] }).leads
      : [];
  const inputIds = new Set(inputs.map((input) => input.id));
  const seen = new Set<string>();

  return records.flatMap((record) => {
    if (!record || typeof record !== "object") return [];
    const item = record as { id?: unknown; estado?: unknown; status?: unknown; motivo?: unknown };
    const id = typeof item.id === "string" ? item.id : "";
    const estado = normalizeState(item.estado ?? item.status);
    if (!id || !inputIds.has(id) || seen.has(id) || !estado) return [];
    seen.add(id);
    return [{
      id,
      estado,
      motivo: typeof item.motivo === "string" ? item.motivo.slice(0, 180) : "Clasificación por actividad comercial.",
    } satisfies LeadPipelineClassification];
  });
}

function fallbackClassification(input: LeadPipelineInput): LeadPipelineClassification {
  const text = [
    input.ultimoMensaje,
    ...input.mensajesRecientes.map((message) => message.body),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const negotiationSignal = /precio|cu[aá]nto|financ|cuota|permuta|reserva|reserv|visita|paso|avanz|seña|se[nñ]a|disponib/.test(text);

  if (negotiationSignal) {
    return { id: input.id, estado: "negociacion", motivo: "Se detectaron señales de avance comercial." };
  }
  if (input.vehiculoInteres) {
    return { id: input.id, estado: "interesado", motivo: "Tiene un vehículo de interés asociado." };
  }
  if (input.vendedorRespondio) {
    return { id: input.id, estado: "contactado", motivo: "El vendedor ya respondió la conversación." };
  }
  return { id: input.id, estado: "nuevo", motivo: "No se detectó una señal suficiente para moverlo." };
}

export async function classifyLeadPipelineBatch(inputs: LeadPipelineInput[]) {
  if (!inputs.length) return [];

  const content = await createChatCompletion({
    system: [
      "Sos un asistente comercial de una concesionaria argentina.",
      "Clasificá leads nuevos para ordenar un pipeline CRM.",
      "Respondé únicamente JSON válido con la forma {\"leads\":[{\"id\":\"...\",\"estado\":\"...\",\"motivo\":\"...\"}]}.",
      "Estados permitidos: nuevo, contactado, interesado, negociacion, reservado.",
      "Reglas: nuevo si escribió pero todavía no hay respuesta del vendedor; contactado si el vendedor respondió; interesado si hay vehículo de interés; negociacion si pregunta precio, financiación, cuotas, permuta, reserva, visita o quiere avanzar; reservado solo si expresa una reserva concreta.",
      "Priorizá señales de negociación sobre interesado y contactado. No inventes datos. Si no alcanza la evidencia, mantené nuevo.",
    ].join(" "),
    user: JSON.stringify(inputs),
    temperature: 0,
  });

  try {
    const parsed = JSON.parse(content) as unknown;
    const normalized = normalizeClassifications(parsed, inputs);
    const byId = new Map(normalized.map((item) => [item.id, item]));
    return inputs.map((input) => byId.get(input.id) ?? fallbackClassification(input));
  } catch {
    return inputs.map(fallbackClassification);
  }
}
