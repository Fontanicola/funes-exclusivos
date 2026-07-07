import Link from "next/link";
import { formatCurrencyByCurrency } from "@/lib/dashboard-metrics";

type CurrencyTotals = {
  ARS: number;
  USD: number;
  other: Record<string, number>;
};

function getTotalInventory(totalStock: number, sold: number, consignment: number) {
  return Math.max(totalStock + sold + consignment, 1);
}

function DonutChart({
  stock,
  sold,
  consignment,
}: {
  stock: number;
  sold: number;
  consignment: number;
}) {
  const total = getTotalInventory(stock, sold, consignment);
  const hasData = stock + sold + consignment > 0;
  const stockShare = hasData ? (stock / total) * 100 : 0;
  const soldShare = hasData ? (sold / total) * 100 : 0;
  const consignmentShare = hasData ? (consignment / total) * 100 : 0;

  return (
    <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: hasData
            ? `conic-gradient(#111827 0 ${stockShare}%, #34d399 ${stockShare}% ${stockShare + soldShare}%, #f59e0b ${stockShare + soldShare}% 100%)`
            : "conic-gradient(#e5e7eb 0 100%)",
        }}
      />
      <div className="absolute inset-[18px] rounded-full border border-[#E5E7EB] bg-white shadow-inner" />
      <div className="relative z-10 text-center">
        <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">Stock total</p>
        <p className="mt-1 text-3xl font-semibold text-[#111827]">{stock}</p>
        <p className="mt-1 text-xs text-[#6B7280]">de {total} unidades visibles</p>
      </div>

        <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[10px] font-medium text-[#6B7280] shadow-sm">
        <span>Stock {stock}</span>
        <span>Vendidos {sold}</span>
        <span>Consignación {consignment}</span>
      </div>
    </div>
  );
}

function StatusRow({
  label,
  value,
  total,
  tone = "neutral",
}: {
  label: string;
  value: number;
  total: number;
  tone?: "neutral" | "success" | "warning" | "info";
}) {
  const width = total > 0 ? Math.max(8, (value / total) * 100) : 0;
  const toneClass =
    tone === "success"
      ? "bg-emerald-500"
      : tone === "warning"
        ? "bg-amber-500"
        : tone === "info"
          ? "bg-slate-500"
          : "bg-[#111827]";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#6B7280]">{label}</span>
        <span className="font-medium text-[#111827]">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-white">
        <div className={`h-2 rounded-full ${toneClass}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function InventorySummary({
  totalStock,
  stockValued,
  sold,
  consignment,
  published,
  highlighted,
  unpublishedStock,
}: {
  totalStock: number;
  stockValued: CurrencyTotals;
  sold: number;
  consignment: number;
  published: number;
  highlighted: number;
  unpublishedStock: number;
}) {
  const totalInventory = getTotalInventory(totalStock, sold, consignment);
  const publicationRate = totalStock > 0 ? Math.round((published / totalStock) * 100) : 0;

  return (
    <section className="rounded-[32px] border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] p-5">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">Inventario y catálogo</h2>
          <p className="mt-1 text-sm text-[#6B7280]">Stock disponible, exposición online y mix operativo.</p>
        </div>
        <Link
          href="/inventario"
          className="text-sm font-medium text-[#6B7280] underline-offset-4 hover:text-[#111827] hover:underline"
        >
          Ver inventario
        </Link>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_220px]">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[28px] border border-[#E5E7EB] bg-[#111827] p-5 text-white shadow-lg shadow-black/10 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.14em] text-white/60">Stock visible</p>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-4xl font-semibold tracking-tight">{totalStock}</p>
                  <p className="mt-2 text-sm text-white/70">Unidades listas para mover entre venta y catálogo.</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/60">Publicación</p>
                  <p className="text-2xl font-semibold">{publicationRate}%</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">Valor publicado</p>
              <p className="mt-2 text-lg font-semibold text-[#111827]">{formatCurrencyByCurrency(stockValued)}</p>
              <p className="mt-2 text-xs text-[#6B7280]">Suma estimada del stock publicado.</p>
            </div>
            <div className="rounded-3xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">Destacados</p>
              <p className="mt-2 text-3xl font-semibold text-[#111827]">{highlighted}</p>
              <p className="mt-2 text-xs text-[#6B7280]">Unidades que merecen mayor visibilidad.</p>
            </div>
          </div>

          <div className="grid gap-3 rounded-[28px] border border-[#E5E7EB] bg-[#FAFAFA] p-4 sm:grid-cols-2">
            <StatusRow label="Vehículos en stock" value={totalStock} total={totalInventory} tone="neutral" />
            <StatusRow label="Vendidos" value={sold} total={totalInventory} tone="success" />
            <StatusRow label="En consignación" value={consignment} total={totalInventory} tone="warning" />
            <StatusRow label="Sin publicar" value={unpublishedStock} total={Math.max(totalStock, 1)} tone="info" />
          </div>
        </div>

        <div className="rounded-[28px] border border-[#E5E7EB] bg-[#FAFAFA] p-4">
          <p className="text-sm font-semibold text-[#111827]">Distribución rápida</p>
          <div className="mt-4">
            <DonutChart stock={totalStock} sold={sold} consignment={consignment} />
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2">
              <span className="text-sm text-[#6B7280]">Publicados</span>
              <span className="text-sm font-medium text-[#111827]">{published}</span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2">
              <span className="text-sm text-[#6B7280]">Destacados</span>
              <span className="text-sm font-medium text-[#111827]">{highlighted}</span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2">
              <span className="text-sm text-[#6B7280]">Sin publicar</span>
              <span className="text-sm font-medium text-[#111827]">{unpublishedStock}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
