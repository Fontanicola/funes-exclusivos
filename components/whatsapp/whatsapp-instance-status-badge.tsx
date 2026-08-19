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
    desconectado: "border-slate-200 bg-slate-50 text-slate-700",
    qr_pendiente: "border-amber-200 bg-amber-50 text-amber-800",
    conectando: "border-blue-200 bg-blue-50 text-blue-800",
    conectado: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-rose-200 bg-rose-50 text-rose-800",
    pausado: "border-amber-200 bg-amber-50 text-amber-800",
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
