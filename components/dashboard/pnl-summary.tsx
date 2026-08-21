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
  salesMarginDescription: string;
  monthlySeriesByCurrency: Record<string, Array<any>>;
  canViewFinancials?: boolean;
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
              ? "border-[#8A1538] bg-[#8A1538] text-white"
            : "border-[#E5E7EB] bg-[#FAFAFA] text-[#111827]";

  return (
    <div className={["rounded-md border p-4", toneClass].join(" ")}>
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
  operatingResult,
  annualOperatingResult,
  salesMarginDescription,
  monthlySeriesByCurrency,
  canViewFinancials = true,
}: PnlSummaryProps) {
  return (
    <section className="rounded-md border border-[#E5E7EB] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">Resultado del período</h2>
          <p className="mt-1 text-xs text-[#6B7280]">Ingresos, egresos y resultado sin mezclar monedas.</p>
        </div>
        <p className="max-w-md text-right text-xs text-[#6B7280]">{salesMarginDescription}</p>
      </div>

      <div className="space-y-4 p-5">
        {canViewFinancials ? (
          <>
            <div className="space-y-4">
              <div className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">Resultado operativo</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-[#111827]">
                      {formatCurrencyByCurrency(operatingResult)}
                    </p>
                  </div>
                  <div className="text-left lg:text-right">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">Acumulado anual</p>
                    <p className="mt-1 text-lg font-semibold text-[#111827]">
                      {formatCurrencyByCurrency(annualOperatingResult)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <CurrencyMetric
                  label="Ingresos de caja"
                  value={formatCurrencyByCurrency(cashIncome)}
                  tone="emerald"
                />
                <CurrencyMetric
                  label="Egresos del mes"
                  value={formatCurrencyByCurrency(cashExpense)}
                  tone="rose"
                />
                <CurrencyMetric
                  label="Ventas devengadas"
                  value={formatCurrencyByCurrency(sales)}
                  tone="slate"
                />
              </div>
            </div>

            <div className="border-t border-[#E5E7EB] pt-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Tendencia</p>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">12 meses</span>
              </div>
              <MonthlyPnlChart seriesByCurrency={monthlySeriesByCurrency} compact />
            </div>
          </>
        ) : (
          <div className="rounded-md border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-5 py-8 text-sm text-[#6B7280]">
            La lectura de rentabilidad queda reservada para administración.
          </div>
        )}
      </div>
    </section>
  );
}
