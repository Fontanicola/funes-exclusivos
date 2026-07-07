"use server";

import { revalidatePath } from "next/cache";
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

function toRequiredNumber(value: FormDataEntryValue | null) {
  return toOptionalNumber(value);
}

function toUpperTrimmed(value: FormDataEntryValue | null) {
  return toOptionalString(value).toUpperCase();
}

function toLowerTrimmed(value: FormDataEntryValue | null) {
  return toOptionalString(value).toLowerCase();
}

export async function createCajaMovimientoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return {
      error: "Modo demo activo: conectá Supabase para guardar movimientos reales.",
    };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión expiró. Volvé a iniciar sesión." };
  }

  const tipo = toLowerTrimmed(formData.get("tipo"));
  const monto = toRequiredNumber(formData.get("importe") ?? formData.get("monto"));
  const moneda = toUpperTrimmed(formData.get("moneda"));
  const fechaInput = toOptionalString(formData.get("fecha"));
  const fecha = fechaInput || new Date().toISOString().slice(0, 10);
  const origenInput = toLowerTrimmed(formData.get("origen"));
  const medio = toLowerTrimmed(formData.get("medio"));
  const concepto = toOptionalString(formData.get("concepto"));
  const detalle1 = toOptionalString(formData.get("detalle_1"));
  const detalle2 = toOptionalString(formData.get("detalle_2"));
  const detalle3 = toOptionalString(formData.get("detalle_3"));
  const periodo = toOptionalString(formData.get("periodo"));
  const cuenta = toOptionalString(formData.get("cuenta"));
  const ventaId = toOptionalString(formData.get("venta_id"));
  const ventaPagoId = toOptionalString(formData.get("venta_pago_id"));
  const proveedorId = toOptionalString(formData.get("proveedor_id"));
  const activoId = toOptionalString(formData.get("activo_id"));
  const observaciones = toOptionalString(formData.get("observaciones"));
  const origen = ["manual", "venta", "compra", "comision", "ajuste"].includes(origenInput)
    ? origenInput
    : "manual";

  if (!["ingreso", "egreso"].includes(tipo)) {
    return { error: "El tipo de movimiento no es válido." };
  }

  if (!medio) {
    return { error: "El medio es obligatorio." };
  }

  if (monto == null || monto <= 0) {
    return { error: "El monto debe ser mayor a 0." };
  }

  if (!["ARS", "USD"].includes(moneda)) {
    return { error: "La moneda debe ser ARS o USD." };
  }

  if (!detalle1) {
    return { error: "Detalle 1 es obligatorio." };
  }

  const { error } = await supabase.from("caja_movimientos").insert({
    tipo,
    origen,
    venta_id: ventaId || null,
    venta_pago_id: ventaPagoId || null,
    medio,
    concepto: concepto || null,
    monto,
    importe: monto,
    moneda,
    fecha,
    detalle_1: detalle1,
    detalle_2: detalle2 || null,
    detalle_3: detalle3 || null,
    periodo: periodo || null,
    cuenta: cuenta || null,
    proveedor_id: proveedorId || null,
    activo_id: activoId || null,
    observaciones: observaciones || null,
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    return { error: "No pudimos guardar el movimiento. Revisá los datos e intentá de nuevo." };
  }

  revalidatePath("/caja");
  return { success: true };
}
