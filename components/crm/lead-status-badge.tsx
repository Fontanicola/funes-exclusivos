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
    nuevo: "border-sky-200 bg-sky-50 text-sky-800",
    contactado: "border-blue-200 bg-blue-50 text-blue-800",
    interesado: "border-amber-200 bg-amber-50 text-amber-800",
    negociacion: "border-orange-200 bg-orange-50 text-orange-800",
    reservado: "border-violet-200 bg-violet-50 text-violet-800",
    ganado: "border-emerald-200 bg-emerald-50 text-emerald-800",
    perdido: "border-rose-200 bg-rose-50 text-rose-800",
  };

  return (
    <span
      className={[
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium",
        styles[normalized] ?? styles.nuevo,
      ].join(" ")}
    >
      {labels[normalized] ?? "Nuevo"}
    </span>
  );
}
