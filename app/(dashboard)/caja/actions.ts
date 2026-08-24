"use server";

import { revalidatePath } from "next/cache";
import { canManageCaja } from "@/lib/auth/permissions";
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

const MONTHS: Record<string, string> = {
  ene: "01",
  feb: "02",
  mar: "03",
  abr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  ago: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dic: "12",
};

function toPeriodDate(value: FormDataEntryValue | null) {
  const raw = toOptionalString(value).toLowerCase().replace(/\./g, "");
  if (!raw) return null;

  const yearMonth = raw.match(/^(\d{4})[-/](\d{1,2})$/);
  if (yearMonth) {
    const month = Number(yearMonth[2]);
    if (month >= 1 && month <= 12) {
      return `${yearMonth[1]}-${String(month).padStart(2, "0")}-01`;
    }
  }

  const monthYear = raw.match(/^([a-záéíóúñ]{3})[-/ ](\d{2,4})$/);
  if (monthYear) {
    const month = MONTHS[monthYear[1].normalize("NFD").replace(/[\u0300-\u036f]/g, "").slice(0, 3)];
    const yearNumber = Number(monthYear[2]);
    if (month && Number.isFinite(yearNumber)) {
      const year = yearNumber < 100 ? 2000 + yearNumber : yearNumber;
      return `${year}-${month}-01`;
    }
  }

  const dateValue = raw.match(/^(\d{4})-(\d{2})-\d{2}$/);
  if (dateValue) {
    return `${dateValue[1]}-${dateValue[2]}-01`;
  }

  return "invalid";
}

export async function createCajaMovimientoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return {
      error: "Modo demo activo: conectá el entorno real para guardar movimientos.",
    };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión expiró. Volvé a iniciar sesión." };
  }

  const { data: employee } = await supabase
    .from("empleados")
    .select("id,rol,activo")
    .eq("id", user.id)
    .maybeSingle<{ id: string; rol: string | null; activo: boolean | null }>();

  if (!employee || employee.activo !== true || !canManageCaja(employee.rol)) {
    return { error: "No tenés permisos para guardar movimientos de caja." };
  }

  const tipo = toLowerTrimmed(formData.get("tipo"));
  const monto = toRequiredNumber(formData.get("importe") ?? formData.get("monto"));
  const moneda = toUpperTrimmed(formData.get("moneda"));
  const fechaInput = toOptionalString(formData.get("fecha"));
  const fecha = fechaInput || new Date().toISOString().slice(0, 10);
  const origenInput = toLowerTrimmed(formData.get("origen"));
  const medioSeleccionado = toLowerTrimmed(formData.get("medio"));
  const medioPersonalizado = toLowerTrimmed(formData.get("medio_personalizado"));
  const medio = medioSeleccionado === "otro" ? medioPersonalizado : medioSeleccionado;
  const concepto = toOptionalString(formData.get("concepto"));
  const detalle1 = toOptionalString(formData.get("detalle_1"));
  const detalle2 = toOptionalString(formData.get("detalle_2"));
  const detalle3 = toOptionalString(formData.get("detalle_3"));
  const periodo = toPeriodDate(formData.get("periodo"));
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
    return { error: "La referencia es obligatoria." };
  }

  if (periodo === "invalid") {
    return { error: "El período debe tener formato 2026-07, 2026-07-01 o jul-26." };
  }

  const { error } = await supabase.from("caja_movimientos").insert({
    tipo,
    origen,
    venta_id: ventaId || null,
    venta_pago_id: ventaPagoId || null,
    medio,
    concepto: concepto || null,
    monto,
    moneda,
    fecha,
    detalle_1: detalle1,
    detalle_2: detalle2 || null,
    detalle_3: detalle3 || null,
    periodo,
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
