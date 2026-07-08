import Link from "next/link";
import { DashboardChartCard } from "@/components/dashboard/dashboard-chart-card";
import { SimpleBarChart } from "@/components/dashboard/simple-bar-chart";

type LeadStage = {
  key: string;
  label: string;
  value: number;
  tone: "slate" | "amber" | "emerald" | "rose" | "zinc";
};

export function CommercialSummary({
  salesCount,
  activeLeads,
  negotiationLeads,
  wonLeads,
  highInterestConversations,
  attentionConversations,
  nextContactLeads,
  openConversations,
  leadStages,
}: {
  salesCount: number;
  activeLeads: number;
  negotiationLeads: number;
  wonLeads: number;
  highInterestConversations: number;
  attentionConversations: number;
  nextContactLeads: number;
  openConversations: number;
  leadStages: LeadStage[];
}) {
  const funnelItems = leadStages.map((stage) => ({
    label: stage.label,
    value: stage.value,
    tone: stage.tone === "emerald" ? ("emerald" as const) : stage.tone === "amber" ? ("amber" as const) : stage.tone === "rose" ? ("rose" as const) : ("slate" as const),
    helper: stage.key === "ganado" ? "Conversiones cerradas" : stage.key === "negociacion" ? "Oportunidades calientes" : "Pipeline comercial",
  }));

  return (
    <DashboardChartCard
      title="Comercial / CRM"
      description="Embudo comercial, señales de compra y conversaciones vivas."
      action={
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
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="rounded-[30px] bg-[#111827] p-5 text-white shadow-lg shadow-black/10">
            <p className="text-xs uppercase tracking-[0.16em] text-white/55">Embudo comercial</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-4xl font-semibold tracking-tight">{salesCount}</p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                  Ventas registradas durante el mes actual y oportunidades en seguimiento.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/55">Abiertas</p>
                <p className="text-2xl font-semibold">{openConversations}</p>
              </div>
            </div>

            <div className="mt-5">
              <SimpleBarChart
                items={funnelItems}
                compact
                formatValue={(value) => `${value} leads`}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <MiniStat label="Leads activos" value={activeLeads} note={`${negotiationLeads} en negociación`} tone="slate" />
            <MiniStat label="Leads ganados" value={wonLeads} note="Conversiones cerradas" tone="emerald" />
            <MiniStat label="Interés alto" value={highInterestConversations} note="Chats con intención de compra" tone="amber" />
            <MiniStat label="Requieren atención" value={attentionConversations} note={`${nextContactLeads} para contacto hoy`} tone="rose" />
          </div>
        </div>

        <div className="rounded-[28px] border border-[#E5E7EB] bg-[#FAFAFA] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#111827]">Lectura rápida</p>
              <p className="mt-1 text-xs text-[#6B7280]">Panel comercial y conversaciones comerciales activas.</p>
            </div>
            <span className="rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
              Pipeline
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniTile label="Activos" value={activeLeads} note="Base actual" />
            <MiniTile label="En negociación" value={negotiationLeads} note="Oportunidades" />
            <MiniTile label="Con atención" value={attentionConversations} note="Mensajes sensibles" />
          </div>
        </div>
      </div>
    </DashboardChartCard>
  );
}

function MiniStat({
  label,
  value,
  note,
  tone = "slate",
}: {
  label: string;
  value: number;
  note: string;
  tone?: "slate" | "amber" | "emerald" | "rose";
}) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50/80 text-emerald-900"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50/80 text-amber-900"
        : tone === "rose"
          ? "border-rose-200 bg-rose-50/80 text-rose-900"
          : "border-slate-200 bg-slate-50/80 text-slate-900";

  return (
    <div className={["rounded-3xl border px-4 py-4", toneClass].join(" ")}>
      <p className="text-xs uppercase tracking-[0.14em] opacity-70">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs opacity-75">{note}</p>
    </div>
  );
}

function MiniTile({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[#111827]">{value}</p>
      <p className="mt-1 text-xs text-[#6B7280]">{note}</p>
    </div>
  );
}
