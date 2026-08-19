"use client";

import { useMemo, useState } from "react";

type ChartPoint = {
  key: string;
  label: string;
  units: number;
  soldByCurrency: Record<string, number>;
  commissionByCurrency: Record<string, number>;
};

export type VendorSeries = {
  id: string;
  name: string;
  color: string;
  points: ChartPoint[];
};

type Metric = "sold" | "units" | "commission";

const CHART_WIDTH = 820;
const CHART_HEIGHT = 280;
const PLOT_LEFT = 38;
const PLOT_RIGHT = 16;
const PLOT_TOP = 18;
const PLOT_BOTTOM = 34;
const COLORS = ["#8A1538", "#64748B", "#0F766E", "#B45309", "#475569", "#9F1239"];

function formatAmount(value: number, metric: Metric, currency: string) {
  if (metric === "units") return `${value} ${value === 1 ? "unidad" : "unidades"}`;
  const symbol = currency === "USD" ? "US$" : "$";
  return `${symbol} ${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(value)}`;
}

function getValue(point: ChartPoint, metric: Metric, currency: string) {
  if (metric === "units") return point.units;
  const values = metric === "sold" ? point.soldByCurrency : point.commissionByCurrency;
  return values[currency] ?? 0;
}

function getPath(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
}

export function ComisionesVendedoresChart({
  series,
  currencies,
}: {
  series: VendorSeries[];
  currencies: string[];
}) {
  const [metric, setMetric] = useState<Metric>("sold");
  const [currency, setCurrency] = useState(currencies[0] ?? "ARS");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const activeCurrency = currencies.includes(currency) ? currency : currencies[0] ?? "ARS";
  const chartSeries = series.filter((vendor) =>
    vendor.points.some((point) => getValue(point, metric, activeCurrency) > 0)
  );
  const months = series[0]?.points ?? [];
  const maxValue = Math.max(
    ...chartSeries.flatMap((vendor) => vendor.points.map((point) => getValue(point, metric, activeCurrency))),
    1
  );
  const plotWidth = CHART_WIDTH - PLOT_LEFT - PLOT_RIGHT;
  const plotHeight = CHART_HEIGHT - PLOT_TOP - PLOT_BOTTOM;
  const xFor = (index: number) =>
    months.length <= 1 ? PLOT_LEFT + plotWidth / 2 : PLOT_LEFT + (index / (months.length - 1)) * plotWidth;
  const yFor = (value: number) => PLOT_TOP + plotHeight - (value / maxValue) * plotHeight;
  const yTicks = [maxValue, maxValue / 2, 0];
  const tooltipLeft = hoveredIndex == null ? 0 : Math.min(Math.max((xFor(hoveredIndex) / CHART_WIDTH) * 100, 8), 76);

  const hoveredValues = useMemo(() => {
    if (hoveredIndex == null) return [];
    return chartSeries
      .map((vendor) => ({ vendor, value: getValue(vendor.points[hoveredIndex], metric, activeCurrency) }))
      .filter((entry) => entry.value > 0)
      .sort((left, right) => right.value - left.value);
  }, [activeCurrency, chartSeries, hoveredIndex, metric]);

  if (!series.length || !months.length) return null;

  return (
    <section className="rounded-md border border-[#E5E7EB] bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#E5E7EB] pb-3">
        <div>
          <h2 className="text-sm font-semibold text-[#111827]">Rendimiento por vendedor</h2>
          <p className="mt-0.5 text-xs text-[#6B7280]">Comparativa mensual de los últimos 12 meses.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <div className="inline-flex rounded-md border border-[#E5E7EB] bg-[#F9FAFB] p-0.5" role="group" aria-label="Métrica del gráfico">
            {([
              ["sold", "Monto vendido"],
              ["units", "Unidades"],
              ["commission", "Comisión"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMetric(value)}
                className={`rounded px-2 py-1 text-[11px] font-medium transition ${metric === value ? "bg-white text-[#8A1538] shadow-sm" : "text-[#6B7280] hover:text-[#111827]"}`}
              >
                {label}
              </button>
            ))}
          </div>
          {metric !== "units" && currencies.length > 1 ? (
            <select
              value={activeCurrency}
              onChange={(event) => setCurrency(event.target.value)}
              className="h-7 rounded-md border border-[#E5E7EB] bg-white px-2 text-[11px] font-medium text-[#111827] outline-none focus:border-[#8A1538]"
              aria-label="Moneda del gráfico"
            >
              {currencies.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          ) : null}
        </div>
      </div>

      <div className="relative mt-3 w-full overflow-x-auto">
        <div className="relative w-full min-w-[620px]">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            preserveAspectRatio="none"
            className="block h-[280px] w-full"
            role="img"
            aria-label="Comparativa mensual por vendedor"
          >
            {yTicks.map((tick, index) => {
              const y = yFor(tick);
              return (
                <g key={index}>
                  <line x1={PLOT_LEFT} x2={CHART_WIDTH - PLOT_RIGHT} y1={y} y2={y} stroke="#E5E7EB" strokeDasharray="3 4" />
                  <text x={PLOT_LEFT - 7} y={y + 3} textAnchor="end" fontSize="8" fill="#94A3B8">
                    {metric === "units" ? Math.round(tick) : new Intl.NumberFormat("es-AR", { notation: "compact", maximumFractionDigits: 1 }).format(tick)}
                  </text>
                </g>
              );
            })}
            {chartSeries.map((vendor) => {
              const points = vendor.points.map((point, index) => ({ x: xFor(index), y: yFor(getValue(point, metric, activeCurrency)) }));
              return (
                <g key={vendor.id}>
                  <path d={getPath(points)} fill="none" stroke={vendor.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {points.map((point, index) => (
                    <circle key={`${vendor.id}-${index}`} cx={point.x} cy={point.y} r={hoveredIndex === index ? 5 : 3.5} fill="white" stroke={vendor.color} strokeWidth="2" />
                  ))}
                </g>
              );
            })}
            {months.map((month, index) => (
              <g key={month.key} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
                <rect x={xFor(index) - 22} y={PLOT_TOP} width="44" height={plotHeight} fill="transparent" className="cursor-crosshair" />
                <text x={xFor(index)} y={CHART_HEIGHT - 9} textAnchor="middle" fontSize="8" fill="#64748B">{month.label}</text>
              </g>
            ))}
            {hoveredIndex != null ? <line x1={xFor(hoveredIndex)} x2={xFor(hoveredIndex)} y1={PLOT_TOP} y2={PLOT_TOP + plotHeight} stroke="#CBD5E1" strokeWidth="0.75" strokeDasharray="2 3" /> : null}
          </svg>
          {hoveredIndex != null ? (
          <div className="pointer-events-none absolute top-2 z-10 w-52 rounded-md border border-[#E5E7EB] bg-white p-2 text-[11px] shadow-sm" style={{ left: `${tooltipLeft}%` }}>
              <p className="font-semibold text-[#111827]">{months[hoveredIndex].label}</p>
              <div className="mt-2 space-y-1.5">
                {hoveredValues.length ? hoveredValues.map(({ vendor, value }) => (
                  <div key={vendor.id} className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5 text-[#6B7280]"><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: vendor.color }} /> <span className="truncate">{vendor.name}</span></span>
                    <span className="shrink-0 font-medium text-[#111827]">{formatAmount(value, metric, activeCurrency)}</span>
                  </div>
                )) : <p className="text-[#6B7280]">Sin actividad este mes.</p>}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-[#6B7280]">
        {series.map((vendor) => <span key={vendor.id} className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: vendor.color }} />{vendor.name}</span>)}
      </div>
    </section>
  );
}
