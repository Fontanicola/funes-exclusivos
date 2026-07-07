import { formatCurrencyByCurrency, groupAmountByCurrency, isCurrentMonth } from "@/lib/dashboard-metrics";

type Compra = {
  fecha: string | null;
  precio_compra: number | null;
  moneda: string | null;
  deuda_pendiente: number | null;
  vehiculo?: {
    estado: string | null;
  } | null;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-AR").format(value);
}

export function CompraKpis({ compras }: { compras: Compra[] }) {
  const currentMonthPurchases = compras.filter((compra) => isCurrentMonth(compra.fecha));
  const purchasedAmount = groupAmountByCurrency(currentMonthPurchases, "precio_compra", "moneda");
  const debtAmount = groupAmountByCurrency(
    currentMonthPurchases.filter((compra) => (compra.deuda_pendiente ?? 0) > 0),
    "deuda_pendiente",
    "moneda"
  );
  const stockUnits = currentMonthPurchases.filter((compra) => compra.vehiculo?.estado === "en_stock").length || currentMonthPurchases.length;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-[#6B7280]">Compras del mes</p>
        <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">{formatNumber(currentMonthPurchases.length)}</p>
      </article>
      <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-[#6B7280]">Monto comprado del mes</p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">
          {formatCurrencyByCurrency(purchasedAmount)}
        </p>
      </article>
      <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-[#6B7280]">Deuda pendiente</p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">
          {formatCurrencyByCurrency(debtAmount)}
        </p>
      </article>
      <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-[#6B7280]">Unidades ingresadas a stock</p>
        <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">{formatNumber(stockUnits)}</p>
      </article>
    </div>
  );
}
