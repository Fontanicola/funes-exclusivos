import Link from "next/link";
import { DashboardChartCard } from "@/components/dashboard/dashboard-chart-card";
import { SimpleBarChart } from "@/components/dashboard/simple-bar-chart";
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
  canViewCosts = true,
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
  canViewCosts?: boolean;
}) {
  const publicationRate = totalStock > 0 ? Math.round((published / totalStock) * 100) : 0;

  return (
    <DashboardChartCard
      title="Inventario"
      description="Stock disponible, publicación online y preparación."
      action={
        <Link
          href="/inventario"
          className="text-sm font-medium text-[#6B7280] underline-offset-4 hover:text-[#111827] hover:underline"
        >
          Ver inventario
        </Link>
      }
    >
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Stock disponible" value={totalStock} note={totalStock > 0 ? "Unidades en stock" : "Inventario pendiente de carga"} />
            <Stat label="Publicados" value={published} note={`${publicationRate}% del stock`} />
            <Stat label="Preparación pendiente" value={preparationPending} note="Unidades por terminar" tone="amber" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {canViewCosts ? (
              <Stat label="Valor estimado" value={formatCurrencyByCurrency(stockValued)} note="Stock visible y valorizado" tone="emerald" />
            ) : (
              <Stat label="Valor del stock" value="Reservado" note="Visible solo para administración" tone="slate" />
            )}
            <Stat label="Destacados" value={highlighted} note="Prioridad comercial" tone="slate" />
          </div>

          <div className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#111827]">Preparación y exposición</p>
                <p className="mt-1 text-xs text-[#6B7280]">Lo que está listo, en proceso o esperando publicación.</p>
              </div>
              <p className="text-xs text-[#6B7280]">{publishedWithoutPhoto} sin foto · {vehiclesWithoutPrice} sin precio</p>
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

        <div className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#111827]">Estado rápido</p>
              <p className="mt-1 text-xs text-[#6B7280]">Señales que afectan publicación y venta.</p>
            </div>
            <p className="text-xs text-[#6B7280]">
              {sold} vendidos · {consignment} consignación
            </p>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <MiniStat label="Sin publicar" value={unpublishedStock} tone="amber" />
            <MiniStat label="Sin foto" value={publishedWithoutPhoto} tone="rose" />
            <MiniStat label="Sin precio" value={vehiclesWithoutPrice} tone="slate" />
          </div>
        </div>
      </div>
    </DashboardChartCard>
  );
}

function Stat({
  label,
  value,
  note,
  tone = "default",
}: {
  label: string;
  value: number | string;
  note: string;
  tone?: "default" | "amber" | "emerald" | "slate";
}) {
  const toneClass =
    tone === "amber"
      ? "border-amber-200 bg-amber-50/80 text-amber-950"
      : tone === "emerald"
        ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
        : tone === "slate"
          ? "border-slate-200 bg-slate-50/80 text-slate-950"
          : "border-[#E5E7EB] bg-white text-[#111827]";

  return (
    <div className={["rounded-md border px-4 py-4", toneClass].join(" ")}>
      <p className="text-xs uppercase tracking-[0.14em] opacity-70">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs opacity-75">{note}</p>
    </div>
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
    <div className={["flex items-center justify-between rounded-md border px-4 py-3", toneClass].join(" ")}>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
