"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
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

function toRequiredNumber(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = toOptionalNumber(value);
  return parsed ?? fallback;
}

function toUpperTrimmed(value: FormDataEntryValue | null) {
  return toOptionalString(value).toUpperCase();
}

async function getCurrentEmployee(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tu sesión expiró. Volvé a iniciar sesión." as const };

  const { data: employee } = await supabase
    .from("empleados")
    .select("id,rol,activo")
    .eq("id", user.id)
    .maybeSingle<{ id: string; rol: string | null; activo: boolean | null }>();

  if (!employee || employee.activo !== true) {
    return { error: "No tenés permisos para registrar compras." as const };
  }

  if (!["admin", "gestor"].includes(employee.rol ?? "")) {
    return { error: "No tenés permisos para registrar compras." as const };
  }

  return { user, employee };
}

export async function createCompraVehiculoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar compras reales." };
  }

  const supabase = createSupabaseServerClient();
  const authResult = await getCurrentEmployee(supabase);
  if ("error" in authResult) {
    return { error: authResult.error };
  }

  const fechaInput = toOptionalString(formData.get("fecha"));
  const fecha = fechaInput || new Date().toISOString().slice(0, 10);
  const nroOperacion = toOptionalString(formData.get("nro_operacion")) || null;
  const proveedorId = toOptionalString(formData.get("proveedor_id")) || null;
  const moneda = toUpperTrimmed(formData.get("moneda"));
  const precioCompra = toOptionalNumber(formData.get("precio_compra"));
  const precioBoleto = toOptionalNumber(formData.get("precio_boleto"));
  const diferenciaB = toOptionalNumber(formData.get("diferencia_b"));
  const deudaPendiente = toOptionalNumber(formData.get("deuda_pendiente"));
  const observacionesCompra = toOptionalString(formData.get("observaciones")) || null;

  const marca = toOptionalString(formData.get("marca"));
  const modelo = toOptionalString(formData.get("modelo"));
  const version = toOptionalString(formData.get("version")) || null;
  const anio = toOptionalNumber(formData.get("anio"));
  const color = toOptionalString(formData.get("color")) || null;
  const km = toRequiredNumber(formData.get("km"), 0);
  const dominio = toUpperTrimmed(formData.get("dominio")) || null;
  const motor = toOptionalString(formData.get("motor")) || null;
  const ubicacion = toOptionalString(formData.get("ubicacion")) || null;
  const precioInfoautoCompra = toOptionalNumber(formData.get("precio_infoauto_compra"));
  const precioInfoautoActual = toOptionalNumber(formData.get("precio_infoauto_actual"));
  const precioPermuta = toOptionalNumber(formData.get("precio_permuta"));
  const precioContado = toOptionalNumber(formData.get("precio_contado"));
  const precioVenta = toOptionalNumber(formData.get("precio_venta"));
  const costoReposicion = toOptionalNumber(formData.get("costo_reposicion"));
  const estadoPreparacion = toOptionalString(formData.get("estado_preparacion")) || "sin_preparar";
  const observacionesVehiculo = toOptionalString(formData.get("observaciones_vehiculo")) || null;
  const generarMovimientoCaja = formData.get("generar_movimiento_caja") !== null;
  const montoPagadoCaja = toOptionalNumber(formData.get("monto_pagado_caja"));
  const medioCaja = toOptionalString(formData.get("medio_caja")) || null;
  const cuentaCaja = toOptionalString(formData.get("cuenta_caja")) || null;
  const conceptoCaja = toOptionalString(formData.get("concepto_caja")) || "Compra de vehículo";

  if (!marca || !modelo) return { error: "Marca y modelo son obligatorios." };
  if (!["ARS", "USD"].includes(moneda)) return { error: "La moneda debe ser ARS o USD." };
  if (precioCompra == null || precioCompra < 0) return { error: "El precio de compra es obligatorio." };
  if (!["sin_preparar", "pendiente", "en proceso", "listo"].includes(estadoPreparacion)) {
    return { error: "El estado de preparación no es válido." };
  }
  if (generarMovimientoCaja && (montoPagadoCaja == null || montoPagadoCaja <= 0)) {
    return { error: "El monto pagado para Caja debe ser mayor a 0." };
  }

  const vehiclePayload = {
    marca,
    modelo,
    version: version || null,
    anio: anio ?? null,
    color,
    km,
    dominio,
    motor,
    ubicacion,
    nro_operacion: nroOperacion,
    proveedor_id: proveedorId,
    fecha_compra: fecha,
    costo_adquisicion: precioCompra,
    costo_moneda: moneda,
    precio_venta: precioVenta,
    precio_moneda: moneda,
    precio_infoauto_compra: precioInfoautoCompra,
    precio_infoauto_actual: precioInfoautoActual,
    precio_permuta: precioPermuta,
    precio_contado: precioContado,
    costo_reposicion: costoReposicion,
    estado: "en_stock",
    estado_preparacion: estadoPreparacion,
    chapero: null,
    preparacion_comentarios: observacionesVehiculo,
    publicado_mercadolibre: false,
    publicado_rodados_google: false,
    fotos: [],
    fecha_ingreso: fecha,
    descripcion: null,
    observaciones: observacionesVehiculo,
    created_by: authResult.user.id,
    updated_by: authResult.user.id,
  };

  const { data: vehicleData, error: vehicleError } = await supabase
    .from("vehiculos")
    .insert(vehiclePayload)
    .select("id")
    .single<{ id: string }>();

  if (vehicleError || !vehicleData?.id) {
    return { error: "No pudimos crear el vehículo en Inventario." };
  }

  const vehiculoId = vehicleData.id;

  const { data: compraData, error: compraError } = await supabase
    .from("compras_vehiculos")
    .insert({
      vehiculo_id: vehiculoId,
      proveedor_id: proveedorId,
      fecha,
      nro_operacion: nroOperacion,
      precio_compra: precioCompra,
      precio_boleto: precioBoleto,
      moneda,
      diferencia_b: diferenciaB,
      deuda_pendiente: deudaPendiente,
      observaciones: observacionesCompra,
      created_by: authResult.user.id,
      updated_by: authResult.user.id,
    })
    .select("id")
    .single<{ id: string }>();

  if (compraError || !compraData?.id) {
    return { error: "No pudimos registrar la compra. Revisá los datos e intentá de nuevo." };
  }

  const { error: gastoError } = await supabase.from("vehiculo_gastos").insert({
    vehiculo_id: vehiculoId,
    proveedor_id: proveedorId,
    tipo: "compra",
    concepto: "Compra de vehículo",
    importe: precioCompra,
    moneda,
    fecha,
    observaciones: observacionesCompra,
    created_by: authResult.user.id,
    updated_by: authResult.user.id,
  });

  if (gastoError) {
    return { error: "La compra quedó incompleta al registrar el gasto. Volvé a intentar." };
  }

  if (generarMovimientoCaja) {
    const { data: proveedorData } = proveedorId
      ? await supabase.from("proveedores").select("nombre,categoria").eq("id", proveedorId).maybeSingle()
      : { data: null };

    const detalle1 = [marca, modelo, dominio].filter(Boolean).join(" ");
    const detalle2 =
      proveedorData?.nombre
        ? proveedorData.categoria
          ? `${proveedorData.nombre} · ${proveedorData.categoria}`
          : proveedorData.nombre
        : null;
    const detalle3 = nroOperacion || null;

    const { error: cajaError } = await supabase.from("caja_movimientos").insert({
      origen: "compra",
      compra_id: compraData.id,
      tipo: "egreso",
      monto: montoPagadoCaja,
      importe: montoPagadoCaja,
      moneda,
      fecha,
      medio: medioCaja || "otro",
      concepto: conceptoCaja || "Compra de vehículo",
      cuenta: cuentaCaja,
      detalle_1: detalle1,
      detalle_2: detalle2,
      detalle_3: detalle3,
      proveedor_id: proveedorId,
      activo_id: null,
      created_by: authResult.user.id,
      updated_by: authResult.user.id,
    });

    if (cajaError) {
      return { error: "No pudimos generar el movimiento de caja de la compra." };
    }
  }

  revalidatePath("/compras");
  revalidatePath("/inventario");
  revalidatePath("/caja");
  revalidatePath("/dashboard");
  redirect("/compras");
}
