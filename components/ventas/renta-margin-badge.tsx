type RentaMarginStatus = "positive" | "negative" | "neutral" | "mixed" | "sin_datos" | string | null;

const statusMap: Record<
  "positive" | "negative" | "neutral" | "mixed" | "sin_datos",
  { label: string; classes: string }
> = {
  positive: {
    label: "Positivo",
    classes: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  negative: {
    label: "Negativo",
    classes: "border-rose-200 bg-rose-50 text-rose-700",
  },
  neutral: {
    label: "Neutro",
    classes: "border-slate-200 bg-slate-50 text-slate-700",
  },
  mixed: {
    label: "Moneda mixta",
    classes: "border-amber-200 bg-amber-50 text-amber-800",
  },
  sin_datos: {
    label: "Sin datos",
    classes: "border-[#E5E7EB] bg-[#FAFAFA] text-[#6B7280]",
  },
};

export function RentaMarginBadge({ status }: { status: RentaMarginStatus }) {
  const normalized = typeof status === "string" ? status.toLowerCase() : status;
  const config =
    normalized === "positive" ||
    normalized === "negative" ||
    normalized === "neutral" ||
    normalized === "mixed" ||
    normalized === "sin_datos"
      ? statusMap[normalized]
      : {
          label: typeof status === "string" && status ? status : "Sin datos",
          classes: "border-[#E5E7EB] bg-[#FAFAFA] text-[#6B7280]",
        };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        config.classes,
      ].join(" ")}
    >
      {config.label}
    </span>
  );
}

