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
    pendiente: "border-[#E5E7EB] bg-[#FAFAFA] text-[#111827]",
    en_proceso: "border-[#E5E7EB] bg-[#F9FAFB] text-[#111827]",
    observado: "border-[#E5E7EB] bg-[#F3F4F6] text-[#111827]",
    completado: "border-[#D1FAE5] bg-[#F0FDF4] text-[#166534]",
    cancelado: "border-[#F3F4F6] bg-[#FAFAFA] text-[#6B7280]",
  };

  return (
    <span className={[
      "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
      styles[normalized] ?? styles.pendiente,
    ].join(" ")}>
      {labels[normalized] ?? "Pendiente"}
    </span>
  );
}
