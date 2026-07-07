import Link from "next/link";
import { AlertTriangle, CircleAlert, MessageSquareWarning, ShieldCheck, Sparkles } from "lucide-react";
import type { DashboardAlert } from "@/lib/dashboard-metrics";

function severityStyles(severity?: DashboardAlert["severity"]) {
  switch (severity) {
    case "critical":
      return {
        shell: "border-rose-200 bg-rose-50/70 text-rose-950",
        iconShell: "bg-rose-100 text-rose-700",
        icon: CircleAlert,
      };
    case "warning":
      return {
        shell: "border-amber-200 bg-amber-50/70 text-amber-950",
        iconShell: "bg-amber-100 text-amber-700",
        icon: AlertTriangle,
      };
    case "info":
    default:
      return {
        shell: "border-slate-200 bg-slate-50/80 text-slate-950",
        iconShell: "bg-slate-100 text-slate-700",
        icon: MessageSquareWarning,
      };
  }
}

export function DashboardAlerts({ alerts }: { alerts: DashboardAlert[] }) {
  return (
    <section className="rounded-[32px] border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex items-end justify-between gap-4 border-b border-[#E5E7EB] p-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#111827]">Alertas</h2>
            <span className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
              {alerts.length}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#6B7280]">Señales accionables prioritarias.</p>
        </div>
        <p className="text-sm text-[#6B7280]">Máximo 5 alertas críticas o preventivas.</p>
      </div>

      <div className="p-5">
        {alerts.length ? (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const styles = severityStyles(alert.severity);
              const Icon = styles.icon;

              return (
                <article
                  key={`${alert.title}-${alert.href}`}
                  className={`rounded-[24px] border p-4 shadow-sm ${styles.shell}`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl ${styles.iconShell}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold">{alert.title}</p>
                          <span className="rounded-full border border-black/5 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                            {alert.severity === "critical" ? "Crítica" : alert.severity === "warning" ? "Advertencia" : "Info"}
                          </span>
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
                <p className="text-sm font-semibold text-[#111827]">Sin alertas críticas por ahora</p>
                <p className="max-w-2xl text-sm leading-6 text-[#6B7280]">
                  Todo está dentro de rangos operativos aceptables. Cuando aparezcan señales comerciales o operativas, se listarán acá.
                </p>
              </div>
            </div>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-medium text-[#6B7280]">
              <Sparkles className="h-3.5 w-3.5" />
              Monitoreo activo
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
