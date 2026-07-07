type ConversacionStatus =
  | "abierta"
  | "en_seguimiento"
  | "cerrada"
  | "archivada"
  | string
  | null
  | undefined;

export function ConversacionStatusBadge({ status }: { status: ConversacionStatus }) {
  const normalized = (status ?? "").toLowerCase();

  const labels: Record<string, string> = {
    abierta: "Abierta",
    en_seguimiento: "En seguimiento",
    cerrada: "Cerrada",
    archivada: "Archivada",
  };

  const styles: Record<string, string> = {
    abierta: "border-[#E5E7EB] bg-[#F9FAFB] text-[#111827]",
    en_seguimiento: "border-[#E5E7EB] bg-[#F3F4F6] text-[#111827]",
    cerrada: "border-[#E5E7EB] bg-[#FAFAFA] text-[#6B7280]",
    archivada: "border-[#E5E7EB] bg-[#FAFAFA] text-[#6B7280]",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        styles[normalized] ?? styles.abierta,
      ].join(" ")}
    >
      {labels[normalized] ?? "Abierta"}
    </span>
  );
}
