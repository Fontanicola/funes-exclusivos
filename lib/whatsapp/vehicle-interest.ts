import type { SupabaseClient } from "@supabase/supabase-js";

export type VehicleInterestCandidate = {
  id: string;
  marca: string | null;
  modelo: string | null;
  version?: string | null;
  anio?: number | null;
  dominio?: string | null;
  estado?: string | null;
};

function vehicleLabel(vehicle: VehicleInterestCandidate | null | undefined) {
  if (!vehicle) return "Sin vehículo asociado";
  return [vehicle.marca, vehicle.modelo, vehicle.version, vehicle.anio]
    .filter(Boolean)
    .join(" ") || "Vehículo sin descripción";
}

/** Records an interest change using the existing CRM interaction history. */
export async function recordLeadVehicleInterestChange(
  supabase: SupabaseClient,
  input: {
    leadId: string;
    previousVehicleId: string | null | undefined;
    nextVehicle: VehicleInterestCandidate;
    actorId: string | null | undefined;
    source: string;
  }
) {
  if (!input.nextVehicle.id || input.previousVehicleId === input.nextVehicle.id) {
    return { skipped: true, error: null };
  }

  let previousVehicle: VehicleInterestCandidate | null = null;
  if (input.previousVehicleId) {
    const { data } = await supabase
      .from("vehiculos")
      .select("id,marca,modelo,version,anio,dominio,estado")
      .eq("id", input.previousVehicleId)
      .maybeSingle<VehicleInterestCandidate>();
    previousVehicle = data ?? null;
  }

  const previousLabel = vehicleLabel(previousVehicle);
  const nextLabel = vehicleLabel(input.nextVehicle);
  const title = input.previousVehicleId ? "Cambio de vehículo de interés" : "Vehículo de interés detectado";
  const content = `${previousLabel} → ${nextLabel}. Origen: ${input.source}.`;

  const { error } = await supabase.from("lead_interacciones").insert({
    lead_id: input.leadId,
    tipo: "interes_vehiculo",
    titulo: title,
    contenido: content,
    created_by: input.actorId ?? null,
  });

  return { skipped: false, error };
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function compactText(value: string | null | undefined) {
  return normalizeText(value).replace(/\s+/g, "");
}

function meaningfulTokens(value: string | null | undefined) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length >= 3 && !/^\d+$/.test(token));
}

function candidateText(vehicle: VehicleInterestCandidate) {
  return [vehicle.marca, vehicle.modelo, vehicle.version, vehicle.anio, vehicle.dominio]
    .filter(Boolean)
    .join(" ");
}

/**
 * Finds a conservative match for explicit vehicle mentions in an incoming message.
 * It deliberately requires a model/brand signal and never guesses from generic words
 * such as "auto" or "vehículo".
 */
export function findVehicleInterestMatch(
  text: string | null | undefined,
  vehicles: VehicleInterestCandidate[]
) {
  const normalizedText = normalizeText(text);
  const compactMessage = compactText(text);
  const messageTokens = normalizedText.split(" ");
  if (!normalizedText) return null;

  let best: { vehicle: VehicleInterestCandidate; score: number } | null = null;

  for (const vehicle of vehicles) {
    const compactDomain = compactText(vehicle.dominio);
    const compactModel = compactText(vehicle.modelo);
    const compactBrandModel = compactText(`${vehicle.marca ?? ""} ${vehicle.modelo ?? ""}`);

    if (compactDomain && compactDomain.length >= 5 && compactMessage.includes(compactDomain)) {
      return vehicle;
    }

    if (compactModel && compactModel.length >= 4 && compactMessage.includes(compactModel)) {
      const score = 100 + meaningfulTokens(vehicle.marca).filter((token) => normalizedText.includes(token)).length * 10;
      if (!best || score > best.score) best = { vehicle, score };
      continue;
    }

    const tokens = meaningfulTokens(`${vehicle.marca ?? ""} ${vehicle.modelo ?? ""}`);
    const matchedTokens = tokens.filter((token) => messageTokens.includes(token));
    if (matchedTokens.length >= 2) {
      const score = matchedTokens.length * 20 + (compactBrandModel && compactMessage.includes(compactBrandModel) ? 30 : 0);
      if (!best || score > best.score) best = { vehicle, score };
    } else if (matchedTokens.length === 1 && matchedTokens[0].length >= 4) {
      const sameTokenMatches = vehicles.filter((candidate) =>
        meaningfulTokens(`${candidate.marca ?? ""} ${candidate.modelo ?? ""}`).includes(matchedTokens[0])
      ).length;
      if (sameTokenMatches === 1) {
        if (!best || 45 > best.score) best = { vehicle, score: 45 };
      }
    }
  }

  return best && best.score >= 40 ? best.vehicle : null;
}

export function findVehicleInterestById(
  vehicleId: string | null | undefined,
  vehicles: VehicleInterestCandidate[]
) {
  if (!vehicleId) return null;
  return vehicles.find((vehicle) => vehicle.id === vehicleId) ?? null;
}
