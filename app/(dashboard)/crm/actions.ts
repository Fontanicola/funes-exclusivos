"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canManageSales } from "@/lib/auth/permissions";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildPaymentEntries,
  buildPermutaPayload,
  createSaleIntegrations,
  extractVentaId,
  toLowerTrimmed,
  toOptionalNumber,
  toOptionalString,
  toUpperTrimmed,
} from "@/lib/ventas-integrations";

type ActionState = {
  error?: string;
  success?: boolean;
};

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

  const { data: actor } = await supabase
    .from("empleados")
    .select("id,rol,activo")
    .eq("id", user.id)
    .maybeSingle<{ id: string; rol: string | null; activo: boolean | null }>();

  if (!actor || actor.activo !== true || !canManageSales(actor.rol)) {
    return { error: "No tenés permisos para crear leads." };
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

  const { data: actor } = await supabase
    .from("empleados")
    .select("id,rol,activo")
    .eq("id", user.id)
    .maybeSingle<{ id: string; rol: string | null; activo: boolean | null }>();

  if (!actor || actor.activo !== true || !canManageSales(actor.rol)) {
    return { error: "No tenés permisos para registrar interacciones." };
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

export async function convertLeadToVentaAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para convertir leads reales." };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión expiró. Volvé a iniciar sesión." };
  }

  const { data: actor } = await supabase
    .from("empleados")
    .select("id,rol,activo")
    .eq("id", user.id)
    .maybeSingle();

  const actorRecord = actor as { id: string; rol: string | null; activo: boolean | null } | null;
  if (!actorRecord || !actorRecord.activo || !["admin", "vendedor"].includes(actorRecord.rol ?? "")) {
    return { error: "No tenés permisos para convertir leads en ventas." };
  }

  const leadId = toOptionalString(formData.get("lead_id"));
  const vehiculoId = toOptionalString(formData.get("vehiculo_id"));
  const vendedorId = toOptionalString(formData.get("vendedor_id"));
  const clienteNombre = toOptionalString(formData.get("cliente_nombre"));
  const clienteTelefono = toOptionalString(formData.get("cliente_telefono"));
  const clienteEmail = toOptionalString(formData.get("cliente_email"));
  const clienteDocumento = toOptionalString(formData.get("cliente_documento"));
  const fechaVentaInput = toOptionalString(formData.get("fecha_venta"));
  const fechaVenta = fechaVentaInput || new Date().toISOString().slice(0, 10);
  const precioVenta = toOptionalNumber(formData.get("precio_venta"));
  const moneda = toUpperTrimmed(formData.get("moneda"));
  const metodoPago = toLowerTrimmed(formData.get("metodo_pago"));
  const observaciones = toOptionalString(formData.get("observaciones"));
  const precioInfoauto = toOptionalNumber(formData.get("precio_infoauto"));
  const costoReposicion = toOptionalNumber(formData.get("costo_reposicion"));
  const costoHistorico = toOptionalNumber(formData.get("costo_historico"));
  const importeGestoria = toOptionalNumber(formData.get("importe_gestoria"));
  const importeEscribania = toOptionalNumber(formData.get("importe_escribania"));
  const fechaGanado = new Date().toISOString().slice(0, 10);
  const pagoUsado = toOptionalNumber(formData.get("pago_usado")) ?? 0;

  if (!leadId) return { error: "El lead es obligatorio." };
  if (!vehiculoId) return { error: "Debés seleccionar un vehículo." };
  if (!vendedorId) return { error: "Debés seleccionar un vendedor." };
  if (!clienteNombre) return { error: "El nombre del cliente es obligatorio." };
  if (precioVenta == null || precioVenta < 0) return { error: "El precio de venta es obligatorio." };
  if (!["ARS", "USD"].includes(moneda)) {
    return { error: "La moneda debe ser ARS o USD." };
  }
  if (!["transferencia", "efectivo", "dolares", "pesos", "permuta"].includes(metodoPago)) {
    return { error: "El método de pago no es válido." };
  }

  const [leadResult, vehicleResult, sellerResult] = await Promise.all([
    supabase
      .from("leads")
      .select("id,venta_id,estado,vehiculo_interes_id,vendedor_id,nombre,telefono,email,documento")
      .eq("id", leadId)
      .maybeSingle(),
    supabase
      .from("vehiculos")
      .select("id,marca,modelo,version,anio,dominio,precio_venta,precio_moneda,estado")
      .eq("id", vehiculoId)
      .eq("estado", "en_stock")
      .maybeSingle(),
    supabase
      .from("empleados")
      .select("id,nombre,email,rol,activo,comision_default_porcentaje")
      .eq("id", vendedorId)
      .maybeSingle(),
  ]);

  const leadRecord = leadResult.data as {
    id: string;
    venta_id: string | null;
    estado: string | null;
    vehiculo_interes_id: string | null;
    vendedor_id: string | null;
    nombre: string | null;
    telefono: string | null;
    email: string | null;
    documento: string | null;
  } | null;

  if (!leadRecord) {
    return { error: "No encontramos el lead seleccionado." };
  }

  if (leadRecord.venta_id) {
    return { error: "Este lead ya fue convertido en venta." };
  }

  if (actorRecord.rol === "vendedor" && leadRecord.vendedor_id && leadRecord.vendedor_id !== user.id) {
    return { error: "No podés convertir un lead asignado a otro vendedor." };
  }

  const selectedVehicle = vehicleResult.data as {
    id: string;
    marca: string | null;
    modelo: string | null;
    version: string | null;
    anio: number | null;
    dominio: string | null;
    precio_venta: number | null;
    precio_moneda: string | null;
    estado: string | null;
  } | null;

  if (!selectedVehicle) {
    return { error: "El vehículo seleccionado no está disponible en stock." };
  }

  const sellerRecord = sellerResult.data as {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
    activo: boolean | null;
    comision_default_porcentaje: number | null;
  } | null;

  if (!sellerRecord || !sellerRecord.activo || !["admin", "vendedor"].includes(sellerRecord.rol ?? "")) {
    return { error: "El vendedor seleccionado no está activo." };
  }

  if (actorRecord.rol === "vendedor" && sellerRecord.id !== user.id) {
    return { error: "No podés registrar ventas para otro vendedor." };
  }

  let montoPermuta: number | null = null;
  let vehiculoRecibido: Record<string, unknown> | null = null;
  const initialPayments = buildPaymentEntries(formData, moneda, fechaVenta);

  if (metodoPago === "permuta" || pagoUsado > 0) {
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
    return { error: "No pudimos registrar la venta desde CRM. Revisá los datos e intentá de nuevo." };
  }

  const ventaId =
    extractVentaId(rpcResult.data) ||
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

  if (!ventaId) {
    return { error: "No pudimos identificar la venta creada." };
  }

  const saleUpdateResult = await supabase
    .from("ventas")
    .update({
      lead_id: leadId,
      vendedor_id: vendedorId,
    })
    .eq("id", ventaId);

  if (saleUpdateResult.error) {
    return { error: "La venta se creó, pero no pudimos vincularla al lead." };
  }

  const leadUpdateResult = await supabase
    .from("leads")
    .update({
      estado: "ganado",
      venta_id: ventaId,
      fecha_ganado: fechaGanado,
      updated_by: user.id,
    })
    .eq("id", leadId);

  if (leadUpdateResult.error) {
    return { error: "La venta se creó, pero no pudimos actualizar el lead como ganado." };
  }

  const integrationsResult = await createSaleIntegrations(supabase, {
    ventaId,
    vehiculoId,
    fechaVenta,
    moneda,
    clienteNombre,
    observaciones: observaciones || null,
    initialPayments,
    sellerId: vendedorId,
    userId: user.id,
    precioInfoauto,
    costoReposicion,
    costoHistorico,
    importeGestoria,
    importeEscribania,
  });

  if ("error" in integrationsResult) {
    return { error: integrationsResult.error };
  }

  revalidatePath("/crm");
  revalidatePath(`/crm/${leadId}`);
  revalidatePath("/ventas");
  revalidatePath("/ventas/renta");
  revalidatePath("/ventas/pendientes-entrega");
  revalidatePath("/caja");
  revalidatePath("/comisiones");
  revalidatePath("/dashboard");
  revalidatePath("/inventario");
  redirect("/ventas");
}
