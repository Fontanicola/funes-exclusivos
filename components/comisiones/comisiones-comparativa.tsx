"use client";

import { useMemo } from "react";

type Comision = {
  id: string;
  base_comision: number | null;
  porcentaje: number | null;
  monto_comision: number | null;
  moneda: string | null;
  estado: string | null;
  vendedor: {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
  } | null;
  venta: {
    id: string;
    precio_venta: number | null;
    moneda: string | null;
    estado: string | null;
  } | null;
};

type VendorSummary = {
  id: string;
  name: string;
  units: number;
  soldByCurrency: Map<string, number>;
  commissionByCurrency: Map<string, number>;
  totalSoldNominal: number;
  totalCommissionNominal: number;
};

function formatAmount(value: number) {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
}

function formatMoney(value: number, currency: string | null) {
  const isoCurrency = (currency ?? "").toLowerCase() === "usd" ? "USD" : "ARS";
  const symbol = isoCurrency === "USD" ? "US$" : "$";
  return `${symbol} ${formatAmount(value)}`;
}

function formatCurrencyBreakdown(groups: Map<string, number>) {
  const entries = Array.from(groups.entries()).sort(([left], [right]) =>
    left.localeCompare(right)
  );

  if (!entries.length) return "—";

  return entries
    .map(([currency, total]) => formatMoney(total, currency))
    .join(" · ");
}

function summarizeCurrencyMap(groups: Map<string, number>) {
  const entries = Array.from(groups.entries());

  if (!entries.length) return "—";
  if (entries.length === 1) {
    const [currency, total] = entries[0];
    return formatMoney(total, currency);
  }

  return "Mixto";
}

function getSellerName(comision: Comision) {
  return comision.vendedor?.nombre ?? "Sin vendedor";
}

function getEffectiveRate(summary: VendorSummary) {
  const soldEntries = Array.from(summary.soldByCurrency.entries());
  const commissionEntries = Array.from(summary.commissionByCurrency.entries());
  if (soldEntries.length !== 1 || commissionEntries.length !== 1) return null;
  if (soldEntries[0][0] !== commissionEntries[0][0] || soldEntries[0][1] <= 0) return null;
  return (commissionEntries[0][1] / soldEntries[0][1]) * 100;
}

export function ComisionesComparativa({ comisiones }: { comisiones: Comision[] }) {
  const summaries = useMemo(() => {
    const groups = new Map<string, VendorSummary>();

    for (const comision of comisiones) {
      if (comision.estado === "anulada") continue;

      const sellerName = getSellerName(comision);
      const key = comision.vendedor?.id ?? sellerName;
      const current =
        groups.get(key) ??
        ({
          id: key,
          name: sellerName,
          units: 0,
          soldByCurrency: new Map<string, number>(),
          commissionByCurrency: new Map<string, number>(),
          totalSoldNominal: 0,
          totalCommissionNominal: 0,
        } as VendorSummary);

      current.units += 1;

      const saleCurrency = (comision.venta?.moneda ?? comision.moneda ?? "ARS").toUpperCase();
      const saleAmount = comision.venta?.precio_venta ?? 0;
      current.soldByCurrency.set(
        saleCurrency,
        (current.soldByCurrency.get(saleCurrency) ?? 0) + saleAmount
      );

      const commissionCurrency = (comision.moneda ?? "ARS").toUpperCase();
      const commissionAmount = comision.monto_comision ?? 0;
      current.commissionByCurrency.set(
        commissionCurrency,
        (current.commissionByCurrency.get(commissionCurrency) ?? 0) + commissionAmount
      );

      current.totalSoldNominal += saleAmount;
      current.totalCommissionNominal += commissionAmount;

      groups.set(key, current);
    }

    return Array.from(groups.values()).sort(
      (left, right) => right.totalCommissionNominal - left.totalCommissionNominal
    );
  }, [comisiones]);

  const maxSold = Math.max(...summaries.map((summary) => summary.totalSoldNominal), 0);
  const maxCommission = Math.max(...summaries.map((summary) => summary.totalCommissionNominal), 0);

  if (!summaries.length) {
    return (
      <section className="rounded-md border border-[#E5E7EB] bg-white p-4">
        <div className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-6 text-sm text-[#6B7280]">
          No hay comisiones para comparar todavía.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-[#E5E7EB] bg-white p-4">
      <div className="space-y-1 border-b border-[#E5E7EB] pb-4">
        <h2 className="text-base font-semibold text-[#111827]">Comparativa comercial</h2>
        <p className="text-sm text-[#6B7280]">
          Volumen vendido y comisión generada por vendedor.
        </p>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {summaries.map((summary) => {
          const soldBarWidth = maxSold > 0 ? Math.max((summary.totalSoldNominal / maxSold) * 100, 5) : 0;
          const commissionBarWidth = maxCommission > 0 ? Math.max((summary.totalCommissionNominal / maxCommission) * 100, 5) : 0;
          const effectiveRate = getEffectiveRate(summary);

          return (
            <article key={summary.id} className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-4 transition hover:border-[#D8A1B2]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#111827]">{summary.name}</p>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    {summary.units} {summary.units === 1 ? "unidad vendida" : "unidades vendidas"}
                  </p>
                </div>
                {effectiveRate != null ? (
                  <span className="shrink-0 rounded-full border border-[#D8A1B2] bg-[#FDF2F5] px-2.5 py-1 text-xs font-medium text-[#8A1538]">
                    {effectiveRate.toLocaleString("es-AR", { maximumFractionDigits: 2 })}% sobre ventas
                  </span>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <MetricBlock
                  label="Vendido"
                  value={summarizeCurrencyMap(summary.soldByCurrency)}
                  detail={formatCurrencyBreakdown(summary.soldByCurrency)}
                  barWidth={soldBarWidth}
                  barClassName="bg-slate-500"
                />
                <MetricBlock
                  label="Comisión"
                  value={summarizeCurrencyMap(summary.commissionByCurrency)}
                  detail={formatCurrencyBreakdown(summary.commissionByCurrency)}
                  barWidth={commissionBarWidth}
                  barClassName="bg-[#8A1538]"
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MetricBlock({
  label,
  value,
  detail,
  barWidth,
  barClassName,
}: {
  label: string;
  value: string;
  detail: string;
  barWidth: number;
  barClassName: string;
}) {
  return (
    <div className="min-w-0 rounded-md border border-[#E5E7EB] bg-white p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-medium text-[#6B7280]">{label}</p>
        <p className="truncate text-sm font-semibold text-[#111827]">{value}</p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
        <div className={`h-full rounded-full transition-all ${barClassName}`} style={{ width: `${barWidth}%` }} />
      </div>
      <p className="mt-2 truncate text-xs text-[#6B7280]">{detail}</p>
    </div>
  );
}
