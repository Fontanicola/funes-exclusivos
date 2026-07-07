type PaymentMethod = "transferencia" | "efectivo" | "dolares" | "pesos" | "permuta" | string | null;

const methodMap: Record<
  "transferencia" | "efectivo" | "dolares" | "pesos" | "permuta",
  { label: string; classes: string }
> = {
  transferencia: {
    label: "Transferencia",
    classes: "border-[#E5E7EB] bg-[#FAFAFA] text-[#374151]",
  },
  efectivo: {
    label: "Efectivo",
    classes: "border-[#E5E7EB] bg-[#FAFAFA] text-[#374151]",
  },
  dolares: {
    label: "Dólares",
    classes: "border-[#E5E7EB] bg-[#FAFAFA] text-[#374151]",
  },
  pesos: {
    label: "Pesos",
    classes: "border-[#E5E7EB] bg-[#FAFAFA] text-[#374151]",
  },
  permuta: {
    label: "Permuta",
    classes: "border-[#E5E7EB] bg-[#FAFAFA] text-[#374151]",
  },
};

export function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  const normalized = typeof method === "string" ? method.toLowerCase() : method;
  const config =
    normalized === "transferencia" ||
    normalized === "efectivo" ||
    normalized === "dolares" ||
    normalized === "pesos" ||
    normalized === "permuta"
      ? methodMap[normalized]
      : {
          label: method ?? "Sin método",
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
