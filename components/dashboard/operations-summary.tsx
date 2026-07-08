import Link from "next/link";
import { DashboardChartCard } from "@/components/dashboard/dashboard-chart-card";
import { SimpleBarChart } from "@/components/dashboard/simple-bar-chart";

export function OperationsSummary({
  pendingTramites,
  overdueTramites,
  pendingBudgets,
  pendingLiquidations,
  commissionsPending,
  whatsappConnected,
  whatsappDisconnected,
  deliveryPending,
  deliveryDelivered,
  deliveryObserved,
}: {
  pendingTramites: number;
  overdueTramites: number;
  pendingBudgets: number;
  pendingLiquidations: number;
  commissionsPending: number;
  whatsappConnected: number;
  whatsappDisconnected: number;
  deliveryPending: number;
  deliveryDelivered: number;
  deliveryObserved: number;
}) {
  return (
    <DashboardChartCard
      title="Operaciones"
      description="Gestoría, entregas, comisiones y salud de WhatsApp."
      action={
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/gestoria" className="text-[#6B7280] underline-offset-4 hover:text-[#111827] hover:underline">
            Gestoría
          </Link>
          <Link href="/comisiones" className="text-[#6B7280] underline-offset-4 hover:text-[#111827] hover:underline">
            Comisiones
          </Link>
          <Link href="/whatsapp/conexiones" className="text-[#6B7280] underline-offset-4 hover:text-[#111827] hover:underline">
            WhatsApp
          </Link>
        </div>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-4">
          <div className="rounded-[30px] bg-[#111827] p-5 text-white shadow-lg shadow-black/10">
            <p className="text-xs uppercase tracking-[0.16em] text-white/55">Carga operativa</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-4xl font-semibold tracking-tight">{pendingTramites + overdueTramites + pendingLiquidations}</p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                  Trámites, presupuestos y liquidaciones que requieren una revisión operativa.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/55">Críticos</p>
                <p className="text-2xl font-semibold">{overdueTramites}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MiniStat label="Trámites" value={pendingTramites} tone="slate" note="Pendientes en gestoría." />
              <MiniStat label="Vencidos" value={overdueTramites} tone="rose" note="Seguimiento inmediato." />
              <MiniStat label="Liquidaciones" value={pendingLiquidations} tone="amber" note="Pendientes de pago." />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MiniTile label="Pendientes de entrega" value={deliveryPending} note="Operaciones sin entregar" />
            <MiniTile label="Entregadas" value={deliveryDelivered} note="Operaciones cerradas" />
            <MiniTile label="Observadas" value={deliveryObserved} note="Casos para revisar" />
            <MiniTile label="Presupuestos" value={pendingBudgets} note="Gestoría por resolver" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-[#E5E7EB] bg-[#FAFAFA] p-4">
            <p className="text-sm font-semibold text-[#111827]">WhatsApp</p>
            <p className="mt-1 text-xs text-[#6B7280]">Salud de conexiones activas.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <MiniTile label="Conectados" value={whatsappConnected} note="Instancias listas" />
              <MiniTile label="Desconectados" value={whatsappDisconnected} note="Requieren revisión" />
            </div>
          </div>

          <div className="rounded-[28px] border border-[#E5E7EB] bg-[#FAFAFA] p-4">
            <p className="text-sm font-semibold text-[#111827]">Distribución operativa</p>
            <p className="mt-1 text-xs text-[#6B7280]">Seguimientos clave del backoffice.</p>
            <div className="mt-4">
              <SimpleBarChart
                items={[
                  { label: "Trámites pendientes", value: pendingTramites, tone: "slate" },
                  { label: "Trámites vencidos", value: overdueTramites, tone: "rose" },
                  { label: "Presupuestos", value: pendingBudgets, tone: "amber" },
                  { label: "Liquidaciones", value: pendingLiquidations, tone: "slate" },
                  { label: "Comisiones", value: commissionsPending, tone: "amber" },
                ]}
                compact
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardChartCard>
  );
}

function MiniStat({
  label,
  value,
  note,
  tone = "slate",
}: {
  label: string;
  value: number;
  note: string;
  tone?: "slate" | "amber" | "rose" | "emerald";
}) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50/80 text-emerald-900"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50/80 text-amber-900"
        : tone === "rose"
          ? "border-rose-200 bg-rose-50/80 text-rose-900"
          : "border-slate-200 bg-slate-50/80 text-slate-900";

  return (
    <div className={["rounded-3xl border px-4 py-4", toneClass].join(" ")}>
      <p className="text-xs uppercase tracking-[0.14em] opacity-70">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs opacity-75">{note}</p>
    </div>
  );
}

function MiniTile({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[#111827]">{value}</p>
      <p className="mt-1 text-xs text-[#6B7280]">{note}</p>
    </div>
  );
}
