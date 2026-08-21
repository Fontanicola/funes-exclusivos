"use client";

import type { MonthlyPnlPoint } from "@/lib/dashboard-metrics";
import { DashboardChartCard } from "@/components/dashboard/dashboard-chart-card";

type MonthlyPnlChartProps = {
  seriesByCurrency: Record<string, MonthlyPnlPoint[]>;
  className?: string;
  compact?: boolean;
};

const currencyOrder = ["USD", "ARS"];
const chartWidth = 900;
const chartHeight = 250;
const padding = { top: 20, right: 24, bottom: 42, left: 48 };

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
  }).format(value);
}

function pointsFor(values: number[], min: number, max: number) {
  const usableWidth = chartWidth - padding.left - padding.right;
  const usableHeight = chartHeight - padding.top - padding.bottom;
  const range = max - min || 1;
  return values.map((value, index) => ({
    x: padding.left + (values.length <= 1 ? usableWidth / 2 : (index / (values.length - 1)) * usableWidth),
    y: padding.top + ((max - value) / range) * usableHeight,
  }));
}

function linePath(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
}

function niceScale(points: MonthlyPnlPoint[]) {
  const values = points.flatMap((point) => [point.income, point.expense, point.result]);
  const min = Math.min(0, ...values);
  const max = Math.max(1, ...values);
  const paddingValue = (max - min || 1) * 0.12;
  return { min: min - paddingValue, max: max + paddingValue };
}

export function MonthlyPnlChart({ seriesByCurrency, className = "", compact = false }: MonthlyPnlChartProps) {
  const currencies = currencyOrder.filter((currency) => (seriesByCurrency[currency] ?? []).length > 0);
  const fallbackCurrencies = Object.keys(seriesByCurrency).filter((currency) => !currencyOrder.includes(currency));
  const allCurrencies = [...currencies, ...fallbackCurrencies];

  if (!allCurrencies.length) {
    const emptyState = <div className="rounded-md border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-5 py-8 text-sm text-[#6B7280]">Sin datos suficientes para graficar la serie mensual.</div>;
    if (compact) return emptyState;
    return <DashboardChartCard title="Tendencia financiera" description="Ingresos, egresos y resultado de los últimos 12 meses." className={className}>{emptyState}</DashboardChartCard>;
  }

  const chart = <div className="space-y-5">
    {allCurrencies.map((currency) => {
      const points = seriesByCurrency[currency] ?? [];
      const scale = niceScale(points);
      const incomePoints = pointsFor(points.map((point) => point.income), scale.min, scale.max);
      const expensePoints = pointsFor(points.map((point) => point.expense), scale.min, scale.max);
      const resultPoints = pointsFor(points.map((point) => point.result), scale.min, scale.max);
      const usableHeight = chartHeight - padding.top - padding.bottom;
      const zeroY = padding.top + ((scale.max - 0) / (scale.max - scale.min)) * usableHeight;

      return <div key={currency} className="overflow-hidden rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A1538]">{currencyLabel(currency)}</p><p className="mt-1 text-sm font-semibold text-[#111827]">Evolución mensual</p></div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#6B7280]"><Legend color="#10B981" label="Ingresos" /><Legend color="#F43F5E" label="Egresos" /><Legend color="#8A1538" label="Resultado" /></div>
        </div>
        <div className="mt-3 overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label={`Tendencia financiera en ${currencyLabel(currency)}`} className="h-[220px] min-w-[680px] w-full">
            {[0, 1, 2, 3].map((step) => {
              const y = padding.top + (step / 3) * usableHeight;
              const value = scale.max - (step / 3) * (scale.max - scale.min);
              return <g key={step}><line x1={padding.left} x2={chartWidth - padding.right} y1={y} y2={y} stroke="#E5E7EB" strokeDasharray="3 5" /><text x="0" y={y + 4} fontSize="10" fill="#94A3B8">{formatAmount(value, currency)}</text></g>;
            })}
            <line x1={padding.left} x2={chartWidth - padding.right} y1={zeroY} y2={zeroY} stroke="#CBD5E1" />
            <path d={linePath(incomePoints)} fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d={linePath(expensePoints)} fill="none" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={linePath(resultPoints)} fill="none" stroke="#8A1538" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((point, index) => <g key={point.monthKey}>
              <circle cx={incomePoints[index].x} cy={incomePoints[index].y} r="4" fill="#fff" stroke="#10B981" strokeWidth="2"><title>{`${point.label}: ingresos ${formatAmount(point.income, currency)}`}</title></circle>
              <circle cx={expensePoints[index].x} cy={expensePoints[index].y} r="4" fill="#fff" stroke="#F43F5E" strokeWidth="2"><title>{`${point.label}: egresos ${formatAmount(point.expense, currency)}`}</title></circle>
              <circle cx={resultPoints[index].x} cy={resultPoints[index].y} r="4.5" fill="#8A1538" stroke="#fff" strokeWidth="2"><title>{`${point.label}: resultado ${formatAmount(point.result, currency)} · ${point.salesCount} ventas`}</title></circle>
              <text x={resultPoints[index].x} y={chartHeight - 16} textAnchor="middle" fontSize="10" fill="#64748B">{point.label}</text>
            </g>)}
          </svg>
        </div>
      </div>;
    })}
  </div>;

  if (compact) return chart;
  return <DashboardChartCard title="Tendencia financiera" description="Ingresos, egresos y resultado de los últimos 12 meses." className={className}>{chart}</DashboardChartCard>;
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />{label}</span>;
}
