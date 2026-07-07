"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
};

type GeneratedPaymentEntry = {
  tipo: string;
  medio: string;
  importe: number;
  moneda: string;
  fecha: string;
  detalle: string;
};

type VentaVehiculo = {
  marca: string | null;
  modelo: string | null;
  version: string | null;
  anio: number | null;
  dominio: string | null;
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

function toSafeNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function buildPermutaPayload(formData: FormData) {
  const permutaMarca = toOptionalString(formData.get("permuta_marca"));
  const permutaModelo = toOptionalString(formData.get("permuta_modelo"));
  const permutaVersion = toOptionalString(formData.get("permuta_version"));
  const permutaAnio = toOptionalNumber(formData.get("permuta_anio"));
  const permutaColor = toOptionalString(formData.get("permuta_color"));
  const permutaKm = toOptionalNumber(formData.get("permuta_km")) ?? 0;
  const permutaDominio = toUpperTrimmed(formData.get("permuta_dominio"));
  const permutaPrecioVenta = toOptionalNumber(formData.get("permuta_precio_venta"));
  const permutaPrecioMoneda = toUpperTrimmed(formData.get("permuta_precio_moneda"));
  const permutaObservaciones = toOptionalString(formData.get("permuta_observaciones"));
  const montoPermuta = toOptionalNumber(formData.get("monto_permuta"));

  if (!permutaMarca || !permutaModelo) {
    return { error: "La permuta requiere marca y modelo." as const };
  }

  if (!["ARS", "USD"].includes(permutaPrecioMoneda)) {
    return { error: "La moneda de la permuta debe ser ARS o USD." as const };
  }

  if (montoPermuta == null) {
    return { error: "El monto de permuta es obligatorio." as const };
  }

  return {
    payload: {
      marca: permutaMarca,
      modelo: permutaModelo,
      version: permutaVersion || null,
      anio: permutaAnio ?? null,
      color: permutaColor || null,
      km: permutaKm,
      dominio: permutaDominio || null,
      precio_venta: permutaPrecioVenta,
      precio_moneda: permutaPrecioMoneda,
      observaciones: permutaObservaciones || null,
    },
    montoPermuta,
  };
}

function buildPaymentEntries(formData: FormData, moneda: string, fechaVenta: string) {
  const entries: Array<GeneratedPaymentEntry> = [
    {
      tipo: "sena",
      medio: "sena",
      importe: toOptionalNumber(formData.get("pago_senia")) ?? toOptionalNumber(formData.get("pago_sena")) ?? 0,
      moneda,
      fecha: fechaVenta,
      detalle: "Seña inicial",
    },
    {
      tipo: "efectivo",
      medio: "efectivo",
      importe: toOptionalNumber(formData.get("pago_efectivo")) ?? 0,
      moneda,
      fecha: fechaVenta,
      detalle: "Cobro en efectivo",
    },
    {
      tipo: "transferencia",
      medio: "transferencia",
      importe: toOptionalNumber(formData.get("pago_transferencia")) ?? 0,
      moneda,
      fecha: fechaVenta,
      detalle: "Cobro por transferencia",
    },
    {
      tipo: "credito",
      medio: "credito",
      importe: toOptionalNumber(formData.get("pago_credito")) ?? 0,
      moneda,
      fecha: fechaVenta,
      detalle: "Pago a crédito",
    },
    {
      tipo: "usado",
      medio: "usado",
      importe: toOptionalNumber(formData.get("pago_usado")) ?? 0,
      moneda,
      fecha: fechaVenta,
      detalle: "Entrega de usado recibido",
    },
  ];

  return entries.filter((entry) => entry.importe > 0);
}

function formatPaymentLabel(tipo: string) {
  switch (tipo) {
    case "sena":
      return "Seña";
    case "efectivo":
      return "Efectivo";
    case "transferencia":
      return "Transferencia";
    case "credito":
      return "Crédito";
    case "usado":
      return "Usado";
    default:
      return tipo;
  }
}

function buildVehicleSummaryLabel(vehiculo: VentaVehiculo | null) {
  if (!vehiculo) return "Vehículo vendido";

  const parts = [vehiculo.marca, vehiculo.modelo].filter(Boolean);
  if (!parts.length) return "Vehículo vendido";

  return parts.join(" ");
}

function shouldGenerateCashMovement(paymentType: string) {
  return ["sena", "efectivo", "transferencia", "credito"].includes(paymentType);
}

function extractVentaId(data: unknown) {
  if (!data) return null;
  if (Array.isArray(data)) {
    const [first] = data;
    if (first && typeof first === "object" && "id" in first) return String((first as { id?: unknown }).id ?? "");
    if (first && typeof first === "object" && "venta_id" in first) {
      return String((first as { venta_id?: unknown }).venta_id ?? "");
    }
    return null;
  }

  if (typeof data === "object") {
    if ("id" in data) return String((data as { id?: unknown }).id ?? "");
    if ("venta_id" in data) return String((data as { venta_id?: unknown }).venta_id ?? "");
  }

  return null;
}

export async function createVentaAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar cambios." };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión expiró. Volvé a iniciar sesión." };
  }

  const vehiculoId = toOptionalString(formData.get("vehiculo_id"));
  const clienteNombre = toOptionalString(formData.get("cliente_nombre"));
  const clienteTelefono = toOptionalString(formData.get("cliente_telefono"));
  const clienteEmail = toOptionalString(formData.get("cliente_email"));
  const clienteDocumento = toOptionalString(formData.get("cliente_documento"));
  const fechaVentaInput = toOptionalString(formData.get("fecha_venta"));
  const fechaVenta = fechaVentaInput || new Date().toISOString().slice(0, 10);
  const precioVenta = toRequiredNumber(formData.get("precio_venta"));
  const moneda = toUpperTrimmed(formData.get("moneda"));
  const metodoPago = toLowerTrimmed(formData.get("metodo_pago"));
  const observaciones = toOptionalString(formData.get("observaciones"));
  const precioInfoauto = toOptionalNumber(formData.get("precio_infoauto"));
  const costoReposicion = toOptionalNumber(formData.get("costo_reposicion"));
  const costoHistorico = toOptionalNumber(formData.get("costo_historico"));
  const importeGestoria = toOptionalNumber(formData.get("importe_gestoria"));
  const importeEscribania = toOptionalNumber(formData.get("importe_escribania"));

  if (!vehiculoId) return { error: "Debés seleccionar un vehículo." };
  if (!clienteNombre) return { error: "El nombre del cliente es obligatorio." };
  if (precioVenta == null) return { error: "El precio de venta es obligatorio." };
  if (!["ARS", "USD"].includes(moneda)) {
    return { error: "La moneda debe ser ARS o USD." };
  }
  if (!["transferencia", "efectivo", "dolares", "pesos", "permuta"].includes(metodoPago)) {
    return { error: "El método de pago no es válido." };
  }

  let montoPermuta: number | null = null;
  let vehiculoRecibido: Record<string, unknown> | null = null;
  const initialPayments = buildPaymentEntries(formData, moneda, fechaVenta);

  if (metodoPago === "permuta") {
    const permuta = buildPermutaPayload(formData);
    if ("error" in permuta) {
      return { error: permuta.error };
    }

    montoPermuta = permuta.montoPermuta;
    vehiculoRecibido = permuta.payload;
  }

  const rpcResult = await supabase.rpc("registrar_venta", {
    p_vehiculo_id: vehiculoId,
    p_cliente_nombre: clienteNombre,
    p_cliente_telefono: clienteTelefono || null,
    p_cliente_email: clienteEmail || null,
    p_cliente_documento: clienteDocumento || null,
    p_fecha_venta: fechaVenta,
    p_precio_venta: precioVenta,
    p_moneda: moneda,
    p_metodo_pago: metodoPago,
    p_observaciones: observaciones || null,
    p_monto_permuta: montoPermuta,
    p_vehiculo_recibido: vehiculoRecibido,
  });

  if (rpcResult.error) {
    return { error: "No pudimos registrar la venta. Revisá los datos e intentá de nuevo." };
  }

  const rpcId = extractVentaId(rpcResult.data);

  const ventaId =
    rpcId ||
    (await (async () => {
      const { data: latest } = await supabase
        .from("ventas")
        .select("id")
        .eq("vehiculo_id", vehiculoId)
        .eq("cliente_nombre", clienteNombre)
        .eq("fecha_venta", fechaVenta)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return latest?.id ?? null;
    })());

  if (ventaId) {
    const [vehiculoResult, empleadoResult, configuracionResult] = await Promise.all([
      supabase
        .from("vehiculos")
        .select("marca,modelo,version,anio,dominio")
        .eq("id", vehiculoId)
        .maybeSingle(),
      supabase
        .from("empleados")
        .select("comision_default_porcentaje")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("configuracion_general")
        .select("porcentaje_comision_default")
        .eq("id", true)
        .maybeSingle(),
    ]);

    const vehicleSummary = (vehiculoResult.data ?? null) as VentaVehiculo | null;

    if (initialPayments.length) {
      const paymentRows = initialPayments.map((payment) => ({
        venta_id: ventaId,
        tipo: payment.tipo,
        fecha: payment.fecha,
        medio: payment.medio,
        importe: payment.importe,
        moneda: payment.moneda,
        detalle: payment.detalle,
        created_by: user.id,
        updated_by: user.id,
      }));

      const { data: insertedPayments, error: paymentError } = await supabase
        .from("ventas_pagos")
        .insert(paymentRows)
        .select("id,tipo,importe,moneda,medio,fecha,detalle");

      if (paymentError) {
        return { error: "No pudimos registrar los pagos iniciales. Revisá los datos e intentá de nuevo." };
      }

      const vehicleLabel = buildVehicleSummaryLabel(vehicleSummary);
      const paymentEntries = (insertedPayments ?? []) as Array<{
        id: string;
        tipo: string;
        importe: number | null;
        moneda: string | null;
        medio: string | null;
        fecha: string | null;
        detalle: string | null;
      }>;
      const saleCashPayments = paymentEntries.filter((payment) =>
        shouldGenerateCashMovement(payment.tipo ?? payment.medio ?? "")
      );

      if (saleCashPayments.length) {
        const cajaRows = saleCashPayments.map((payment) => ({
          origen: "venta",
          venta_id: ventaId,
          venta_pago_id: payment.id,
          tipo: "ingreso",
          monto: payment.importe ?? 0,
          importe: payment.importe ?? 0,
          moneda: payment.moneda ?? moneda,
          fecha: fechaVenta,
          medio: payment.medio ?? payment.tipo,
          concepto: "Venta de vehículo",
          detalle_1: `${clienteNombre} · ${vehicleLabel}`,
          detalle_2: formatPaymentLabel(payment.tipo ?? payment.medio ?? ""),
          detalle_3: vehicleSummary?.dominio ?? null,
          created_by: user.id,
          updated_by: user.id,
        }));

        const { error: cajaError } = await supabase.from("caja_movimientos").insert(cajaRows);
        if (cajaError) {
          return {
            error: "No pudimos generar los movimientos de caja. Revisá los datos e intentá de nuevo.",
          };
        }
      }
    }

    const entregaPayload = {
      venta_id: ventaId,
      estado: "pendiente",
      fecha_entrega: null,
      status_informe_vu: null,
      usado_credito: null,
      usado_informe_dominio: null,
      usado_multas: null,
      usado_patentes: null,
      usado_observaciones: null,
      observaciones: observaciones || null,
      precio_infoauto: precioInfoauto,
      costo_reposicion: costoReposicion,
      costo_historico: costoHistorico,
      importe_gestoria: importeGestoria,
      importe_escribania: importeEscribania,
      created_by: user.id,
      updated_by: user.id,
    };

    const { error: entregaError } = await supabase.from("ventas_entregas").insert(entregaPayload);

    if (entregaError && entregaError.code !== "23505") {
      return { error: "No pudimos crear la entrega pendiente. Revisá los datos e intentá de nuevo." };
    }

    const sellerPercent = toSafeNumber(
      (empleadoResult.data as { comision_default_porcentaje?: unknown } | null)?.comision_default_porcentaje
    );
    const configPercent = toSafeNumber(
      (configuracionResult.data as { porcentaje_comision_default?: unknown } | null)?.porcentaje_comision_default
    );
    const commissionPercent = sellerPercent ?? configPercent ?? 1;
    const { error: commissionError } = await supabase.rpc("generar_comision_por_venta", {
      venta_id: ventaId,
      porcentaje: commissionPercent,
    });

    if (commissionError) {
      console.error("[ventas] No se pudo generar la comisión automática:", commissionError.message);
    } else {
      revalidatePath("/comisiones");
    }
  }

  revalidatePath("/ventas");
  revalidatePath("/ventas/renta");
  revalidatePath("/ventas/pendientes-entrega");
  revalidatePath("/caja");
  revalidatePath("/comisiones");
  revalidatePath("/dashboard");
  revalidatePath("/inventario");
  redirect("/ventas");
}
