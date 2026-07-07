"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import {
  buildPermutaPayload,
  buildPaymentEntries,
  createSaleIntegrations,
  extractVentaId,
  toLowerTrimmed,
  toOptionalNumber,
  toOptionalString,
  toUpperTrimmed,
} from "@/lib/ventas-integrations";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
};

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
  const precioVenta = toOptionalNumber(formData.get("precio_venta"));
  const moneda = toUpperTrimmed(formData.get("moneda"));
  const metodoPago = toLowerTrimmed(formData.get("metodo_pago"));
  const observaciones = toOptionalString(formData.get("observaciones"));
  const precioInfoauto = toOptionalNumber(formData.get("precio_infoauto"));
  const costoReposicion = toOptionalNumber(formData.get("costo_reposicion"));
  const costoHistorico = toOptionalNumber(formData.get("costo_historico"));
  const importeGestoria = toOptionalNumber(formData.get("importe_gestoria"));
  const importeEscribania = toOptionalNumber(formData.get("importe_escribania"));
  const sellerId = toOptionalString(formData.get("vendedor_id")) || user.id;

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

  if (ventaId) {
    const saleUpdateResult = await supabase
      .from("ventas")
      .update({
        vendedor_id: sellerId,
      })
      .eq("id", ventaId);

    if (saleUpdateResult.error) {
      console.error("[ventas] No se pudo actualizar el vendedor de la venta:", saleUpdateResult.error.message);
    }

    const integrationsResult = await createSaleIntegrations(supabase, {
      ventaId,
      vehiculoId,
      fechaVenta,
      moneda,
      clienteNombre,
      observaciones: observaciones || null,
      initialPayments,
      sellerId,
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
