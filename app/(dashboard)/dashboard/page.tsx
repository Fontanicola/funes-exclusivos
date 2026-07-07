import type { Metadata } from "next";
import { isDemoMode } from "@/lib/demo-mode";
import {
  mockCajaMovimientos,
  mockComisiones,
  mockConversaciones,
  mockGestoriaTramites,
  mockLeads,
  mockVehiculos,
  mockVentas,
  mockWhatsappInstancias,
} from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { calculateDashboardMetrics } from "@/lib/dashboard-metrics";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PnlSummary } from "@/components/dashboard/pnl-summary";
import { InventorySummary } from "@/components/dashboard/inventory-summary";
import { CommercialSummary } from "@/components/dashboard/commercial-summary";
import { OperationsSummary } from "@/components/dashboard/operations-summary";
import { DashboardAlerts } from "@/components/dashboard/dashboard-alerts";
import { formatCurrencyByCurrency } from "@/lib/dashboard-metrics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | Funes Exclusivos",
};

type RawRelation<T> = T | T[] | null;

function normalizeSingleRelation<T>(value: RawRelation<T>) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function DashboardPage() {
  let data: any = {
    vehiculos: mockVehiculos,
    ventas: mockVentas,
    ventasEntregas: mockVentas.map((venta, index) => ({
      id: `delivery_${venta.id}`,
      venta_id: venta.id,
      estado: index % 3 === 0 ? "pendiente" : index % 3 === 1 ? "entregada" : "observada",
      created_at: venta.created_at,
    })),
    cajaMovimientos: mockCajaMovimientos,
    comisiones: mockComisiones,
    leads: mockLeads,
    gestoriaTramites: mockGestoriaTramites,
    whatsappInstancias: mockWhatsappInstancias,
    conversaciones: mockConversaciones,
  };

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();

    const [
      vehiculosResult,
      ventasResult,
      ventasEntregasResult,
      cajaResult,
      comisionesResult,
      leadsResult,
      gestoriaResult,
      whatsappResult,
      conversacionesResult,
    ] = await Promise.all([
      supabase
        .from("vehiculos")
        .select(
          "id,estado,precio_venta,precio_moneda,costo_adquisicion,costo_moneda,catalogo_publicado,catalogo_destacado,created_at"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("ventas")
        .select(
          "id,fecha_venta,precio_venta,moneda,estado,vendedor_id,vehiculo_id,created_at,vehiculo:vehiculos!ventas_vehiculo_id_fkey(id,costo_adquisicion,costo_moneda)"
        )
        .order("created_at", { ascending: false }),
      supabase.from("ventas_entregas").select("*").order("created_at", { ascending: false }),
      supabase
        .from("caja_movimientos")
        .select("id,tipo,origen,compra_id,venta_id,venta_pago_id,comision_liquidacion_id,monto,importe,moneda,fecha,medio,cuenta,concepto,created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("comisiones")
        .select("id,monto_comision,moneda,estado,fecha_generada,fecha_pago,created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("leads")
        .select("id,estado,origen,vendedor_id,proximo_contacto,created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("gestoria_tramites")
        .select("id,estado,fecha_vencimiento,created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("whatsapp_instancias")
        .select("id,estado,last_sync_at,created_at,empleado:empleados!whatsapp_instancias_empleado_id_fkey(id,nombre,email,rol)")
        .order("created_at", { ascending: false }),
      supabase
        .from("conversaciones")
        .select("id,estado,interes_compra,requiere_atencion,unread_count,created_at")
        .order("created_at", { ascending: false }),
    ]);

    data = {
      vehiculos: vehiculosResult.data ?? [],
      ventas: (ventasResult.data ?? []).map((sale) => ({
        ...sale,
        vehiculo: normalizeSingleRelation((sale as { vehiculo?: unknown }).vehiculo as RawRelation<any>),
      })),
      ventasEntregas: ventasEntregasResult.data ?? [],
      cajaMovimientos: cajaResult.data ?? [],
      comisiones: comisionesResult.data ?? [],
      leads: leadsResult.data ?? [],
      gestoriaTramites: gestoriaResult.data ?? [],
      whatsappInstancias: (whatsappResult.data ?? []).map((instance) => ({
        ...instance,
        empleado: normalizeSingleRelation((instance as { empleado?: unknown }).empleado as RawRelation<any>),
      })),
      conversaciones: conversacionesResult.data ?? [],
    };
  }

  const metrics = calculateDashboardMetrics(data);
  const stockPublicationRate =
    metrics.inventory.totalStock > 0
      ? Math.round((metrics.inventory.published / metrics.inventory.totalStock) * 100)
      : 0;

  const topKpis = [
    {
      title: "Stock total",
      value: `${metrics.inventory.totalStock}`,
      description: `${metrics.inventory.published} publicados · ${metrics.inventory.highlighted} destacados`,
      href: "/inventario",
      tone: "neutral" as const,
      featured: true,
      badge: "Catálogo",
      progress: {
        value: stockPublicationRate,
        label: "Publicación",
      },
      note: metrics.inventory.totalStock
        ? `Sin publicar: ${metrics.inventory.unpublishedStock}`
        : "Sin stock cargado",
    },
    {
      title: "Ventas del mes",
      value: `${metrics.commercial.salesCount}`,
      description: `Registradas por ${formatCurrencyByCurrency(metrics.pnl.sales)}`,
      href: "/ventas",
      tone: "success" as const,
      badge: "Cierres",
      note: metrics.commercial.wonLeads
        ? `${metrics.commercial.wonLeads} leads ganados en el período`
        : "Sin cierres todavía",
    },
    {
      title: "Ingresos del mes",
      value: formatCurrencyByCurrency(metrics.pnl.cashIncome),
      description: "Cobros confirmados en caja.",
      href: "/caja",
      tone: "highlight" as const,
      badge: "Caja",
      note: formatCurrencyByCurrency(metrics.pnl.operatingResult),
    },
    {
      title: "Leads activos",
      value: `${metrics.commercial.activeLeads}`,
      description: `${metrics.commercial.negotiationLeads} en negociación · ${metrics.commercial.wonLeads} ganados`,
      href: "/crm",
      tone: "info" as const,
      badge: "Pipeline",
      progress: {
        value:
          metrics.commercial.activeLeads > 0
            ? Math.min(100, Math.round((metrics.commercial.negotiationLeads / metrics.commercial.activeLeads) * 100))
            : 0,
        label: "Negociación",
      },
    },
    {
      title: "WhatsApps desconectados",
      value: `${metrics.operations.whatsappDisconnected}`,
      description: `${metrics.operations.whatsappConnected} conectados · seguimiento operativo`,
      href: "/whatsapp/conexiones",
      tone: "critical" as const,
      badge: "Atención",
      note: metrics.operations.whatsappDisconnected ? "Requiere revisión" : "Todo conectado",
    },
  ];

  const mediumRows = metrics.operations.cajaByMedium.slice(0, 4);

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
            P&amp;L, operación comercial y estado general del negocio.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {topKpis.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            description={kpi.description}
            href={kpi.href}
            tone={kpi.tone}
            featured={kpi.featured}
            badge={kpi.badge}
            progress={kpi.progress}
            note={kpi.note}
            className={kpi.featured ? "md:col-span-2 xl:col-span-2" : ""}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.84fr)]">
        <section className="rounded-[32px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#111827]">Caja por medio</h2>
              <p className="mt-1 text-sm text-[#6B7280]">Distribución operativa de movimientos del mes.</p>
            </div>
            <span className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
              Top medios
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {mediumRows.length ? (
              mediumRows.map((item) => {
                const max = Math.max(...mediumRows.map((medium) => medium.count), 1);
                const width = Math.max(8, (item.count / max) * 100);

                return (
                  <div key={item.medium} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#111827]">{item.medium}</p>
                        <p className="text-xs text-[#6B7280]">{item.count} movimientos</p>
                      </div>
                      <p className="text-sm font-medium text-[#111827]">
                        {formatCurrencyByCurrency(item.totals)}
                      </p>
                    </div>
                    <div className="h-2 rounded-full bg-[#F3F4F6]">
                      <div className="h-2 rounded-full bg-[#111827]" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-4 py-6 text-sm text-[#6B7280]">
                Sin movimientos por medio todavía.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[32px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-base font-semibold text-[#111827]">Entrega y preparación</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Estado de entrega usado y preparación de stock.</p>
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">Pendiente</p>
                <p className="mt-2 text-2xl font-semibold text-[#111827]">{metrics.operations.deliveryPending}</p>
              </div>
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">Entregadas</p>
                <p className="mt-2 text-2xl font-semibold text-[#111827]">{metrics.operations.deliveryDelivered}</p>
              </div>
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">Observadas</p>
                <p className="mt-2 text-2xl font-semibold text-[#111827]">{metrics.operations.deliveryObserved}</p>
              </div>
            </div>

            <div className="rounded-[28px] bg-[#FAFAFA] p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">Pendiente</p>
                  <p className="mt-2 text-lg font-semibold text-[#111827]">{metrics.inventory.preparationPending}</p>
                </div>
                <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">En proceso</p>
                  <p className="mt-2 text-lg font-semibold text-[#111827]">{metrics.inventory.preparationInProgress}</p>
                </div>
                <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">Listo</p>
                  <p className="mt-2 text-lg font-semibold text-[#111827]">{metrics.inventory.preparationReady}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <PnlSummary
          sales={metrics.pnl.sales}
          cashIncome={metrics.pnl.cashIncome}
          cashExpense={metrics.pnl.cashExpense}
          commissionsPaid={metrics.pnl.commissionsPaid}
          operatingResult={metrics.pnl.operatingResult}
          salesCount={metrics.pnl.salesCount}
          salesMarginDescription={metrics.pnl.salesMarginDescription}
        />
        <InventorySummary
          totalStock={metrics.inventory.totalStock}
          stockValued={metrics.inventory.stockValued}
          sold={metrics.inventory.sold}
          consignment={metrics.inventory.consignment}
          published={metrics.inventory.published}
          highlighted={metrics.inventory.highlighted}
          unpublishedStock={metrics.inventory.unpublishedStock}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <CommercialSummary
          salesCount={metrics.commercial.salesCount}
          activeLeads={metrics.commercial.activeLeads}
          negotiationLeads={metrics.commercial.negotiationLeads}
          wonLeads={metrics.commercial.wonLeads}
          highInterestConversations={metrics.commercial.highInterestConversations}
          attentionConversations={metrics.commercial.attentionConversations}
          nextContactLeads={metrics.commercial.nextContactLeads}
        />
        <OperationsSummary
          pendingTramites={metrics.operations.pendingTramites}
          overdueTramites={metrics.operations.overdueTramites}
          commissionsPending={metrics.operations.commissionsPending}
          whatsappConnected={metrics.operations.whatsappConnected}
          whatsappDisconnected={metrics.operations.whatsappDisconnected}
        />
      </div>

      <DashboardAlerts alerts={metrics.alerts} />
    </section>
  );
}
