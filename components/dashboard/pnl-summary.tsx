import { formatCurrencyByCurrency } from "@/lib/dashboard-metrics";

type CurrencyTotals = {
  ARS: number;
  USD: number;
  other: Record<string, number>;
};

type MetricSeries = {
  label: string;
  totals: CurrencyTotals;
  tone: "emerald" | "slate" | "amber" | "rose" | "zinc";
};

function getCurrencyAmount(totals: CurrencyTotals, currency: string) {
  if (currency === "ARS") return totals.ARS ?? 0;
  if (currency === "USD") return totals.USD ?? 0;
  return totals.other?.[currency] ?? 0;
}

function formatMoney(currency: string, value: number) {
  const normalized = currency === "USD" ? "USD" : currency === "ARS" ? "ARS" : currency;
  const symbol = normalized === "USD" ? "US$" : normalized === "ARS" ? "$" : `${normalized} `;
  const formatted = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(Math.abs(value));

  return `${symbol} ${formatted}`.trim();
}

function formatSignedMoney(currency: string, value: number) {
  const prefix = value < 0 ? "-" : "";
  return `${prefix}${formatMoney(currency, value)}`;
}

function formatSignedCurrencyByCurrency(values: CurrencyTotals | Record<string, number | null | undefined>) {
  const normalized: CurrencyTotals = {
    ARS: Number(values?.ARS ?? 0),
    USD: Number(values?.USD ?? 0),
    other: values && typeof values.other === "object" ? { ...(values.other as Record<string, number>) } : {},
  };

  const parts: string[] = [];

  if (normalized.USD) parts.push(formatSignedMoney("USD", normalized.USD));
  if (normalized.ARS) parts.push(formatSignedMoney("ARS", normalized.ARS));

  for (const [currency, amount] of Object.entries(normalized.other)) {
    if (!amount) continue;
    parts.push(formatSignedMoney(currency, amount));
  }

  return parts.length ? parts.join(" · ") : "—";
}

function currencyEntries(...totals: CurrencyTotals[]) {
  const currencies = new Set<string>(["ARS", "USD"]);
  for (const total of totals) {
    for (const currency of Object.keys(total.other ?? {})) currencies.add(currency);
  }

  return Array.from(currencies).map((currency) => ({
    currency,
    sales: getCurrencyAmount(totals[0], currency),
    income: getCurrencyAmount(totals[1], currency),
    expense: getCurrencyAmount(totals[2], currency),
    commissions: getCurrencyAmount(totals[3], currency),
    result: getCurrencyAmount(totals[4], currency),
  }));
}

function toneClasses(tone: MetricSeries["tone"]) {
  switch (tone) {
    case "emerald":
      return "border-emerald-200 bg-emerald-50/80 text-emerald-800";
    case "amber":
      return "border-amber-200 bg-amber-50/80 text-amber-800";
    case "rose":
      return "border-rose-200 bg-rose-50/80 text-rose-800";
    case "slate":
      return "border-slate-200 bg-slate-50/80 text-slate-800";
    case "zinc":
    default:
      return "border-[#E5E7EB] bg-[#FAFAFA] text-[#111827]";
  }
}

