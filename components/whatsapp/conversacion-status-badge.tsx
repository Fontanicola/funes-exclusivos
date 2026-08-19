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
    abierta: "border-amber-200 bg-amber-50 text-amber-800",
    en_seguimiento: "border-blue-200 bg-blue-50 text-blue-800",
    cerrada: "border-emerald-200 bg-emerald-50 text-emerald-800",
    archivada: "border-slate-200 bg-slate-50 text-slate-700",
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
