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
    .map(([currency, total]) => `${currency} ${formatMoney(total, currency)}`)
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
  return comision.vendedor?.nombre ?? comision.vendedor?.email ?? "Sin vendedor";
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

  const maxCommission = summaries[0]?.totalCommissionNominal ?? 0;

  if (!summaries.length) {
    return (
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-6 text-sm text-[#6B7280]">
          No hay comisiones para comparar todavía.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="space-y-1 border-b border-[#E5E7EB] pb-4">
        <h2 className="text-base font-semibold text-[#111827]">Comparativa comercial</h2>
        <p className="text-sm text-[#6B7280]">
          Ranking por vendedor según comisiones generadas y volumen vendido.
        </p>
      </div>

      <div className="mt-4 space-y-4">
        {summaries.map((summary) => {
          const barWidth = maxCommission > 0 ? Math.max((summary.totalCommissionNominal / maxCommission) * 100, 6) : 0;

          return (
            <article key={summary.id} className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{summary.name}</p>
                    <p className="text-xs text-[#6B7280]">{summary.units} unidades vendidas</p>
                  </div>

                  <div className="grid gap-2 text-sm text-[#111827] sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">
                        Monto total vendido
                      </p>
                      <p className="mt-1 font-medium">
                        {summarizeCurrencyMap(summary.soldByCurrency)}
                      </p>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        {formatCurrencyBreakdown(summary.soldByCurrency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">
                        Comisión generada
                      </p>
                      <p className="mt-1 font-medium">
                        {summarizeCurrencyMap(summary.commissionByCurrency)}
                      </p>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        {formatCurrencyBreakdown(summary.commissionByCurrency)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="min-w-[220px] flex-1 lg:max-w-[360px]">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.12em] text-[#6B7280]">
                    <span>Comisión</span>
                    <span>{formatAmount(summary.totalCommissionNominal)}</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#E5E7EB]">
                    <div
                      className="h-full rounded-full bg-[#18181B] transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-[#6B7280]">
                    {formatCurrencyBreakdown(summary.commissionByCurrency)}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
