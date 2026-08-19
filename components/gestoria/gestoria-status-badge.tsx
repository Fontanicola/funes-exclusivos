type GestoriaStatus = "pendiente" | "en_proceso" | "observado" | "completado" | "cancelado" | string | null | undefined;

export function GestoriaStatusBadge({ status }: { status: GestoriaStatus }) {
  const normalized = (status ?? "").toLowerCase();

  const labels: Record<string, string> = {
    pendiente: "Pendiente",
    en_proceso: "En proceso",
    observado: "Observado",
    completado: "Completado",
    cancelado: "Cancelado",
  };

  const styles: Record<string, string> = {
    pendiente: "border-amber-200 bg-amber-50 text-amber-800",
    en_proceso: "border-blue-200 bg-blue-50 text-blue-800",
    observado: "border-rose-200 bg-rose-50 text-rose-800",
    completado: "border-emerald-200 bg-emerald-50 text-emerald-800",
    cancelado: "border-rose-200 bg-rose-50 text-rose-800",
  };

  return (
    <span className={[
      "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium",
      styles[normalized] ?? styles.pendiente,
    ].join(" ")}>
      {labels[normalized] ?? "Pendiente"}
    </span>
  );
}
