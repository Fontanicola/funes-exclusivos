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
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E7EB] p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-[#111827]">Resultado del mes</h2>
          </div>
          <p className="mt-1 text-sm text-[#6B7280]">
            Caja, egresos y resultado operativo con monedas separadas.
          </p>
        </div>
        <p className="max-w-xl text-sm text-[#6B7280]">{salesMarginDescription}</p>
      </div>

      <div className="space-y-5 p-5">
        {canViewFinancials ? (
          <>
            <div className="space-y-4">
              <div className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">Resultado operativo mensual</p>
                    <p className="mt-3 text-4xl font-semibold tracking-tight text-[#111827]">
                      {formatCurrencyByCurrency(operatingResult)}
                    </p>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
                      Resultado estimado con ingresos y egresos cargados, sin convertir monedas.
                    </p>
                  </div>
                  <div className="rounded-md border border-[#E5E7EB] bg-white px-4 py-3">
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
                  note="Cobros efectivamente cargados."
                  tone="emerald"
                />
                <CurrencyMetric
                  label="Egresos del mes"
                  value={formatCurrencyByCurrency(cashExpense)}
                  note="Salidas de caja cargadas."
                  tone="rose"
                />
                <CurrencyMetric
                  label="Ventas devengadas"
                  value={formatCurrencyByCurrency(sales)}
                  note="Operaciones registradas."
                  tone="slate"
                />
              </div>
            </div>

            <div className="border-t border-[#E5E7EB] pt-5">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Tendencia de los últimos 12 meses</p>
                  <p className="mt-1 text-xs text-[#6B7280]">La línea ayuda a ver dirección y ritmo, no solo volumen.</p>
                </div>
                <span className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">Ingresos · egresos · resultado</span>
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
