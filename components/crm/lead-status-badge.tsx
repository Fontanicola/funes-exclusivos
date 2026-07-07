type LeadStatus = "nuevo" | "contactado" | "interesado" | "negociacion" | "reservado" | "ganado" | "perdido" | string | null | undefined;

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const normalized = (status ?? "").toLowerCase();

  const labels: Record<string, string> = {
    nuevo: "Nuevo",
    contactado: "Contactado",
    interesado: "Interesado",
    negociacion: "Negociación",
    reservado: "Reservado",
    ganado: "Ganado",
    perdido: "Perdido",
  };

  const styles: Record<string, string> = {
    nuevo: "border-[#E5E7EB] bg-[#FAFAFA] text-[#111827]",
    contactado: "border-[#E5E7EB] bg-[#F9FAFB] text-[#111827]",
    interesado: "border-[#E5E7EB] bg-[#F9FAFB] text-[#111827]",
    negociacion: "border-[#E5E7EB] bg-[#F3F4F6] text-[#111827]",
    reservado: "border-[#E5E7EB] bg-[#F9FAFB] text-[#111827]",
    ganado: "border-[#BBF7D0] bg-[#ECFDF5] text-[#166534]",
    perdido: "border-[#F3F4F6] bg-[#FAFAFA] text-[#6B7280]",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        styles[normalized] ?? styles.nuevo,
      ].join(" ")}
    >
      {labels[normalized] ?? "Nuevo"}
    </span>
  );
}
