import Link from "next/link";
import { AlertTriangle, CircleAlert, MessageSquareWarning, ShieldCheck, Sparkles } from "lucide-react";
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
      title="Alertas accionables"
      description="Señales operativas y comerciales que necesitan seguimiento."
      action={
        <div className="flex items-center gap-3 text-sm text-[#6B7280]">
          <span>{sortedAlerts.length} alertas</span>
          <Link href="/recordatorios" className="underline-offset-4 hover:text-[#111827] hover:underline">
            Ver recordatorios
          </Link>
        </div>
      }
    >
      {sortedAlerts.length ? (
        <div className="space-y-3">
          {sortedAlerts.map((alert) => {
            const styles = severityStyles(alert.severity);
            const Icon = styles.icon;

            return (
              <article
                key={`${alert.title}-${alert.href}`}
                className={["rounded-[24px] border p-4 shadow-sm", styles.shell].join(" ")}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className={["mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl", styles.iconShell].join(" ")}>
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
                    className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    Abrir
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-5 py-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#111827] shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#111827]">Sin alertas críticas</p>
              <p className="max-w-2xl text-sm leading-6 text-[#6B7280]">
                Todo está dentro de rangos operativos aceptables. Las señales comerciales y operativas aparecerán acá cuando sea necesario.
              </p>
            </div>
          </div>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-medium text-[#6B7280]">
            <Sparkles className="h-3.5 w-3.5" />
            Monitoreo activo
          </div>
        </div>
      )}
    </DashboardChartCard>
  );
}
