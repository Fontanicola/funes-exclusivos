type ComisionStatus = "pendiente" | "aprobada" | "pagada" | "anulada" | string | null | undefined;

export function ComisionStatusBadge({ status }: { status: ComisionStatus }) {
  const normalized = (status ?? "").toLowerCase();

  const styles: Record<string, string> = {
    pendiente: "border-amber-200 bg-amber-50 text-amber-800",
    aprobada: "border-blue-200 bg-blue-50 text-blue-800",
    pagada: "border-emerald-200 bg-emerald-50 text-emerald-800",
    anulada: "border-rose-200 bg-rose-50 text-rose-800",
  };

  const labels: Record<string, string> = {
    pendiente: "Pendiente",
    aprobada: "Aprobada",
    pagada: "Pagada",
    anulada: "Anulada",
  };

  return (
    <span
      className={[
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium",
        styles[normalized] ?? styles.pendiente,
      ].join(" ")}
    >
      {labels[normalized] ?? "Pendiente"}
    </span>
  );
}
