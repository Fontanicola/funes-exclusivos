import { formatCurrencyByCurrency, type RentaKpis as RentaKpisData } from "@/lib/renta-metrics";

function toShareSegments(values: RentaKpisData["resultadoOperativo"]) {
  const total = values.reduce((sum, entry) => sum + entry.total, 0);
  if (!total) return [];

  return values.map((entry) => ({
    currency: entry.currency,
    width: Math.max(6, (entry.total / total) * 100),
  }));
}

function CurrencyBar({ values }: { values: RentaKpisData["resultadoOperativo"] }) {
  const segments = toShareSegments(values);
  if (!segments.length) {
    return <div className="h-2 rounded-full bg-[#F3F4F6]" />;
  }

  return (
    <div className="flex h-2 overflow-hidden rounded-full bg-[#F3F4F6]">
      {segments.map((segment) => (
        <div
          key={segment.currency}
          className={
            segment.currency === "USD"
              ? "bg-emerald-500"
              : segment.currency === "ARS"
                ? "bg-slate-500"
                : "bg-amber-400"
          }
          style={{ width: `${segment.width}%` }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function BigMetric({
  title,
  value,
  description,
  values,
}: {
  title: string;
  value: string;
  description: string;
  values: RentaKpisData["resultadoOperativo"];
}) {
  return (
    <article className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#6B7280]">{title}</p>
          <p className="text-3xl font-semibold tracking-tight text-[#111827]">{value}</p>
          <p className="max-w-xl text-sm leading-6 text-[#6B7280]">{description}</p>
        </div>
        <div className="min-w-36 flex-1 max-w-48 rounded-2xl border border-[#F3F4F6] bg-[#FAFAFA] p-3">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#9CA3AF]">
            Distribución
          </p>
          <CurrencyBar values={values} />
          <p className="mt-2 text-xs text-[#6B7280]">{formatCurrencyByCurrency(values)}</p>
        </div>
      </div>
    </article>
  );
}

function SmallMetric({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4 shadow-sm">
      <p className="text-sm font-medium text-[#6B7280]">{title}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">{value}</p>
      <p className="mt-2 text-xs leading-5 text-[#6B7280]">{description}</p>
    </article>
  );
}

export function RentaKpis({ metrics }: { metrics: RentaKpisData }) {
  const operationsLabel = new Intl.NumberFormat("es-AR").format(metrics.operacionesRegistradas);
  const incompleteLabel = new Intl.NumberFormat("es-AR").format(metrics.operacionesIncompletas);
  const rotationLabel =
    metrics.rotacionPromedio != null ? `${metrics.rotacionPromedio} días` : "—";

  return (
    <section className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <BigMetric
          title="Resultado operativo estimado"
          value={formatCurrencyByCurrency(metrics.resultadoOperativo)}
          description="Suma consolidada de las operaciones comparables, sin conversión entre monedas."
          values={metrics.resultadoOperativo}
        />
        <BigMetric
          title="Margen promedio"
          value={formatCurrencyByCurrency(metrics.margenPromedio)}
          description="Promedio por operación comparable, útil para leer el negocio con foco en rentabilidad."
          values={metrics.margenPromedio}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SmallMetric
          title="Operaciones registradas"
          value={operationsLabel}
          description="Operaciones activas contempladas en el tablero de renta."
        />
        <SmallMetric
          title="Rotación promedio"
          value={rotationLabel}
          description="Días promedio entre compra y venta, o el valor informado por la operación."
        />
        <SmallMetric
          title="Operaciones con datos incompletos"
          value={incompleteLabel}
          description="Casos con moneda mixta, faltantes o sin cálculo confiable."
        />
      </div>
    </section>
  );
}

