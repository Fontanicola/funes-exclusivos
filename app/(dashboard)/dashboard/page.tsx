import type { Metadata } from "next";
import { canViewCosts } from "@/lib/auth/permissions";
import { isDemoMode } from "@/lib/demo-mode";
import {
  mockCajaMovimientos,
  mockComisionLiquidaciones,
  mockComisiones,
  mockConversaciones,
  mockEmpleado,
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
  mockWhatsappInstancias,
  mockComprasVehiculos,
} from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAllSupabaseRows } from "@/lib/supabase/paginated";
import { buildDashboardMetrics } from "@/lib/dashboard-metrics";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PnlSummary } from "@/components/dashboard/pnl-summary";
import { InventorySummary } from "@/components/dashboard/inventory-summary";
import { CommercialSummary } from "@/components/dashboard/commercial-summary";
import { OperationsSummary } from "@/components/dashboard/operations-summary";
import { DashboardAlerts } from "@/components/dashboard/dashboard-alerts";
import { VendorActivitySummary } from "@/components/dashboard/vendor-activity-summary";
import { DashboardIntro } from "@/components/dashboard/dashboard-intro";
import { filterByDateRange, parseDateRange } from "@/lib/date-range";

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

function dateFrom(item: unknown, ...keys: string[]) {
  const record = item as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value) return value;
  }
  return null;
}

