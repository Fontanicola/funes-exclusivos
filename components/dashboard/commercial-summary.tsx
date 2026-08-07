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
    helper: stage.key === "ganado" ? "Cierres" : stage.key === "negociacion" ? "Oportunidades" : "Pipeline",
  }));

  return (
    <DashboardChartCard
      title="Operación comercial"
      description="Leads, conversaciones y conversiones vivas."
      action={
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/crm" className="text-[#8A1538] underline decoration-[#D8A1B2] underline-offset-4 hover:text-[#6F102D]">
            CRM
          </Link>
          <Link href="/whatsapp" className="text-[#8A1538] underline decoration-[#D8A1B2] underline-offset-4 hover:text-[#6F102D]">
            WhatsApp
          </Link>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MiniStat label="Leads activos" value={activeLeads} note={`${negotiationLeads} en negociación`} tone="slate" />
          <MiniStat label="Conversaciones abiertas" value={openConversations} note="Chats activos" tone="emerald" />
          <MiniStat label="Requieren atención" value={attentionConversations} note={`${nextContactLeads} para hoy`} tone="rose" />
          <MiniStat label="Leads ganados" value={wonLeads} note={`${salesCount} ventas del mes`} tone="amber" />
        </div>

        {leadStages.length ? (
          <div className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#111827]">Pipeline</p>
                <p className="mt-1 text-xs text-[#6B7280]">Distribución del embudo comercial.</p>
              </div>
              <span className="rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                CRM
              </span>
            </div>
            <div className="mt-4">
              <SimpleBarChart items={funnelItems} compact formatValue={(value) => `${value} leads`} />
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-5 py-8 text-sm text-[#6B7280]">
            Sin pipeline cargado todavía. <Link href="/crm" className="font-medium text-[#8A1538] underline decoration-[#D8A1B2] underline-offset-4 hover:text-[#6F102D]">Abrir CRM</Link>
          </div>
        )}
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
    <div className={["rounded-md border px-4 py-4", toneClass].join(" ")}>
      <p className="text-xs uppercase tracking-[0.14em] opacity-70">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs opacity-75">{note}</p>
    </div>
  );
}
