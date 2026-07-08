import type { Metadata } from "next";
import { isDemoMode } from "@/lib/demo-mode";
import {
  mockCajaMovimientos,
  mockComisionLiquidaciones,
  mockComisiones,
  mockConversaciones,
  mockEmpleados,
  mockGestoriaPresupuestos,
  mockGestoriaTramites,
  mockLeads,
  mockRecordatorios,
  mockVehiculoGastos,
  mockVehiculoDocumentos,
  mockVehiculos,
  mockVentas,
  mockVentasEntregas,
  mockVentasPagos,
  mockWhatsappInstancias,
  mockComprasVehiculos,
} from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildDashboardMetrics } from "@/lib/dashboard-metrics";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PnlSummary } from "@/components/dashboard/pnl-summary";
import { InventorySummary } from "@/components/dashboard/inventory-summary";
import { CommercialSummary } from "@/components/dashboard/commercial-summary";
import { OperationsSummary } from "@/components/dashboard/operations-summary";
import { DashboardAlerts } from "@/components/dashboard/dashboard-alerts";
import { VendorActivitySummary } from "@/components/dashboard/vendor-activity-summary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | Funes Exclusivos",
};

type QueryResult<T> = {
  data: T[];
  error: unknown;
};

type RawRelation<T> = T | T[] | null;

function normalizeSingleRelation<T>(value: RawRelation<T>) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

async function safeSelect<T>(
  promise: PromiseLike<{ data: T[] | null; error: unknown }>
): Promise<QueryResult<T>> {
  try {
    const result = await promise;
    if (result.error) {
      console.error("Dashboard query failed", result.error);
      return { data: [], error: result.error };
    }

    return { data: result.data ?? [], error: null };
  } catch (error) {
    console.error("Dashboard query threw", error);
    return { data: [], error };
  }
}

