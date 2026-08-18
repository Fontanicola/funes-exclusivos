import { createChatCompletion } from "./openai";
import type { VehicleInterestCandidate } from "@/lib/whatsapp/vehicle-interest";

type ConversationSummary = {
  resumen: string;
  interes_compra: "alto" | "medio" | "bajo" | "sin_interes";
  score: number;
  intencion: string;
  proximo_paso: string;
  requiere_atencion: boolean;
  vehiculo_id: string | null;
  vehiculo_mencionado: string | null;
};

type ConversationLike = {
  contacto_nombre?: string | null;
  contacto_telefono?: string | null;
  contacto_email?: string | null;
  estado?: string | null;
  canal?: string | null;
  lead?: {
    nombre?: string | null;
    telefono?: string | null;
    email?: string | null;
    estado?: string | null;
    origen?: string | null;
  } | null;
  vendedor?: {
    nombre?: string | null;
    email?: string | null;
  } | null;
  vehiculo?: {
    marca?: string | null;
    modelo?: string | null;
    version?: string | null;
    anio?: number | null;
    dominio?: string | null;
  } | null;
  vehiculos_disponibles?: VehicleInterestCandidate[];
};

type MessageLike = {
  from_me?: boolean | null;
  body?: string | null;
  tipo?: string | null;
  sent_at?: string | null;
  direction?: string | null;
};

function stripJsonFence(content: string) {
  const fencedMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) return fencedMatch[1].trim();
  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return content.slice(firstBrace, lastBrace + 1).trim();
  }
  return content.trim();
}

function normalizeInterest(value: unknown): ConversationSummary["interes_compra"] {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "alto" || normalized === "medio" || normalized === "bajo" || normalized === "sin_interes") {
    return normalized;
  }
  return "bajo";
}

function toSafeNumber(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, Math.round(number))) : 20;
}

function normalizeVehicleId(value: unknown, candidates: VehicleInterestCandidate[]) {
  const id = typeof value === "string" ? value.trim() : "";
  return id && candidates.some((candidate) => candidate.id === id) ? id : null;
}

function buildTranscript(messages: MessageLike[]) {
  return messages
    .slice(-40)
    .map((message, index) => {
      const speaker = message.from_me ? "Nuestro equipo" : "Cliente";
      const type = message.tipo && message.tipo !== "texto" ? ` (${message.tipo})` : "";
      const body = message.body?.trim() || "";
      const time = message.sent_at ?? "";
      return `${index + 1}. [${time}] ${speaker}${type}: ${body || "Mensaje no textual"}`;
    })
    .join("\n");
}

export async function summarizeWhatsappConversation(
  conversation: ConversationLike,
  messages: MessageLike[]
): Promise<ConversationSummary> {
  const transcript = buildTranscript(messages.slice(-40));

  const system = [
    "Sos un analista comercial de un concesionario premium argentino.",
    "Tenés que resumir una conversación de WhatsApp y detectar intención de compra.",
    "Respondé únicamente JSON válido, sin markdown ni texto extra.",
    "Usá estos criterios:",
    "- alto: pregunta por precio, disponibilidad, financiación, permuta, visita o reserva; hay avance claro.",
    "- medio: consulta por modelo, características o condiciones, con interés real pero sin cierre.",
    "- bajo: interacción débil, exploratoria o fría.",
    "- sin_interes: spam, irrelevante o sin intención comercial.",
    "Si el cliente pregunta o muestra interés por un vehículo del inventario, devolvé su vehiculo_id exacto usando la lista disponible. Si no hay coincidencia clara, devolvé vehiculo_id null.",
    "El campo score debe ser 0 a 100 y reflejar la intensidad comercial.",
    "El resumen debe ser breve, claro y no superar 700 caracteres.",
  ].join("\n");

  const user = JSON.stringify(
    {
      conversation: {
        contacto_nombre: conversation.contacto_nombre ?? null,
        contacto_telefono: conversation.contacto_telefono ?? null,
        contacto_email: conversation.contacto_email ?? null,
        estado: conversation.estado ?? null,
        canal: conversation.canal ?? null,
        lead: conversation.lead
          ? {
              nombre: conversation.lead.nombre ?? null,
              telefono: conversation.lead.telefono ?? null,
              email: conversation.lead.email ?? null,
              estado: conversation.lead.estado ?? null,
              origen: conversation.lead.origen ?? null,
            }
          : null,
        vendedor: conversation.vendedor
          ? {
              nombre: conversation.vendedor.nombre ?? null,
              email: conversation.vendedor.email ?? null,
            }
          : null,
        vehiculo: conversation.vehiculo
          ? {
              marca: conversation.vehiculo.marca ?? null,
              modelo: conversation.vehiculo.modelo ?? null,
              version: conversation.vehiculo.version ?? null,
              anio: conversation.vehiculo.anio ?? null,
              dominio: conversation.vehiculo.dominio ?? null,
            }
          : null,
        vehiculos_disponibles: (conversation.vehiculos_disponibles ?? []).map((vehicle) => ({
          id: vehicle.id,
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          version: vehicle.version ?? null,
          anio: vehicle.anio ?? null,
          dominio: vehicle.dominio ?? null,
        })),
      },
      transcript,
      expectedSchema: {
        resumen: "string",
        interes_compra: "alto | medio | bajo | sin_interes",
        score: "number 0-100",
        intencion: "string breve",
        proximo_paso: "string accionable",
        requiere_atencion: "boolean",
        vehiculo_id: "string | null",
        vehiculo_mencionado: "string | null",
      },
    },
    null,
    2
  );

  let content: string;
  try {
    content = await createChatCompletion({ system, user, temperature: 0.2 });
  } catch (error) {
    throw error;
  }

  try {
    const normalized = stripJsonFence(content);
    const parsed = JSON.parse(normalized) as Partial<ConversationSummary>;

    return {
      resumen: String(parsed.resumen ?? "").trim().slice(0, 700) || "Sin resumen disponible.",
      interes_compra: normalizeInterest(parsed.interes_compra),
      score: toSafeNumber(parsed.score),
      intencion: String(parsed.intencion ?? "").trim() || "Sin intención detectada.",
      proximo_paso: String(parsed.proximo_paso ?? "").trim() || "Sin próximo paso sugerido.",
      requiere_atencion: Boolean(parsed.requiere_atencion),
      vehiculo_id: normalizeVehicleId(parsed.vehiculo_id, conversation.vehiculos_disponibles ?? []),
      vehiculo_mencionado: String(parsed.vehiculo_mencionado ?? "").trim().slice(0, 160) || null,
    };
  } catch (error) {
    const fallbackMessage = error instanceof Error ? error.message : "No pudimos procesar el resumen IA.";
    console.warn("[WhatsApp AI] parse fallback", fallbackMessage);

    return {
      resumen: `No se pudo generar el resumen automáticamente. ${fallbackMessage}`.slice(0, 700),
      interes_compra: "bajo",
      score: 20,
      intencion: "Sin intención detectada.",
      proximo_paso: "Revisar manualmente la conversación.",
      requiere_atencion: false,
      vehiculo_id: null,
      vehiculo_mencionado: null,
    };
  }
}
