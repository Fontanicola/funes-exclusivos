import Link from "next/link";
import { DashboardChartCard } from "@/components/dashboard/dashboard-chart-card";
import { SimpleBarChart } from "@/components/dashboard/simple-bar-chart";

export function OperationsSummary({
  pendingTramites,
  overdueTramites,
  pendingBudgets,
  pendingLiquidations,
  commissionsPending,
  whatsappConnected,
  whatsappDisconnected,
  deliveryPending,
  deliveryDelivered,
  deliveryObserved,
}: {
  pendingTramites: number;
  overdueTramites: number;
  pendingBudgets: number;
  pendingLiquidations: number;
  commissionsPending: number;
  whatsappConnected: number;
  whatsappDisconnected: number;
  deliveryPending: number;
  deliveryDelivered: number;
  deliveryObserved: number;
}) {
  return (
    <DashboardChartCard
      title="Operaciones"
      description="Gestoría, entregas, comisiones y salud operativa."
      action={
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/gestoria" className="text-[#8A1538] underline decoration-[#D8A1B2] underline-offset-4 hover:text-[#6F102D]">
            Gestoría
          </Link>
          <Link href="/ventas/pendientes-entrega" className="text-[#8A1538] underline decoration-[#D8A1B2] underline-offset-4 hover:text-[#6F102D]">
            Entregas
          </Link>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MiniStat label="Trámites pendientes" value={pendingTramites} note={`${overdueTramites} vencidos`} tone="slate" />
          <MiniStat label="Liquidaciones" value={pendingLiquidations} note="Pendientes de pago" tone="amber" />
          <MiniStat label="Entregas" value={deliveryPending} note={`${deliveryObserved} observadas`} tone="rose" />
          <MiniStat label="WhatsApp" value={whatsappConnected} note={`${whatsappDisconnected} desconectados`} tone="emerald" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <MiniTile label="Presupuestos" value={pendingBudgets} note="Pendientes de gestoría" />
          <MiniTile label="Entregadas" value={deliveryDelivered} note="Operaciones cerradas" />
          <MiniTile label="Comisiones" value={commissionsPending} note="Por revisar" />
          <MiniTile label="Vencidos" value={overdueTramites} note="Seguimiento inmediato" />
        </div>

        <div className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-4">
          <p className="text-sm font-semibold text-[#111827]">Carga operativa</p>
          <p className="mt-1 text-xs text-[#6B7280]">Señales clave de backoffice y seguimiento.</p>
          <div className="mt-4">
            <SimpleBarChart
              items={[
                { label: "Trámites", value: pendingTramites, tone: "slate" },
                { label: "Vencidos", value: overdueTramites, tone: "rose" },
                { label: "Entregas", value: deliveryPending, tone: "amber" },
                { label: "Liquidaciones", value: pendingLiquidations, tone: "slate" },
                { label: "Comisiones", value: commissionsPending, tone: "amber" },
              ]}
              compact
            />
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
  tone?: "slate" | "amber" | "rose" | "emerald";
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

function MiniTile({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="rounded-md border border-[#E5E7EB] bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[#111827]">{value}</p>
      <p className="mt-1 text-xs text-[#6B7280]">{note}</p>
    </div>
  );
}
