type ComisionStatus = "pendiente" | "aprobada" | "pagada" | "anulada" | string | null | undefined;

export function ComisionStatusBadge({ status }: { status: ComisionStatus }) {
  const normalized = (status ?? "").toLowerCase();

  const styles: Record<string, string> = {
    pendiente: "border-[#E5E7EB] bg-[#FAFAFA] text-[#111827]",
    aprobada: "border-[#E5E7EB] bg-[#F9FAFB] text-[#111827]",
    pagada: "border-[#D1FAE5] bg-[#F0FDF4] text-[#166534]",
    anulada: "border-[#F3F4F6] bg-[#F9FAFB] text-[#6B7280]",
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
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        styles[normalized] ?? styles.pendiente,
      ].join(" ")}
    >
      {labels[normalized] ?? "Pendiente"}
    </span>
  );
}
