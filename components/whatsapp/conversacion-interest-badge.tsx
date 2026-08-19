type ConversacionInterest =
  | "alto"
  | "medio"
  | "bajo"
  | "sin_interes"
  | "no_detectado"
  | string
  | null
  | undefined;

export function ConversacionInterestBadge({ interest }: { interest: ConversacionInterest }) {
  const normalized = (interest ?? "").toLowerCase();

  const labels: Record<string, string> = {
    alto: "Alto",
    medio: "Medio",
    bajo: "Bajo",
    sin_interes: "Sin interés",
    no_detectado: "No detectado",
  };

  const styles: Record<string, string> = {
    alto: "border-emerald-200 bg-emerald-50 text-emerald-800",
    medio: "border-amber-200 bg-amber-50 text-amber-800",
    bajo: "border-slate-200 bg-slate-50 text-slate-700",
    sin_interes: "border-rose-200 bg-rose-50 text-rose-800",
    no_detectado: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <span
      className={[
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium",
        styles[normalized] ?? styles.no_detectado,
      ].join(" ")}
    >
      {labels[normalized] ?? "No detectado"}
    </span>
  );
}