async function loadDashboardData() {
  if (isDemoMode) {
    return {
      vehiculos: mockVehiculos,
      ventas: mockVentas,
      ventasPagos: mockVentasPagos,
      ventasEntregas: mockVentasEntregas,
      vehiculoGastos: mockVehiculoGastos,
      vehiculoDocumentos: mockVehiculoDocumentos,
      comprasVehiculos: mockComprasVehiculos,
      cajaMovimientos: mockCajaMovimientos,
      comisiones: mockComisiones,
      comisionLiquidaciones: mockComisionLiquidaciones,
      leads: mockLeads,
      empleados: mockEmpleados,
      gestoriaTramites: mockGestoriaTramites,
      gestoriaPresupuestos: mockGestoriaPresupuestos,
      whatsappInstancias: mockWhatsappInstancias,
      conversaciones: mockConversaciones,
      recordatorios: mockRecordatorios,
    };
  }

  const supabase = createSupabaseServerClient();

  const [
    vehiculosResult,
    ventasResult,
    ventasPagosResult,
    ventasEntregasResult,
    vehiculoGastosResult,
    vehiculoDocumentosResult,
    comprasVehiculosResult,
    cajaResult,
    comisionesResult,
    comisionLiquidacionesResult,
    leadsResult,
    empleadosResult,
    gestoriaTramitesResult,
    gestoriaPresupuestosResult,
    whatsappResult,
    conversacionesResult,
    recordatoriosResult,
  ] = await Promise.all([
    safeSelect(
      supabase
        .from("vehiculos")
        .select(
          "id,estado,precio_venta,precio_contado,precio_permuta,precio_moneda,costo_adquisicion,costo_reposicion,costo_moneda,catalogo_publicado,catalogo_destacado,estado_preparacion,precio_infoauto_actual,fotos,created_at"
        )
        .order("created_at", { ascending: false })
    ),
    safeSelect(
      supabase
        .from("ventas")
        .select(
          "id,vehiculo_id,lead_id,vendedor_id,fecha_venta,precio_venta,moneda,estado,monto_permuta,costo_historico,costo_reposicion,precio_infoauto,info_historica_compra,margen_reposicion,margen_historico,rotacion_dias,saldo_preventa,saldo_efectivo,importe_gestoria,importe_escribania,resultado_operativo,created_at,vehiculo:vehiculos!ventas_vehiculo_id_fkey(id,costo_adquisicion,costo_moneda,costo_reposicion,precio_venta,precio_moneda),lead:leads!ventas_lead_id_fkey(id,nombre,origen,estado)"
        )
        .order("created_at", { ascending: false })
    ),
    safeSelect(
      supabase
        .from("ventas_pagos")
        .select("id,venta_id,tipo,fecha,importe,moneda,medio,detalle,created_at")
        .order("created_at", { ascending: false })
    ),
    safeSelect(supabase.from("ventas_entregas").select("*").order("created_at", { ascending: false })),
    safeSelect(
      supabase
        .from("vehiculo_gastos")
        .select("id,vehiculo_id,tipo,monto,moneda,fecha,detalle,created_at")
        .order("created_at", { ascending: false })
    ),
    safeSelect(
      supabase
        .from("vehiculo_documentos")
        .select(
          "id,vehiculo_id,tipo,estado,titulo,descripcion,archivo_path,archivo_nombre,archivo_mime_type,archivo_size_bytes,fecha_emision,fecha_vencimiento,observaciones,created_at,vehiculo:vehiculos!vehiculo_documentos_vehiculo_id_fkey(id,marca,modelo,dominio,estado,estado_preparacion,fotos)"
        )
        .order("created_at", { ascending: false })
    ),
    safeSelect(
      supabase
        .from("compras_vehiculos")
        .select("id,vehiculo_id,proveedor_id,fecha,nro_operacion,precio_compra,precio_boleto,moneda,diferencia_b,deuda_pendiente,observaciones,created_at")
        .order("created_at", { ascending: false })
    ),
    safeSelect(
      supabase
        .from("caja_movimientos")
        .select("id,tipo,origen,compra_id,venta_id,venta_pago_id,comision_liquidacion_id,monto,importe,moneda,fecha,medio,cuenta,concepto,created_at")
        .order("created_at", { ascending: false })
    ),
    safeSelect(
      supabase
        .from("comisiones")
        .select("id,venta_id,vendedor_id,monto_comision,moneda,estado,fecha_generada,fecha_pago,created_at")
        .order("created_at", { ascending: false })
    ),
    safeSelect(
      supabase
        .from("comision_liquidaciones")
        .select("id,vendedor_id,periodo,estado,moneda,neto_a_cobrar,fecha_pago,fecha_cierre,created_at")
        .order("created_at", { ascending: false })
    ),
    safeSelect(
      supabase
        .from("leads")
        .select("id,estado,origen,vendedor_id,proximo_contacto,created_at")
        .order("created_at", { ascending: false })
    ),
    safeSelect(
      supabase
        .from("empleados")
        .select("id,nombre,email,rol,activo")
        .order("nombre", { ascending: true })
    ),
    safeSelect(
      supabase
        .from("gestoria_tramites")
        .select("id,estado,fecha_vencimiento,created_at")
        .order("created_at", { ascending: false })
    ),
    safeSelect(
      supabase
        .from("gestoria_presupuestos")
        .select("id,estado,fecha,total,moneda,created_at")
        .order("created_at", { ascending: false })
    ),
    safeSelect(
      supabase
        .from("whatsapp_instancias")
        .select("id,estado,last_sync_at,created_at,empleado:empleados!whatsapp_instancias_empleado_id_fkey(id,nombre,email,rol)")
        .order("created_at", { ascending: false })
    ),
    safeSelect(
      supabase
        .from("conversaciones")
        .select(
          "id,estado,interes_compra,ia_interes_compra,ia_estado,ia_resumen,ia_score,ia_proximo_paso,ia_procesado_at,requiere_atencion,unread_count,created_at,vendedor_id"
        )
        .order("created_at", { ascending: false })
    ),
    safeSelect(
      supabase
        .from("recordatorios")
        .select("id,tipo,estado,prioridad,titulo,descripcion,fecha_vencimiento,fecha_completado,fecha_pospuesto,asignado_a,lead_id,conversacion_id,venta_id,entrega_id,tramite_id,vehiculo_id,comision_liquidacion_id,origen_automatico,created_at,updated_at")
        .order("fecha_vencimiento", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })
    ),
  ]);

  return {
    vehiculos: vehiculosResult.data,
    ventas: ventasResult.data.map((sale) => ({
      ...sale,
      vehiculo: normalizeSingleRelation((sale as { vehiculo?: unknown }).vehiculo as RawRelation<any>),
      lead: normalizeSingleRelation((sale as { lead?: unknown }).lead as RawRelation<any>),
    })),
    ventasPagos: ventasPagosResult.data,
    ventasEntregas: ventasEntregasResult.data,
    vehiculoGastos: vehiculoGastosResult.data,
    vehiculoDocumentos: vehiculoDocumentosResult.data,
    comprasVehiculos: comprasVehiculosResult.data,
    cajaMovimientos: cajaResult.data,
    comisiones: comisionesResult.data,
    comisionLiquidaciones: comisionLiquidacionesResult.data,
    leads: leadsResult.data,
    empleados: empleadosResult.data,
    gestoriaTramites: gestoriaTramitesResult.data,
    gestoriaPresupuestos: gestoriaPresupuestosResult.data,
    whatsappInstancias: whatsappResult.data.map((instance) => ({
      ...instance,
      empleado: normalizeSingleRelation((instance as { empleado?: unknown }).empleado as RawRelation<any>),
    })),
    conversaciones: conversacionesResult.data,
    recordatorios: recordatoriosResult.data,
  };
}

