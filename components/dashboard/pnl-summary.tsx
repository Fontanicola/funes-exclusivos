import { MonthlyPnlChart } from "@/components/dashboard/monthly-pnl-chart";
import { formatCurrencyByCurrency } from "@/lib/dashboard-metrics";

type CurrencyTotals = {
  ARS: number;
  USD: number;
  other: Record<string, number>;
};

type PnlSummaryProps = {
  sales: CurrencyTotals;
  cashIncome: CurrencyTotals;
  cashExpense: CurrencyTotals;
  purchases: CurrencyTotals;
  commissionsPaid: CurrencyTotals;
  otherExpenses: CurrencyTotals;
  operatingResult: CurrencyTotals;
  annualOperatingResult: CurrencyTotals;
  salesCount: number;
  salesMarginDescription: string;
  monthlySeriesByCurrency: Record<string, Array<any>>;
};

function CurrencyMetric({
  label,
  value,
  note,
  tone = "neutral",
}: {
  label: string;
  value: string;
  note?: string;
  tone?: "neutral" | "emerald" | "amber" | "rose" | "slate" | "highlight";
}) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50/80 text-amber-950"
        : tone === "rose"
          ? "border-rose-200 bg-rose-50/80 text-rose-950"
          : tone === "slate"
            ? "border-slate-200 bg-slate-50/80 text-slate-950"
            : tone === "highlight"
              ? "border-[#111827] bg-[#111827] text-white"
            : "border-[#E5E7EB] bg-[#FAFAFA] text-[#111827]";

  return (
    <div className={["rounded-3xl border p-4", toneClass].join(" ")}>
      <p className="text-xs uppercase tracking-[0.14em] opacity-70">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-tight">{value}</p>
      {note ? <p className="mt-2 text-xs opacity-75">{note}</p> : null}
    </div>
  );
}

export function PnlSummary({
  sales,
  cashIncome,
  cashExpense,
  purchases,
  commissionsPaid,
  otherExpenses,
  operatingResult,
  annualOperatingResult,
  salesCount,
  salesMarginDescription,
  monthlySeriesByCurrency,
}: PnlSummaryProps) {
  return (
    <section className="rounded-[32px] border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex items-end justify-between gap-4 border-b border-[#E5E7EB] p-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#111827]">P&amp;L financiero</h2>
            <span className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
              Monedas separadas
            </span>
          </div>
          <p className="mt-1 text-sm text-[#6B7280]">Resultado mensual, anual acumulado y serie de los últimos 12 meses.</p>
        </div>
        <p className="text-sm text-[#6B7280]">{salesMarginDescription}</p>
      </div>

      <div className="space-y-6 p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="rounded-[28px] bg-[#111827] p-5 text-white shadow-lg shadow-black/10">
            <p className="text-xs uppercase tracking-[0.14em] text-white/60">Resultado operativo mensual</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-4xl font-semibold tracking-tight">{formatCurrencyByCurrency(operatingResult)}</p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                  Ingresos de ventas y caja menos compras, egresos y comisiones pagadas.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/55">Ventas del mes</p>
                <p className="text-2xl font-semibold">{salesCount}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <CurrencyMetric
                label="Ventas"
                value={formatCurrencyByCurrency(sales)}
                note="Operaciones registradas en el período."
                tone="emerald"
              />
              <CurrencyMetric
                label="Caja neta"
                value={formatCurrencyByCurrency(subtractCurrencyTotals(cashIncome, cashExpense))}
                note="Cobros menos salidas de caja."
                tone="slate"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <CurrencyMetric
              label="Ingresos de caja"
              value={formatCurrencyByCurrency(cashIncome)}
              note="Cobros efectivamente acreditados."
              tone="emerald"
            />
            <CurrencyMetric
              label="Egresos de caja"
              value={formatCurrencyByCurrency(cashExpense)}
              note="Salidas reales del negocio."
              tone="rose"
            />
            <CurrencyMetric
              label="Compras"
              value={formatCurrencyByCurrency(purchases)}
              note="Ingreso de unidades a stock."
              tone="amber"
            />
            <CurrencyMetric
              label="Comisiones y extras"
              value={formatCurrencyByCurrency(addTotalsCopy(commissionsPaid, otherExpenses))}
              note="Liquidaciones y gastos vehiculares."
              tone="slate"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <CurrencyMetric
            label="Resultado anual acumulado"
            value={formatCurrencyByCurrency(annualOperatingResult)}
            note="Suma de los últimos 12 meses."
            tone="highlight"
          />
          <CurrencyMetric
            label="Margen estimado"
            value={salesMarginDescription}
            note="Margen de ventas con costo relacionable."
            tone="neutral"
          />
        </div>

        <MonthlyPnlChart seriesByCurrency={monthlySeriesByCurrency} />
      </div>
    </section>
  );
}

function subtractCurrencyTotals(left: CurrencyTotals, right: CurrencyTotals) {
  const currencies = new Set([
    ...Object.keys(left.other ?? {}),
    ...Object.keys(right.other ?? {}),
  ]);

  return {
    ARS: left.ARS - right.ARS,
    USD: left.USD - right.USD,
    other: Array.from(currencies).reduce((accumulator, currency) => {
      accumulator[currency] = (left.other?.[currency] ?? 0) - (right.other?.[currency] ?? 0);
      return accumulator;
    }, {} as Record<string, number>),
  };
}

function addTotalsCopy(left: CurrencyTotals, right: CurrencyTotals) {
  const currencies = new Set([
    ...Object.keys(left.other ?? {}),
    ...Object.keys(right.other ?? {}),
  ]);

  return {
    ARS: left.ARS + right.ARS,
    USD: left.USD + right.USD,
    other: Array.from(currencies).reduce((accumulator, currency) => {
      accumulator[currency] = (left.other?.[currency] ?? 0) + (right.other?.[currency] ?? 0);
      return accumulator;
    }, {} as Record<string, number>),
  };
}
