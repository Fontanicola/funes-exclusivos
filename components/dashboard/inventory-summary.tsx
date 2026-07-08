import Link from "next/link";
import { DashboardChartCard } from "@/components/dashboard/dashboard-chart-card";
import { SimpleBarChart } from "@/components/dashboard/simple-bar-chart";
import { SimpleDonutChart } from "@/components/dashboard/simple-donut-chart";
import { formatCurrencyByCurrency } from "@/lib/dashboard-metrics";

type CurrencyTotals = {
  ARS: number;
  USD: number;
  other: Record<string, number>;
};

export function InventorySummary({
  totalStock,
  stockValued,
  sold,
  consignment,
  published,
  highlighted,
  unpublishedStock,
  publishedWithoutPhoto,
  vehiclesWithoutPrice,
  preparationPending,
  preparationInProgress,
  preparationReady,
}: {
  totalStock: number;
  stockValued: CurrencyTotals;
  sold: number;
  consignment: number;
  published: number;
  highlighted: number;
  unpublishedStock: number;
  publishedWithoutPhoto: number;
  vehiclesWithoutPrice: number;
  preparationPending: number;
  preparationInProgress: number;
  preparationReady: number;
}) {
  const publicationRate = totalStock > 0 ? Math.round((published / totalStock) * 100) : 0;
  const totalInventory = totalStock + sold + consignment;

  return (
    <DashboardChartCard
      title="Inventario y catálogo"
      description="Distribución del stock, exposición online y estado de preparación."
      action={
        <Link
          href="/inventario"
          className="text-sm font-medium text-[#6B7280] underline-offset-4 hover:text-[#111827] hover:underline"
        >
          Ver inventario
        </Link>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-5">
          <div className="rounded-[30px] bg-[#111827] p-5 text-white shadow-lg shadow-black/10">
            <p className="text-xs uppercase tracking-[0.16em] text-white/55">Stock visible</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-4xl font-semibold tracking-tight">{totalStock}</p>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Unidades listas para mover entre venta y catálogo.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/55">Publicación</p>
                <p className="text-2xl font-semibold">{publicationRate}%</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[28px] border border-[#E5E7EB] bg-[#FAFAFA] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">Valor publicado</p>
              <p className="mt-2 text-lg font-semibold text-[#111827]">{formatCurrencyByCurrency(stockValued)}</p>
              <p className="mt-2 text-xs text-[#6B7280]">Suma estimada del stock visible online.</p>
            </div>
            <div className="rounded-[28px] border border-[#E5E7EB] bg-[#FAFAFA] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">Destacados</p>
              <p className="mt-2 text-3xl font-semibold text-[#111827]">{highlighted}</p>
              <p className="mt-2 text-xs text-[#6B7280]">Unidades con mayor prioridad comercial.</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#E5E7EB] bg-[#FAFAFA] p-4">
            <p className="text-sm font-semibold text-[#111827]">Preparación</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <TinyMetric label="Pendiente" value={preparationPending} tone="slate" />
              <TinyMetric label="En proceso" value={preparationInProgress} tone="amber" />
              <TinyMetric label="Listo" value={preparationReady} tone="emerald" />
            </div>
            <div className="mt-4">
              <SimpleBarChart
                items={[
                  { label: "Pendiente", value: preparationPending, tone: "slate" },
                  { label: "En proceso", value: preparationInProgress, tone: "amber" },
                  { label: "Listo", value: preparationReady, tone: "emerald" },
                ]}
                compact
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <SimpleDonutChart
            centerLabel="Inventario"
            centerValue={`${totalInventory}`}
            sublabel="Distribución visible"
            segments={[
              { label: "En stock", value: totalStock, tone: "#111827" },
              { label: "Vendidos", value: sold, tone: "#10B981" },
              { label: "Consignación", value: consignment, tone: "#F59E0B" },
            ]}
          />

          <div className="space-y-3 rounded-[28px] border border-[#E5E7EB] bg-[#FAFAFA] p-4">
            <MiniStat label="Publicados" value={published} />
            <MiniStat label="Sin publicar" value={unpublishedStock} tone="amber" />
            <MiniStat label="Sin foto" value={publishedWithoutPhoto} tone="rose" />
            <MiniStat label="Sin precio" value={vehiclesWithoutPrice} tone="slate" />
          </div>
        </div>
      </div>
    </DashboardChartCard>
  );
}

function MiniStat({ label, value, tone = "neutral" }: { label: string; value: number; tone?: "neutral" | "amber" | "rose" | "slate" }) {
  const toneClass =
    tone === "amber"
      ? "border-amber-200 bg-amber-50/80 text-amber-900"
      : tone === "rose"
        ? "border-rose-200 bg-rose-50/80 text-rose-900"
        : tone === "slate"
          ? "border-slate-200 bg-slate-50/80 text-slate-900"
          : "border-[#E5E7EB] bg-white text-[#111827]";

  return (
    <div className={["flex items-center justify-between rounded-2xl border px-4 py-3", toneClass].join(" ")}>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function TinyMetric({ label, value, tone }: { label: string; value: number; tone: "slate" | "amber" | "emerald" }) {
  const toneClass =
    tone === "amber"
      ? "border-amber-200 bg-amber-50/80 text-amber-900"
      : tone === "emerald"
        ? "border-emerald-200 bg-emerald-50/80 text-emerald-900"
        : "border-slate-200 bg-slate-50/80 text-slate-900";

  return (
    <div className={["rounded-2xl border px-4 py-3", toneClass].join(" ")}>
      <p className="text-xs uppercase tracking-[0.14em] opacity-70">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