export default async function DashboardPage() {
  const data = await loadDashboardData();
  const metrics = buildDashboardMetrics(data);

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
            Executive view
          </span>
          <span className="text-sm text-[#6B7280]">P&amp;L en tiempo real</span>
        </div>
        <div className="max-w-3xl space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">Dashboard</h1>
          <p className="text-sm leading-6 text-[#6B7280]">
            P&amp;L, operación comercial, inventario y estado general del negocio.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.topKpis.map((kpi, index) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            description={kpi.description}
            href={kpi.href}
            variant={
              kpi.tone === "highlight"
                ? "highlight"
                : kpi.tone === "success"
                  ? "positive"
                  : kpi.tone === "critical"
                    ? "danger"
                    : kpi.tone === "warning"
                      ? "warning"
                      : "default"
            }
            featured={index === 0}
            badge={kpi.badge}
            progress={kpi.progress}
            note={kpi.note}
            className={index === 0 ? "md:col-span-2 xl:col-span-2" : ""}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <PnlSummary
          sales={metrics.pnl.sales}
          cashIncome={metrics.pnl.cashIncome}
          cashExpense={metrics.pnl.cashExpense}
          purchases={metrics.pnl.purchases}
          commissionsPaid={metrics.pnl.commissionsPaid}
          otherExpenses={metrics.pnl.otherExpenses}
          operatingResult={metrics.pnl.operatingResult}
          annualOperatingResult={metrics.pnl.annualOperatingResult}
          salesCount={metrics.pnl.salesCount}
          salesMarginDescription={metrics.pnl.salesMarginDescription}
          monthlySeriesByCurrency={metrics.pnl.monthlySeriesByCurrency}
        />
        <InventorySummary
          totalStock={metrics.inventory.totalStock}
          stockValued={metrics.inventory.stockValued}
          sold={metrics.inventory.sold}
          consignment={metrics.inventory.consignment}
          published={metrics.inventory.published}
          highlighted={metrics.inventory.highlighted}
          unpublishedStock={metrics.inventory.unpublishedStock}
          publishedWithoutPhoto={metrics.inventory.publishedWithoutPhoto}
          vehiclesWithoutPrice={metrics.inventory.vehiclesWithoutPrice}
          preparationPending={metrics.inventory.preparationPending}
          preparationInProgress={metrics.inventory.preparationInProgress}
          preparationReady={metrics.inventory.preparationReady}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <CommercialSummary
          salesCount={metrics.commercial.salesCount}
          activeLeads={metrics.commercial.activeLeads}
          negotiationLeads={metrics.commercial.negotiationLeads}
          wonLeads={metrics.commercial.wonLeads}
          highInterestConversations={metrics.commercial.highInterestConversations}
          attentionConversations={metrics.commercial.attentionConversations}
          nextContactLeads={metrics.commercial.nextContactLeads}
          openConversations={metrics.commercial.openConversations}
          leadStages={metrics.commercial.leadStages}
        />
        <VendorActivitySummary vendors={metrics.vendorActivity} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <OperationsSummary
          pendingTramites={metrics.operations.pendingTramites}
          overdueTramites={metrics.operations.overdueTramites}
          pendingBudgets={metrics.operations.pendingBudgets}
          pendingLiquidations={metrics.operations.pendingLiquidations}
          commissionsPending={metrics.operations.commissionsPending}
          whatsappConnected={metrics.operations.whatsappConnected}
          whatsappDisconnected={metrics.operations.whatsappDisconnected}
          deliveryPending={metrics.operations.deliveryPending}
          deliveryDelivered={metrics.operations.deliveryDelivered}
          deliveryObserved={metrics.operations.deliveryObserved}
        />
        <DashboardAlerts alerts={metrics.alerts} />
      </div>
    </section>
  );
}
