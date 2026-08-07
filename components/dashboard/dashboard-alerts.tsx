import Link from "next/link";
import { AlertTriangle, CircleAlert, MessageSquareWarning, ShieldCheck } from "lucide-react";
import { DashboardChartCard } from "@/components/dashboard/dashboard-chart-card";
import type { DashboardAlert } from "@/lib/dashboard-metrics";

function severityStyles(severity?: DashboardAlert["severity"]) {
  switch (severity) {
    case "critical":
      return {
        shell: "border-rose-200 bg-rose-50/80 text-rose-950",
        iconShell: "bg-rose-100 text-rose-700",
        icon: CircleAlert,
        label: "Crítica",
      };
    case "warning":
      return {
        shell: "border-amber-200 bg-amber-50/80 text-amber-950",
        iconShell: "bg-amber-100 text-amber-700",
        icon: AlertTriangle,
        label: "Advertencia",
      };
    case "info":
    default:
      return {
        shell: "border-slate-200 bg-slate-50/80 text-slate-950",
        iconShell: "bg-slate-100 text-slate-700",
        icon: MessageSquareWarning,
        label: "Info",
      };
  }
}

export function DashboardAlerts({ alerts }: { alerts: DashboardAlert[] }) {
  const sortedAlerts = [...alerts].sort((left, right) => {
    const severityRank = (severity?: DashboardAlert["severity"]) => {
      if (severity === "critical") return 0;
      if (severity === "warning") return 1;
      return 2;
    };

    const rankDiff = severityRank(left.severity) - severityRank(right.severity);
    if (rankDiff) return rankDiff;
    return left.title.localeCompare(right.title);
  });

  return (
    <DashboardChartCard
      title="Atención requerida"
      description="Lo primero que conviene revisar hoy."
      action={
        <div className="flex items-center gap-3 text-sm text-[#6B7280]">
          {sortedAlerts.length ? <span>{sortedAlerts.length} alertas</span> : null}
          <Link href="/recordatorios" className="underline-offset-4 hover:text-[#111827] hover:underline">
            Ver recordatorios
          </Link>
        </div>
      }
    >
      {sortedAlerts.length ? (
        <div className="space-y-3">
          {sortedAlerts.slice(0, 4).map((alert) => {
            const styles = severityStyles(alert.severity);
            const Icon = styles.icon;

            return (
              <article
                key={`${alert.title}-${alert.href}`}
                className={["rounded-md border p-4", styles.shell].join(" ")}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className={["mt-0.5 flex h-11 w-11 items-center justify-center rounded-md", styles.iconShell].join(" ")}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{alert.title}</p>
                        <span className="rounded-full border border-black/5 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                          {styles.label}
                        </span>
                        {alert.source ? (
                          <span className="rounded-full border border-black/5 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                            {alert.source}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm leading-6 text-[#6B7280]">{alert.description}</p>
                    </div>
                  </div>

                  <Link
                    href={alert.href}
                    className="inline-flex items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition hover:border-[#D8A1B2] hover:text-[#8A1538]"
                  >
                    Abrir
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-5 py-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white text-[#111827]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#111827]">Sin alertas críticas</p>
              <p className="max-w-2xl text-sm leading-6 text-[#6B7280]">
                No hay vencimientos, chats urgentes ni bloqueos operativos para revisar ahora.
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardChartCard>
  );
}