function StatChip({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[#111827]">{value}</p>
      {note ? <p className="mt-1 text-xs text-[#6B7280]">{note}</p> : null}
    </div>
  );
}

function CurrencyChart({
  currency,
  series,
}: {
  currency: string;
  series: MetricSeries[];
}) {
  const max = Math.max(...series.map((item) => Math.abs(getCurrencyAmount(item.totals, currency))), 1);

  return (
    <div className="rounded-3xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">{currency}</p>
          <p className="text-sm font-semibold text-[#111827]">Flujo por categoría</p>
        </div>
        <p className="text-sm font-medium text-[#111827]">
          {formatMoney(currency, series.reduce((acc, item) => acc + getCurrencyAmount(item.totals, currency), 0))}
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {series.map((item) => {
          const value = getCurrencyAmount(item.totals, currency);
          const width = Math.max(8, (Math.abs(value) / max) * 100);
          const barTone =
            item.tone === "emerald"
              ? "bg-emerald-500"
              : item.tone === "amber"
                ? "bg-amber-500"
                : item.tone === "rose"
                  ? "bg-rose-500"
                  : item.tone === "slate"
                    ? "bg-slate-500"
                    : "bg-[#111827]";

          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-xs text-[#6B7280]">
                <span>{item.label}</span>
                <span>{formatSignedMoney(currency, value)}</span>
              </div>
              <div className="h-2 rounded-full bg-white">
                <div className={`h-2 rounded-full ${barTone}`} style={{ width: `${width}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PnlSummary({
  sales,
  cashIncome,
  cashExpense,
  commissionsPaid,
  operatingResult,
  salesCount,
  salesMarginDescription,
}: {
  sales: CurrencyTotals;
  cashIncome: CurrencyTotals;
  cashExpense: CurrencyTotals;
  commissionsPaid: CurrencyTotals;
  operatingResult: CurrencyTotals;
  salesCount: number;
  salesMarginDescription: string;
}) {
  const series: MetricSeries[] = [
    { label: "Ventas registradas", totals: sales, tone: "emerald" },
    { label: "Ingresos de caja", totals: cashIncome, tone: "slate" },
    { label: "Egresos de caja", totals: cashExpense, tone: "amber" },
    { label: "Comisiones pagadas", totals: commissionsPaid, tone: "rose" },
    { label: "Resultado", totals: operatingResult, tone: "zinc" },
  ];

  const currencies = currencyEntries(sales, cashIncome, cashExpense, commissionsPaid, operatingResult);

  return (
    <section className="rounded-[32px] border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#E5E7EB] p-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#111827]">P&L del mes</h2>
            <span className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
              sin conversión
            </span>
          </div>
          <p className="mt-1 text-sm text-[#6B7280]">Lectura ejecutiva de ventas, caja y resultado operativo.</p>
        </div>
        <p className="text-sm text-[#6B7280]">{salesMarginDescription}</p>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.95fr)]">
        <div className="space-y-5">
          <div className="rounded-[28px] bg-[#111827] p-5 text-white shadow-lg shadow-black/10">
            <p className="text-xs uppercase tracking-[0.14em] text-white/60">Resultado operativo estimado</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="text-4xl font-semibold tracking-tight">{formatSignedCurrencyByCurrency(operatingResult)}</p>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.14em] text-white/60">Ventas del mes</p>
                <p className="text-xl font-semibold">{salesCount}</p>
              </div>
            </div>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
              El resultado se calcula como ingresos de caja menos egresos y comisiones pagadas.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <StatChip
              label="Ventas registradas"
              value={formatCurrencyByCurrency(sales)}
              note="Operaciones cerradas en el período."
            />
            <StatChip
              label="Ingresos de caja"
              value={formatCurrencyByCurrency(cashIncome)}
              note="Cobros confirmados en caja."
            />
            <StatChip
              label="Egresos de caja"
              value={formatCurrencyByCurrency(cashExpense)}
              note="Salidas operativas del mes."
            />
            <StatChip
              label="Comisiones pagadas"
              value={formatCurrencyByCurrency(commissionsPaid)}
              note="Liquidaciones efectivizadas."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {currencies.map((currency) => (
              <CurrencyChart
                key={currency.currency}
                currency={currency.currency}
                series={series}
              />
            ))}
          </div>
          <div className="rounded-[28px] border border-[#E5E7EB] bg-[#FAFAFA] p-4">
            <p className="text-sm font-medium text-[#111827]">Margin visual</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B7280]">Ventas con costo relacionable</span>
                <span className="font-medium text-[#111827]">{salesCount}</span>
              </div>
              <div className="h-2 rounded-full bg-white">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, salesCount * 12)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
