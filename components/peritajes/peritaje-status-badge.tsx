import { PERITAJE_STATUS_LABELS, type PeritajeItemStatus, type PeritajeStatus } from "@/lib/peritajes/types";

const styles: Record<string, string> = {
  pendiente: "border-slate-200 bg-slate-50 text-slate-600",
  revisar: "border-amber-200 bg-amber-50 text-amber-700",
  reparar: "border-rose-200 bg-rose-50 text-rose-700",
  listo: "border-emerald-200 bg-emerald-50 text-emerald-700",
  no_aplica: "border-slate-200 bg-white text-slate-400",
  borrador: "border-slate-200 bg-slate-50 text-slate-600",
  en_proceso: "border-blue-200 bg-blue-50 text-blue-700",
  completado: "border-emerald-200 bg-emerald-50 text-emerald-700",
  anulado: "border-rose-200 bg-rose-50 text-rose-700",
};

export function PeritajeStatusBadge({ status }: { status: PeritajeItemStatus | PeritajeStatus }) {
  const label = status in PERITAJE_STATUS_LABELS
    ? PERITAJE_STATUS_LABELS[status as PeritajeItemStatus]
    : status === "en_proceso" ? "En proceso" : status === "borrador" ? "Borrador" : status === "completado" ? "Completado" : "Anulado";
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status] ?? styles.pendiente}`}>{label}</span>;
}