async function safeSelect<T>(
  query:
    | PromiseLike<{ data: T[] | null; error: unknown }>
    | ((from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>)
): Promise<QueryResult<T>> {
  try {
    const result =
      typeof query === "function"
        ? await fetchAllSupabaseRows(query)
        : await query;
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
      (from, to) => supabase
        .from("vehiculos")
        .select(
          "id,estado,precio_venta,precio_contado,precio_permuta,precio_moneda,costo_adquisicion,costo_reposicion,costo_moneda,catalogo_publicado,catalogo_destacado,estado_preparacion,precio_infoauto_actual,fotos,created_at"
        )
        .order("created_at", { ascending: false })
        .range(from, to)
    ),
    safeSelect(
      (from, to) => supabase
        .from("ventas")
        .select(
          "id,vehiculo_id,lead_id,vendedor_id,fecha_venta,precio_venta,moneda,estado,monto_permuta,costo_historico,costo_reposicion,precio_infoauto,info_historica_compra,margen_reposicion,margen_historico,rotacion_dias,saldo_preventa,saldo_efectivo,importe_gestoria,importe_escribania,resultado_operativo,created_at,vehiculo:vehiculos!ventas_vehiculo_id_fkey(id,costo_adquisicion,costo_moneda,costo_reposicion,precio_venta,precio_moneda),lead:leads!ventas_lead_id_fkey(id,nombre,origen,estado)"
        )
        .order("created_at", { ascending: false })
        .range(from, to)
    ),
    safeSelect(
      (from, to) => supabase
        .from("ventas_entregas")
        .select("id,venta_id,estado,fecha_entrega,created_at")
        .order("created_at", { ascending: false })
        .range(from, to)
    ),
    safeSelect(
      (from, to) => supabase
        .from("vehiculo_gastos")
        .select("id,vehiculo_id,tipo,monto,moneda,fecha,detalle,created_at")
        .order("created_at", { ascending: false })
        .range(from, to)
    ),
    safeSelect(
      (from, to) => supabase
        .from("vehiculo_documentos")
        .select(
          "id,vehiculo_id,tipo,estado,titulo,descripcion,archivo_path,archivo_nombre,archivo_mime_type,archivo_size_bytes,fecha_emision,fecha_vencimiento,observaciones,created_at,vehiculo:vehiculos!vehiculo_documentos_vehiculo_id_fkey(id,marca,modelo,dominio,estado,estado_preparacion,fotos)"
        )
        .order("created_at", { ascending: false })
        .range(from, to)
    ),
    safeSelect(
      (from, to) => supabase
        .from("compras_vehiculos")
        .select("id,vehiculo_id,proveedor_id,fecha,nro_operacion,precio_compra,precio_boleto,moneda,diferencia_b,deuda_pendiente,observaciones,created_at")
        .order("created_at", { ascending: false })
        .range(from, to)
    ),
    safeSelect(
      (from, to) => supabase
        .from("caja_movimientos")
        .select("id,tipo,origen,compra_id,venta_id,venta_pago_id,comision_liquidacion_id,monto,moneda,fecha,medio,cuenta,concepto,created_at")
        .order("created_at", { ascending: false })
        .range(from, to)
    ),
    safeSelect(
      (from, to) => supabase
        .from("comisiones")
        .select("id,venta_id,vendedor_id,monto_comision,moneda,estado,fecha_generada,fecha_pago,created_at")
        .order("created_at", { ascending: false })
        .range(from, to)
    ),
    safeSelect(
      (from, to) => supabase
        .from("comision_liquidaciones")
        .select("id,vendedor_id,periodo,estado,moneda,neto_a_cobrar,fecha_pago,fecha_cierre,created_at")
        .order("created_at", { ascending: false })
        .range(from, to)
    ),
    safeSelect(
      (from, to) => supabase
        .from("leads")
        .select("id,estado,origen,vendedor_id,proximo_contacto,created_at")
        .order("created_at", { ascending: false })
        .range(from, to)
    ),
    safeSelect(
      (from, to) => supabase
        .from("empleados")
        .select("id,nombre,email,rol,activo")
        .order("nombre", { ascending: true })
        .range(from, to)
    ),
    safeSelect(
      (from, to) => supabase
        .from("gestoria_tramites")
        .select("id,estado,fecha_vencimiento,created_at")
        .order("created_at", { ascending: false })
        .range(from, to)
    ),
    safeSelect(
      (from, to) => supabase
        .from("gestoria_presupuestos")
        .select("id,estado,fecha,total,moneda,created_at")
        .order("created_at", { ascending: false })
        .range(from, to)
    ),
    safeSelect(
      (from, to) => supabase
        .from("whatsapp_instancias")
        .select("id,estado,last_sync_at,created_at,empleado:empleados!whatsapp_instancias_empleado_id_fkey(id,nombre,email,rol)")
        .order("created_at", { ascending: false })
        .range(from, to)
    ),
    safeSelect(
      (from, to) => supabase
        .from("conversaciones")
        .select(
          "id,estado,interes_compra,ia_interes_compra,ia_estado,ia_resumen,ia_score,ia_proximo_paso,ia_procesado_at,requiere_atencion,unread_count,created_at,vendedor_id"
        )
        .order("created_at", { ascending: false })
        .range(from, to)
    ),
    safeSelect(
      (from, to) => supabase
        .from("recordatorios")
        .select("id,tipo,estado,prioridad,titulo,descripcion,fecha_vencimiento,fecha_completado,fecha_pospuesto,asignado_a,lead_id,conversacion_id,venta_id,entrega_id,tramite_id,vehiculo_id,comision_liquidacion_id,origen_automatico,created_at,updated_at")
        .order("fecha_vencimiento", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })
        .range(from, to)
    ),
  ]);

  return {
    vehiculos: vehiculosResult.data,
    ventas: ventasResult.data.map((sale) => ({
      ...sale,
      vehiculo: normalizeSingleRelation((sale as { vehiculo?: unknown }).vehiculo as RawRelation<any>),
      lead: normalizeSingleRelation((sale as { lead?: unknown }).lead as RawRelation<any>),
    })),
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

export default async function DashboardPage({ searchParams }: { searchParams?: { from?: string; to?: string } }) {
  const dateRange = parseDateRange(searchParams);
  const sourceData = await loadDashboardData();
  const data = {
    ...sourceData,
    vehiculos: filterByDateRange(sourceData.vehiculos as any[], dateRange, (item) => dateFrom(item, "fecha_ingreso", "created_at")),
    ventas: filterByDateRange(sourceData.ventas as any[], dateRange, (item) => dateFrom(item, "fecha_venta", "created_at")),
    ventasEntregas: filterByDateRange(sourceData.ventasEntregas as any[], dateRange, (item) => dateFrom(item, "fecha_entrega", "created_at")),
    vehiculoGastos: filterByDateRange(sourceData.vehiculoGastos as any[], dateRange, (item) => dateFrom(item, "fecha", "created_at")),
    vehiculoDocumentos: filterByDateRange(sourceData.vehiculoDocumentos as any[], dateRange, (item) => dateFrom(item, "fecha_emision", "fecha_vencimiento", "created_at")),
    comprasVehiculos: filterByDateRange(sourceData.comprasVehiculos as any[], dateRange, (item) => dateFrom(item, "fecha", "created_at")),
    cajaMovimientos: filterByDateRange(sourceData.cajaMovimientos as any[], dateRange, (item) => dateFrom(item, "fecha", "created_at")),
    comisiones: filterByDateRange(sourceData.comisiones as any[], dateRange, (item) => dateFrom(item, "fecha_generada", "created_at")),
    comisionLiquidaciones: filterByDateRange(sourceData.comisionLiquidaciones as any[], dateRange, (item) => {
      const period = (item as Record<string, unknown>).periodo;
      const periodDate = typeof period === "string" && /^\d{4}-\d{2}$/.test(period) ? `${period}-01` : null;
      return periodDate ?? dateFrom(item, "created_at");
    }),
    leads: filterByDateRange(sourceData.leads as any[], dateRange, (item) => dateFrom(item, "created_at", "proximo_contacto")),
    gestoriaTramites: filterByDateRange(sourceData.gestoriaTramites as any[], dateRange, (item) => dateFrom(item, "fecha_vencimiento", "created_at")),
    gestoriaPresupuestos: filterByDateRange(sourceData.gestoriaPresupuestos as any[], dateRange, (item) => dateFrom(item, "fecha", "created_at")),
    conversaciones: filterByDateRange(sourceData.conversaciones as any[], dateRange, (item) => dateFrom(item, "ultimo_mensaje_at", "created_at")),
    recordatorios: filterByDateRange(sourceData.recordatorios as any[], dateRange, (item) => dateFrom(item, "fecha_vencimiento", "created_at")),
  };
  const metrics = buildDashboardMetrics(data);
  let currentRole: string | null = isDemoMode ? mockEmpleado.rol : null;

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: employee } = await supabase
        .from("empleados")
        .select("rol")
        .eq("id", user.id)
        .maybeSingle<{ rol: string | null }>();

      currentRole = employee?.rol ?? null;
    }
  }

  const canViewFinancials = canViewCosts(currentRole);

  return (
    <section className="space-y-6">
      <DashboardIntro hasAlerts={metrics.alerts.length > 0} />

      <DashboardAlerts alerts={metrics.alerts} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.topKpis.map((kpi) => (
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
            badge={kpi.badge}
            progress={kpi.progress}
            note={kpi.note}
          />
        ))}
      </div>

      <PnlSummary
        sales={metrics.pnl.sales}
        cashIncome={metrics.pnl.cashIncome}
        cashExpense={metrics.pnl.cashExpense}
        purchases={metrics.pnl.purchases}
        commissionsPaid={metrics.pnl.commissionsPaid}
        otherExpenses={metrics.pnl.otherExpenses}
        operatingResult={metrics.pnl.operatingResult}
        annualOperatingResult={metrics.pnl.annualOperatingResult}
        salesMarginDescription={metrics.pnl.salesMarginDescription}
        monthlySeriesByCurrency={metrics.pnl.monthlySeriesByCurrency}
        canViewFinancials={canViewFinancials}
      />

      <div className="grid gap-6 xl:grid-cols-2">
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
          canViewCosts={canViewFinancials}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
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
        {canViewFinancials ? <VendorActivitySummary vendors={metrics.vendorActivity} /> : null}
      </div>

    </section>
  );
}
