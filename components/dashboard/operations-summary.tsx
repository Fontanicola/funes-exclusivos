import Link from "next/link";

function StatusLine({
  label,
  value,
  total,
  tone,
  note,
}: {
  label: string;
  value: number;
  total: number;
  tone: "emerald" | "amber" | "rose" | "slate";
  note: string;
}) {
  const width = total > 0 ? Math.max(8, (value / total) * 100) : 0;
  const toneClass =
    tone === "emerald"
      ? "bg-emerald-500"
      : tone === "amber"
        ? "bg-amber-500"
        : tone === "rose"
          ? "bg-rose-500"
          : "bg-slate-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-[#6B7280]">{label}</span>
        <span className="font-medium text-[#111827]">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-white">
        <div className={`h-2 rounded-full ${toneClass}`} style={{ width: `${width}%` }} />
      </div>
      <p className="text-xs text-[#6B7280]">{note}</p>
    </div>
  );
}

export function OperationsSummary({
  pendingTramites,
  overdueTramites,
  commissionsPending,
  whatsappConnected,
  whatsappDisconnected,
}: {
  pendingTramites: number;
  overdueTramites: number;
  commissionsPending: number;
  whatsappConnected: number;
  whatsappDisconnected: number;
}) {
  const whatsappTotal = Math.max(whatsappConnected + whatsappDisconnected, 1);
  const operationsTotal = Math.max(pendingTramites + overdueTramites + commissionsPending, 1);

  return (
    <section className="rounded-[32px] border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] p-5">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">Operaciones</h2>
          <p className="mt-1 text-sm text-[#6B7280]">Gestoría, comisiones y estado de comunicación.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/gestoria" className="text-[#6B7280] underline-offset-4 hover:text-[#111827] hover:underline">
            Gestoría
          </Link>
          <Link href="/comisiones" className="text-[#6B7280] underline-offset-4 hover:text-[#111827] hover:underline">
            Comisiones
          </Link>
          <Link href="/whatsapp/conexiones" className="text-[#6B7280] underline-offset-4 hover:text-[#111827] hover:underline">
            WhatsApp
          </Link>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <div className="space-y-4">
          <div className="rounded-[30px] bg-[#111827] p-5 text-white shadow-lg shadow-black/10">
            <p className="text-xs uppercase tracking-[0.16em] text-white/55">Estado operativo</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-4xl font-semibold tracking-tight">{pendingTramites + overdueTramites}</p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                  Trámites en curso y vencimientos que requieren atención operativa.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/55">Críticos</p>
                <p className="text-2xl font-semibold">{overdueTramites}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <StatusLine
                label="Trámites pendientes"
                value={pendingTramites}
                total={operationsTotal}
                tone="slate"
                note="Seguimientos activos en gestoría."
              />
              <StatusLine
                label="Trámites vencidos"
                value={overdueTramites}
                total={operationsTotal}
                tone="rose"
                note="Casos que necesitan intervención inmediata."
              />
              <StatusLine
                label="Comisiones pendientes"
                value={commissionsPending}
                total={operationsTotal}
                tone="amber"
                note="Liquidaciones para revisar o aprobar."
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">WhatsApp conectados</p>
              <p className="mt-2 text-3xl font-semibold text-[#111827]">{whatsappConnected}</p>
              <p className="mt-2 text-xs text-[#6B7280]">Instancias disponibles para comunicación.</p>
            </div>
            <div className="rounded-3xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">WhatsApp desconectados</p>
              <p className="mt-2 text-3xl font-semibold text-[#111827]">{whatsappDisconnected}</p>
              <p className="mt-2 text-xs text-[#6B7280]">Conexiones que conviene revisar.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-[#E5E7EB] bg-[#FAFAFA] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#111827]">Comisiones</p>
                <p className="mt-1 text-xs text-[#6B7280]">Pendientes de resolución.</p>
              </div>
              <Link href="/comisiones" className="text-sm font-medium text-[#6B7280] underline-offset-4 hover:text-[#111827] hover:underline">
                Ver
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2">
                <span className="text-sm text-[#6B7280]">Pendientes</span>
                <span className="text-sm font-medium text-[#111827]">{commissionsPending}</span>
              </div>
              <div className="h-2 rounded-full bg-white">
                <div
                  className="h-2 rounded-full bg-amber-500"
                  style={{ width: `${Math.max(8, (commissionsPending / Math.max(operationsTotal, 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#E5E7EB] bg-[#FAFAFA] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#111827]">WhatsApp</p>
                <p className="mt-1 text-xs text-[#6B7280]">Salud de conexiones activas.</p>
              </div>
              <Link href="/whatsapp/conexiones" className="text-sm font-medium text-[#6B7280] underline-offset-4 hover:text-[#111827] hover:underline">
                Gestionar
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              <StatusLine
                label="Conectados"
                value={whatsappConnected}
                total={whatsappTotal}
                tone="emerald"
                note="Instancias listas para operar."
              />
              <StatusLine
                label="Desconectados"
                value={whatsappDisconnected}
                total={whatsappTotal}
                tone="rose"
                note="Conexiones con reconexión pendiente."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
