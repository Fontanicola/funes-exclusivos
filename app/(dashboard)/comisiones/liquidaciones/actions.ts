"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
  success?: boolean;
  warning?: string;
};

type LiquidacionVendedor = {
  id: string;
  nombre: string | null;
  email: string | null;
};

type Liquidacion = {
  id: string;
  vendedor_id: string | null;
  periodo: string | null;
  estado: string | null;
  moneda: string | null;
  neto_a_cobrar: number | null;
  fecha_pago: string | null;
  fecha_cierre: string | null;
  vendedor: LiquidacionVendedor | LiquidacionVendedor[] | null;
};

function toStringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function toNumberValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeSingleRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function formatPeriodLabel(period: string | null) {
  const raw = toStringValue(period);
  if (!raw) return "Sin período";

  const match = raw.match(/^(\d{4})-(\d{2})$/);
  if (!match) return raw;

  return `${match[2]}/${match[1]}`;
}

async function ensureAdmin(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión expiró. Volvé a iniciar sesión." } as const;
  }

  const { data: employee } = await supabase
    .from("empleados")
    .select("id,rol,activo")
    .eq("id", user.id)
    .maybeSingle<{ id: string; rol: string | null; activo: boolean | null }>();

  if (!(employee && employee.activo === true && employee.rol === "admin")) {
    return { error: "No tenés permisos para administrar liquidaciones." } as const;
  }

  return { user } as const;
}

async function fetchLiquidacion(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  liquidacionId: string
) {
  const { data, error } = await supabase
    .from("comision_liquidaciones")
    .select(
      "id,vendedor_id,periodo,estado,moneda,neto_a_cobrar,fecha_pago,fecha_cierre,vendedor:empleados!comision_liquidaciones_vendedor_id_fkey(id,nombre,email)"
    )
    .eq("id", liquidacionId)
    .maybeSingle<Liquidacion>();

  if (error || !data) {
    return { error: "No pudimos encontrar la liquidación." } as const;
  }

  return {
    liquidacion: {
      ...data,
      vendedor: normalizeSingleRelation(data.vendedor),
    },
  } as const;
}

export async function updateLiquidacionEstadoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar cambios reales." };
  }

  const supabase = createSupabaseServerClient();
  const authResult = await ensureAdmin(supabase);

  if ("error" in authResult) {
    return { error: authResult.error };
  }

  const liquidacionId = toStringValue(formData.get("liquidacion_id"));
  const nextEstado = toStringValue(formData.get("estado")).toLowerCase();
  const medioCaja = toStringValue(formData.get("medio_caja"));
  const cuentaCaja = toStringValue(formData.get("cuenta_caja")) || null;
  const conceptoCaja = toStringValue(formData.get("concepto_caja")) || "Pago de comisión";

  if (!liquidacionId) {
    return { error: "Debés seleccionar una liquidación." };
  }

  if (!["borrador", "cerrada", "anulada", "pagada"].includes(nextEstado)) {
    return { error: "El estado de la liquidación no es válido." };
  }

  const liquidacionResult = await fetchLiquidacion(supabase, liquidacionId);
  if ("error" in liquidacionResult) {
    return { error: liquidacionResult.error };
  }

  const liquidacion = liquidacionResult.liquidacion;
  const currentState = toStringValue(liquidacion.estado).toLowerCase();
  const neto = liquidacion.neto_a_cobrar ?? 0;

  if (currentState === "anulada") {
    return { error: "No se pueden modificar liquidaciones anuladas." };
  }

  if (currentState === "pagada") {
    return { error: "La liquidación ya está pagada." };
  }

  const currentDate = new Date().toISOString().slice(0, 10);

  if (nextEstado === "pagada") {
    if (!medioCaja) {
      return { error: "Debés indicar el medio de caja para pagar la liquidación." };
    }

    if (neto <= 0) {
      return { error: "La liquidación no tiene neto positivo para pagar." };
    }

    const { error: updateError } = await supabase
      .from("comision_liquidaciones")
      .update({
        estado: "pagada",
        fecha_pago: currentDate,
        updated_by: authResult.user.id,
      })
      .eq("id", liquidacion.id);

    if (updateError) {
      return { error: "No pudimos marcar la liquidación como pagada." };
    }

    const vendorLabel = [liquidacion.vendedor?.nombre, liquidacion.vendedor?.email]
      .filter(Boolean)
      .join(" · ") || "Vendedor";

    const { error: cajaError } = await supabase.from("caja_movimientos").insert({
      origen: "comision",
      comision_liquidacion_id: liquidacion.id,
      tipo: "egreso",
      monto: neto,
      importe: neto,
      moneda: liquidacion.moneda ?? "ARS",
      fecha: currentDate,
      medio: medioCaja,
      cuenta: cuentaCaja,
      concepto: conceptoCaja,
      detalle_1: vendorLabel,
      detalle_2: formatPeriodLabel(liquidacion.periodo),
      detalle_3: "Comisión vendedores",
      created_by: authResult.user.id,
      updated_by: authResult.user.id,
    });

    if (cajaError) {
      if (cajaError.code === "23505") {
        return { error: "Esta liquidación ya tiene un movimiento de caja asociado." };
      }

      console.error("[comisiones] No se pudo generar el movimiento de caja de la liquidación:", cajaError.message);
      return { error: "No pudimos generar el movimiento de caja de la liquidación." };
    }
  } else if (nextEstado === "cerrada") {
    const { error: updateError } = await supabase
      .from("comision_liquidaciones")
      .update({
        estado: "cerrada",
        fecha_cierre: currentDate,
        updated_by: authResult.user.id,
      })
      .eq("id", liquidacion.id);

    if (updateError) {
      return { error: "No pudimos cerrar la liquidación." };
    }
  } else if (nextEstado === "anulada") {
    const { error: updateError } = await supabase
      .from("comision_liquidaciones")
      .update({
        estado: "anulada",
        updated_by: authResult.user.id,
      })
      .eq("id", liquidacion.id);

    if (updateError) {
      return { error: "No pudimos anular la liquidación." };
    }
  } else if (nextEstado === "borrador") {
    const { error: updateError } = await supabase
      .from("comision_liquidaciones")
      .update({
        estado: "borrador",
        updated_by: authResult.user.id,
      })
      .eq("id", liquidacion.id);

    if (updateError) {
      return { error: "No pudimos volver la liquidación a borrador." };
    }
  }

  revalidatePath("/comisiones");
  revalidatePath("/comisiones/liquidaciones");
  revalidatePath(`/comisiones/liquidaciones/${liquidacion.id}`);
  revalidatePath("/caja");
  revalidatePath("/dashboard");

  redirect(`/comisiones/liquidaciones/${liquidacion.id}`);
}
