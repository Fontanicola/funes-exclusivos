"use client";

import type { MonthlyPnlPoint } from "@/lib/dashboard-metrics";
import { DashboardChartCard } from "@/components/dashboard/dashboard-chart-card";

type MonthlyPnlChartProps = {
  seriesByCurrency: Record<string, MonthlyPnlPoint[]>;
  className?: string;
  compact?: boolean;
};

const currencyOrder = ["USD", "ARS"];

function currencyLabel(currency: string) {
  if (currency === "USD") return "US$";
  if (currency === "ARS") return "$";
  return currency;
}

function formatAmount(value: number, currency: string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency === "USD" ? "USD" : "ARS",
    maximumFractionDigits: 0,
  }).format(value).replace("US$", "US$").replace("ARS", "$");
}

function toneClass(kind: "income" | "expense" | "result") {
  if (kind === "income") return "bg-emerald-500";
  if (kind === "expense") return "bg-rose-500";
  return "bg-slate-500";
}

export function MonthlyPnlChart({ seriesByCurrency, className = "", compact = false }: MonthlyPnlChartProps) {
  const currencies = currencyOrder.filter((currency) => (seriesByCurrency[currency] ?? []).length > 0);
  const fallbackCurrencies = Object.keys(seriesByCurrency).filter((currency) => !currencyOrder.includes(currency));
  const allCurrencies = [...currencies, ...fallbackCurrencies];

  if (!allCurrencies.length) {
    const emptyState = (
      <div className="rounded-md border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-5 py-8 text-sm text-[#6B7280]">
        Sin datos suficientes para graficar la serie mensual.
      </div>
    );

    if (compact) return emptyState;

    return (
      <DashboardChartCard
        title="P&L mensual"
        description="Ingresos, egresos y resultado de los últimos 12 meses."
        className={className}
      >
        {emptyState}
      </DashboardChartCard>
    );
  }

  const chart = (
    <div className="space-y-6">
      {allCurrencies.map((currency) => {
        const points = seriesByCurrency[currency] ?? [];
        const max = Math.max(
          ...points.flatMap((point) => [Math.abs(point.income), Math.abs(point.expense), Math.abs(point.result)]),
          1
        );

        return (
          <div key={currency} className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">{currencyLabel(currency)}</p>
                <p className="text-sm font-semibold text-[#111827]">Serie de 12 meses</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                <LegendDot tone="bg-emerald-500" label="Ingresos" />
                <LegendDot tone="bg-rose-500" label="Egresos" />
                <LegendDot tone="bg-slate-500" label="Resultado" />
              </div>
            </div>

            <div className="mt-4 overflow-x-auto pb-1">
              <div className="min-w-[760px]">
                <div className="flex items-end gap-2">
                  {points.map((point) => {
                    const incomeHeight = Math.max(12, (Math.abs(point.income) / max) * 140);
                    const expenseHeight = Math.max(12, (Math.abs(point.expense) / max) * 140);
                    const resultHeight = Math.max(12, (Math.abs(point.result) / max) * 140);

                    return (
                      <div
                        key={point.monthKey}
                        className="group relative flex flex-1 cursor-default flex-col items-center gap-2 rounded-md px-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-[#8A1538]"
                        tabIndex={0}
                        aria-label={`${point.label}: ingresos ${formatAmount(point.income, currency)}, egresos ${formatAmount(point.expense, currency)}, resultado ${formatAmount(point.result, currency)}, ${point.salesCount} ventas`}
                      >
                        <div className="pointer-events-none absolute bottom-[74px] left-1/2 z-10 hidden w-52 -translate-x-1/2 rounded-md border border-[#E5E7EB] bg-white p-3 text-left shadow-lg group-hover:block group-focus-within:block">
                          <p className="text-xs font-semibold text-[#111827]">{point.label}</p>
                          <div className="mt-2 space-y-1 text-xs text-[#6B7280]">
                            <p className="flex items-center justify-between gap-3"><span>Ingresos</span><strong className="font-medium text-emerald-700">{formatAmount(point.income, currency)}</strong></p>
                            <p className="flex items-center justify-between gap-3"><span>Egresos</span><strong className="font-medium text-rose-700">{formatAmount(point.expense, currency)}</strong></p>
                            <p className="flex items-center justify-between gap-3"><span>Resultado</span><strong className="font-medium text-slate-700">{formatAmount(point.result, currency)}</strong></p>
                            <p className="border-t border-[#E5E7EB] pt-1 text-[#111827]">{point.salesCount} ventas</p>
                          </div>
                        </div>
                        <div className="flex h-[160px] items-end gap-1.5">
                          <Bar height={incomeHeight} tone="income" />
                          <Bar height={expenseHeight} tone="expense" />
                          <Bar height={resultHeight} tone="result" />
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-[0.12em] text-[#6B7280]">{point.label}</p>
                          <p className="text-[11px] font-medium text-[#111827]">{point.salesCount} ventas</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (compact) return chart;

  return (
    <DashboardChartCard
      title="P&L mensual"
      description="Ingresos, egresos y resultado de los últimos 12 meses."
      className={className}
    >
      {chart}
    </DashboardChartCard>
  );
}

function LegendDot({ tone, label }: { tone: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={["h-2.5 w-2.5 rounded-full", tone].join(" ")} />
      {label}
    </span>
  );
}

function Bar({ height, tone }: { height: number; tone: "income" | "expense" | "result" }) {
  return <div className={["w-3 rounded-full", toneClass(tone)].join(" ")} style={{ height }} />;
}
