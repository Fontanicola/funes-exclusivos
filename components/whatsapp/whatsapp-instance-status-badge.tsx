type WhatsappInstanceStatus =
  | "desconectado"
  | "qr_pendiente"
  | "conectando"
  | "conectado"
  | "error"
  | "pausado"
  | string
  | null
  | undefined;

export function WhatsappInstanceStatusBadge({ status }: { status: WhatsappInstanceStatus }) {
  const normalized = (status ?? "").toLowerCase();

  const labels: Record<string, string> = {
    desconectado: "Desconectado",
    qr_pendiente: "QR pendiente",
    conectando: "Conectando",
    conectado: "Conectado",
    error: "Error",
    pausado: "Pausado",
  };

  const styles: Record<string, string> = {
    desconectado: "border-[#E5E7EB] bg-[#FAFAFA] text-[#6B7280]",
    qr_pendiente: "border-[#E5E7EB] bg-[#F9FAFB] text-[#111827]",
    conectando: "border-[#E5E7EB] bg-[#F3F4F6] text-[#111827]",
    conectado: "border-[#E5E7EB] bg-[#F0FDF4] text-[#166534]",
    error: "border-[#E5E7EB] bg-[#FAFAFA] text-[#111827]",
    pausado: "border-[#E5E7EB] bg-[#FAFAFA] text-[#6B7280]",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        styles[normalized] ?? styles.desconectado,
      ].join(" ")}
    >
      {labels[normalized] ?? "Desconectado"}
    </span>
  );
}
