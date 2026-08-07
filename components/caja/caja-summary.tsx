import { CajaKpiCard } from "./caja-kpi-card";

type CurrencyTotal = {
  currency: string;
  total: number;
};

type MediumSummary = {
  medium: string;
  count: number;
  ingresos: number;
  egresos: number;
};

function formatMoney(value: number, currency: string | null) {
  const normalizedCurrency = (currency ?? "").toUpperCase() === "USD" ? "USD" : "ARS";
  const symbol = normalizedCurrency === "USD" ? "US$" : "$";
  const formatted = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(Math.abs(value));

  return `${symbol} ${formatted}`;
}

function summarize(groups: CurrencyTotal[]) {
  if (!groups.length) return "Sin movimientos cargados este mes";
  if (groups.length === 1) {
    const [group] = groups;
    return formatMoney(group.total, group.currency);
  }

  return "Mixto";
}

function breakdown(groups: CurrencyTotal[]) {
  if (!groups.length) return "Cargá el primer ingreso o egreso para empezar a ver el resumen de caja.";
  return groups.map((group) => formatMoney(group.total, group.currency)).join(" · ");
}

export function CajaSummary({
  ingresos,
  egresos,
  saldo,
  movimientosCount,
  medios,
}: {
  ingresos: CurrencyTotal[];
  egresos: CurrencyTotal[];
  saldo: CurrencyTotal[];
  movimientosCount: number;
  medios: MediumSummary[];
}) {
  const saldoTone =
    saldo.length === 1
      ? saldo[0].total > 0
        ? "positive"
        : saldo[0].total < 0
          ? "negative"
          : "neutral"
      : "default";

  return (
    <section className="space-y-4 rounded-md border border-[#E5E7EB] bg-white p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">Resumen del mes</h2>
          <p className="mt-1 text-sm text-[#6B7280]">Ingresos, egresos, resultado y actividad operativa.</p>
        </div>
        <span className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
          Caja
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <CajaKpiCard title="Ingresos del mes" value={summarize(ingresos)} description={breakdown(ingresos)} tone="positive" />
        <CajaKpiCard
          title="Egresos del mes"
          value={summarize(egresos)}
          description={breakdown(egresos)}
          tone="negative"
        />
        <CajaKpiCard title="Resultado neto" value={summarize(saldo)} description={breakdown(saldo)} tone={saldoTone} />
        <CajaKpiCard title="Movimientos" value={String(movimientosCount)} description={movimientosCount ? "Cargados este mes" : "Sin movimientos cargados este mes"} tone="neutral" />
      </div>

      <div className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-[#111827]">Caja por medio</p>
            <p className="mt-1 text-xs text-[#6B7280]">Distribución operativa del mes.</p>
          </div>
          <span className="text-xs text-[#6B7280]">{medios.length ? `${medios.length} medios` : "Sin movimientos por medio todavía"}</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {medios.length ? (
            medios.map((medio) => {
              const total = medio.ingresos + medio.egresos;
              const max = Math.max(...medios.map((item) => item.ingresos + item.egresos), 1);
              const width = Math.max(8, (total / max) * 100);

              return (
                <div key={medio.medium} className="rounded-md border border-[#E5E7EB] bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#111827]">{medio.medium}</p>
                      <p className="text-xs text-[#6B7280]">{medio.count} movimientos</p>
                    </div>
                    <p className="text-xs font-medium text-[#6B7280]">Actividad</p>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-[#F3F4F6]">
                    <div className="h-2 rounded-full bg-[#8A1538]" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-md border border-dashed border-[#E5E7EB] bg-white px-4 py-6 text-sm text-[#6B7280] md:col-span-2 xl:col-span-3">
              Cargá el primer ingreso o egreso para empezar a ver el resumen de caja.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
