import Link from "next/link";

function FunnelStep({
  label,
  value,
  max,
  tone,
  hint,
}: {
  label: string;
  value: number;
  max: number;
  tone: "emerald" | "amber" | "slate";
  hint: string;
}) {
  const width = max > 0 ? Math.max(8, (value / max) * 100) : 0;
  const barClass =
    tone === "emerald" ? "bg-emerald-500" : tone === "amber" ? "bg-amber-500" : "bg-slate-500";
  const chipClass =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-white/85">{label}</p>
          <p className="text-xs text-white/55">{hint}</p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${chipClass}`}>{value}</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-white/10">
        <div className={`h-2 rounded-full ${barClass}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function SignalTile({
  title,
  value,
  tone,
  note,
}: {
  title: string;
  value: number;
  tone: "emerald" | "amber" | "rose";
  note: string;
}) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50/80 text-emerald-900"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50/80 text-amber-900"
        : "border-rose-200 bg-rose-50/80 text-rose-900";

  return (
    <div className={`rounded-3xl border p-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-[0.14em] opacity-70">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm opacity-80">{note}</p>
    </div>
  );
}

function PipelineDial({
  active,
  negotiation,
  won,
}: {
  active: number;
  negotiation: number;
  won: number;
}) {
  const hasData = active + negotiation + won > 0;
  const total = Math.max(active + negotiation + won, 1);
  const activePct = hasData ? (active / total) * 100 : 0;
  const negotiationPct = hasData ? (negotiation / total) * 100 : 0;

  return (
    <div className="flex items-center gap-5 rounded-[28px] border border-[#E5E7EB] bg-[#FAFAFA] p-4">
      <div
        className="flex h-28 w-28 items-center justify-center rounded-full"
        style={{
          background: hasData
            ? `conic-gradient(#111827 0 ${activePct}%, #f59e0b ${activePct}% ${activePct + negotiationPct}%, #10b981 ${activePct + negotiationPct}% 100%)`
            : "conic-gradient(#e5e7eb 0 100%)",
        }}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-center shadow-sm">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#6B7280]">Pipeline</p>
            <p className="text-xl font-semibold text-[#111827]">{total}</p>
          </div>
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-[#111827]">Distribución comercial</p>
          <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">Activos / negociación / ganados</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6B7280]">Leads activos</span>
            <span className="font-medium text-[#111827]">{active}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6B7280]">En negociación</span>
            <span className="font-medium text-[#111827]">{negotiation}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6B7280]">Ganados</span>
            <span className="font-medium text-[#111827]">{won}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommercialSummary({
  salesCount,
  activeLeads,
  negotiationLeads,
  wonLeads,
  highInterestConversations,
  attentionConversations,
  nextContactLeads,
}: {
  salesCount: number;
  activeLeads: number;
  negotiationLeads: number;
  wonLeads: number;
  highInterestConversations: number;
  attentionConversations: number;
  nextContactLeads: number;
}) {
  const maxStage = Math.max(activeLeads, negotiationLeads, wonLeads, 1);
  const interestBase = Math.max(highInterestConversations, attentionConversations, nextContactLeads, 1);
  const funnelRatio = Math.max(activeLeads + negotiationLeads + wonLeads, 1);

  return (
    <section className="rounded-[32px] border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#E5E7EB] p-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">Comercial</h2>
          <p className="mt-1 text-sm text-[#6B7280]">Pipeline, actividad comercial y temperatura de conversaciones.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/ventas" className="text-[#6B7280] underline-offset-4 hover:text-[#111827] hover:underline">
            Ventas
          </Link>
          <Link href="/crm" className="text-[#6B7280] underline-offset-4 hover:text-[#111827] hover:underline">
            CRM
          </Link>
          <Link href="/whatsapp" className="text-[#6B7280] underline-offset-4 hover:text-[#111827] hover:underline">
            WhatsApp
          </Link>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="space-y-5">
          <div className="rounded-[30px] bg-[#111827] p-5 text-white shadow-lg shadow-black/10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-white/55">Embudo comercial</p>
                <p className="mt-2 text-4xl font-semibold tracking-tight">{salesCount}</p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                  Ventas registradas durante el mes actual y oportunidades en seguimiento.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/55">Intensidad</p>
                <p className="text-2xl font-semibold">{funnelRatio}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <FunnelStep
                label="Leads activos"
                value={activeLeads}
                max={maxStage}
                tone="slate"
                hint="Base del pipeline comercial."
              />
              <FunnelStep
                label="En negociación"
                value={negotiationLeads}
                max={maxStage}
                tone="amber"
                hint="Oportunidades calientes."
              />
              <FunnelStep
                label="Leads ganados"
                value={wonLeads}
                max={maxStage}
                tone="emerald"
                hint="Conversión cerrada."
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <SignalTile
              title="Interés alto"
              value={highInterestConversations}
              tone="emerald"
              note="Conversaciones con mayor intención de compra."
            />
            <SignalTile
              title="Atención"
              value={attentionConversations}
              tone="rose"
              note="Seguimiento sensible o conversación pendiente."
            />
            <SignalTile
              title="Próximos contactos"
              value={nextContactLeads}
              tone="amber"
              note="Leads a tocar hoy o ya vencidos."
            />
          </div>
        </div>

        <div className="space-y-4">
          <PipelineDial active={activeLeads} negotiation={negotiationLeads} won={wonLeads} />

          <div className="rounded-[28px] border border-[#E5E7EB] bg-[#FAFAFA] p-4">
            <p className="text-sm font-semibold text-[#111827]">Señales comerciales</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">Seguimiento</p>
                <p className="mt-1 text-sm text-[#111827]">
                  Hay <span className="font-semibold">{attentionConversations}</span> conversaciones que requieren atención.
                </p>
              </div>
              <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">Contacto</p>
                <p className="mt-1 text-sm text-[#111827]">
                  Hay <span className="font-semibold">{nextContactLeads}</span> leads con próximo contacto para hoy o vencido.
                </p>
              </div>
              <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">Conversión</p>
                <p className="mt-1 text-sm text-[#111827]">
                  <span className="font-semibold">{wonLeads}</span> leads convertidos y <span className="font-semibold">{highInterestConversations}</span> con interés alto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
