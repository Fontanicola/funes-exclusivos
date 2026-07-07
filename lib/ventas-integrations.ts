import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  version?: string | null;
  anio?: number | null;
  dominio: string | null;
};

type RunSaleIntegrationsParams = {
  ventaId: string;
  vehiculoId: string;
  fechaVenta: string;
  moneda: string;
  clienteNombre: string;
  observaciones?: string | null;
  initialPayments: GeneratedPaymentEntry[];
  sellerId: string;
  userId: string;
  precioInfoauto?: number | null;
  costoReposicion?: number | null;
  costoHistorico?: number | null;
  importeGestoria?: number | null;
  importeEscribania?: number | null;
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

function parseNumberLike(value: unknown) {
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

async function generateComisionForVenta(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  ventaId: string,
  sellerId: string
) {
  const [empleadoResult, configuracionResult] = await Promise.all([
    supabase.from("empleados").select("comision_default_porcentaje").eq("id", sellerId).maybeSingle(),
    supabase.from("configuracion_general").select("porcentaje_comision_default").eq("id", true).maybeSingle(),
  ]);

  const sellerPercent = toSafeNumber(
    (empleadoResult.data as { comision_default_porcentaje?: unknown } | null)?.comision_default_porcentaje
  );
  const configPercent = toSafeNumber(
    (configuracionResult.data as { porcentaje_comision_default?: unknown } | null)?.porcentaje_comision_default
  );
  const commissionPercent = sellerPercent ?? configPercent ?? 1;
  const { error } = await supabase.rpc("generar_comision_por_venta", {
    venta_id: ventaId,
    porcentaje: commissionPercent,
  });

  if (error) {
    console.error("[ventas] No se pudo generar la comisión automática:", error.message);
    return false;
  }

  return true;
}

async function createVentaPagos(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  params: {
    ventaId: string;
    initialPayments: GeneratedPaymentEntry[];
    userId: string;
  }
) {
  if (!params.initialPayments.length) {
    return { insertedPayments: [] as Array<Record<string, any>> };
  }

  const paymentRows = params.initialPayments.map((payment) => ({
    venta_id: params.ventaId,
    tipo: payment.tipo,
    fecha: payment.fecha,
    medio: payment.medio,
    importe: payment.importe,
    moneda: payment.moneda,
    detalle: payment.detalle,
    created_by: params.userId,
    updated_by: params.userId,
  }));

  const { data, error } = await supabase
    .from("ventas_pagos")
    .insert(paymentRows)
    .select("id,tipo,importe,moneda,medio,fecha,detalle");

  if (error) {
    return { error: "No pudimos registrar los pagos iniciales. Revisá los datos e intentá de nuevo." };
  }

  return { insertedPayments: (data ?? []) as Array<Record<string, any>> };
}

async function createCajaMovimientosFromPagos(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  params: {
    ventaId: string;
    fechaVenta: string;
    moneda: string;
    clienteNombre: string;
    userId: string;
    payments: Array<Record<string, any>>;
    vehicleSummary: VentaVehiculo | null;
  }
) {
  const saleCashPayments = params.payments.filter((payment) =>
    shouldGenerateCashMovement(String(payment?.tipo ?? payment?.medio ?? ""))
  );

  if (!saleCashPayments.length) {
    return { success: true };
  }

  const vehicleLabel = buildVehicleSummaryLabel(params.vehicleSummary);
  const cajaRows = saleCashPayments.map((payment) => ({
    origen: "venta",
    venta_id: params.ventaId,
    venta_pago_id: payment.id,
    tipo: "ingreso",
    monto: parseNumberLike(payment?.importe) ?? 0,
    importe: parseNumberLike(payment?.importe) ?? 0,
    moneda: payment?.moneda ?? params.moneda,
    fecha: params.fechaVenta,
    medio: payment?.medio ?? payment?.tipo,
    concepto: "Venta de vehículo",
    detalle_1: `${params.clienteNombre} · ${vehicleLabel}`,
    detalle_2: formatPaymentLabel(String(payment?.tipo ?? payment?.medio ?? "")),
    detalle_3: params.vehicleSummary?.dominio ?? null,
    created_by: params.userId,
    updated_by: params.userId,
  }));

  const { error } = await supabase.from("caja_movimientos").insert(cajaRows);
  if (error) {
    return { error: "No pudimos generar los movimientos de caja. Revisá los datos e intentá de nuevo." };
  }

  return { success: true };
}

async function createVentaEntregaIfMissing(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  params: {
    ventaId: string;
    observaciones?: string | null;
    precioInfoauto?: number | null;
    costoReposicion?: number | null;
    costoHistorico?: number | null;
    importeGestoria?: number | null;
    importeEscribania?: number | null;
    userId: string;
  }
) {
  const entregaPayload = {
    venta_id: params.ventaId,
    estado: "pendiente",
    fecha_entrega: null,
    status_informe_vu: null,
    usado_credito: null,
    usado_informe_dominio: null,
    usado_multas: null,
    usado_patentes: null,
    usado_observaciones: null,
    observaciones: params.observaciones ?? null,
    precio_infoauto: params.precioInfoauto,
    costo_reposicion: params.costoReposicion,
    costo_historico: params.costoHistorico,
    importe_gestoria: params.importeGestoria,
    importe_escribania: params.importeEscribania,
    created_by: params.userId,
    updated_by: params.userId,
  };

  const { error } = await supabase.from("ventas_entregas").insert(entregaPayload);
  if (error && error.code !== "23505") {
    return { error: "No pudimos crear la entrega pendiente. Revisá los datos e intentá de nuevo." };
  }

  return { success: true };
}

async function createSaleIntegrations(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  params: RunSaleIntegrationsParams
) {
  const vehiculoResult = await supabase
    .from("vehiculos")
    .select("marca,modelo,version,anio,dominio")
    .eq("id", params.vehiculoId)
    .maybeSingle();

  const vehicleSummary = (vehiculoResult.data ?? null) as VentaVehiculo | null;

  const paymentsResult = await createVentaPagos(supabase, {
    ventaId: params.ventaId,
    initialPayments: params.initialPayments,
    userId: params.userId,
  });

  if ("error" in paymentsResult) {
    return paymentsResult;
  }

  const cajaResult = await createCajaMovimientosFromPagos(supabase, {
    ventaId: params.ventaId,
    fechaVenta: params.fechaVenta,
    moneda: params.moneda,
    clienteNombre: params.clienteNombre,
    userId: params.userId,
    payments: paymentsResult.insertedPayments,
    vehicleSummary,
  });

  if ("error" in cajaResult) {
    return cajaResult;
  }

  const entregaResult = await createVentaEntregaIfMissing(supabase, {
    ventaId: params.ventaId,
    observaciones: params.observaciones ?? null,
    precioInfoauto: params.precioInfoauto,
    costoReposicion: params.costoReposicion,
    costoHistorico: params.costoHistorico,
    importeGestoria: params.importeGestoria,
    importeEscribania: params.importeEscribania,
    userId: params.userId,
  });

  if ("error" in entregaResult) {
    return entregaResult;
  }

  await generateComisionForVenta(supabase, params.ventaId, params.sellerId);

  return { success: true };
}

export {
  buildPermutaPayload,
  buildPaymentEntries,
  buildVehicleSummaryLabel,
  createCajaMovimientosFromPagos,
  createSaleIntegrations,
  createVentaEntregaIfMissing,
  createVentaPagos,
  extractVentaId,
  formatPaymentLabel,
  generateComisionForVenta,
  shouldGenerateCashMovement,
  toLowerTrimmed,
  toOptionalNumber,
  toOptionalString,
  toSafeNumber,
  toUpperTrimmed,
};
