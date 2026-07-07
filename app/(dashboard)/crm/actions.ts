"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
  success?: boolean;
};

function toOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function toOptionalNumber(value: FormDataEntryValue | null) {
  const raw = toOptionalString(value);
  if (!raw) return null;
  const parsed = Number(raw.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function toLowerTrimmed(value: FormDataEntryValue | null) {
  return toOptionalString(value).toLowerCase();
}

function toUpperTrimmed(value: FormDataEntryValue | null) {
  return toOptionalString(value).toUpperCase();
}

export async function createLeadAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar cambios reales." };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión expiró. Volvé a iniciar sesión." };
  }

  const nombre = toOptionalString(formData.get("nombre"));
  const telefono = toOptionalString(formData.get("telefono"));
  const email = toOptionalString(formData.get("email"));
  const documento = toOptionalString(formData.get("documento"));
  const origen = toLowerTrimmed(formData.get("origen"));
  const estado = toLowerTrimmed(formData.get("estado")) || "nuevo";
  const vehiculoInteresId = toOptionalString(formData.get("vehiculo_interes_id"));
  const vendedorId = toOptionalString(formData.get("vendedor_id"));
  const presupuestoMin = toOptionalNumber(formData.get("presupuesto_min"));
  const presupuestoMax = toOptionalNumber(formData.get("presupuesto_max"));
  const presupuestoMoneda = toUpperTrimmed(formData.get("presupuesto_moneda"));
  const nivelInteres = toOptionalNumber(formData.get("nivel_interes"));
  const proximoContactoInput = toOptionalString(formData.get("proximo_contacto"));
  const proximoContacto = proximoContactoInput || null;
  const notas = toOptionalString(formData.get("notas"));

  if (!nombre) return { error: "El nombre del lead es obligatorio." };
  if (!origen) return { error: "El origen del lead es obligatorio." };
  if (!["nuevo", "contactado", "interesado", "negociacion", "reservado", "ganado", "perdido"].includes(estado)) {
    return { error: "El estado del lead no es válido." };
  }
  if (!["ARS", "USD"].includes(presupuestoMoneda)) {
    return { error: "La moneda del presupuesto debe ser ARS o USD." };
  }
  if (nivelInteres != null && (nivelInteres < 1 || nivelInteres > 5)) {
    return { error: "El nivel de interés debe estar entre 1 y 5." };
  }

  const { error } = await supabase.from("leads").insert({
    nombre,
    telefono: telefono || null,
    email: email || null,
    documento: documento || null,
    origen,
    estado,
    vehiculo_interes_id: vehiculoInteresId || null,
    vendedor_id: vendedorId || null,
    presupuesto_min: presupuestoMin,
    presupuesto_max: presupuestoMax,
    presupuesto_moneda: presupuestoMoneda,
    nivel_interes: nivelInteres,
    proximo_contacto: proximoContacto,
    notas: notas || null,
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    return { error: "No pudimos guardar el lead. Revisá los datos e intentá de nuevo." };
  }

  revalidatePath("/crm");
  redirect("/crm");
}

export async function createLeadInteractionAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar cambios reales." };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión expiró. Volvé a iniciar sesión." };
  }

  const leadId = toOptionalString(formData.get("lead_id"));
  const tipo = toLowerTrimmed(formData.get("tipo"));
  const titulo = toOptionalString(formData.get("titulo"));
  const contenido = toOptionalString(formData.get("contenido"));

  if (!leadId) return { error: "El lead es obligatorio." };
  if (!tipo) return { error: "El tipo de interacción es obligatorio." };
  if (!contenido) return { error: "El contenido es obligatorio." };

  const { error } = await supabase.from("lead_interacciones").insert({
    lead_id: leadId,
    tipo,
    titulo: titulo || null,
    contenido,
    created_by: user.id,
  });

  if (error) {
    return { error: "No pudimos guardar la interacción. Intentá de nuevo." };
  }

  revalidatePath(`/crm/${leadId}`);
  return { success: true };
}
