type VentaStatus = "registrada" | "anulada" | string | null;

const statusMap: Record<"registrada" | "anulada", { label: string; classes: string }> = {
  registrada: {
    label: "Registrada",
    classes: "border-[#D1FAE5] bg-[#ECFDF5] text-[#065F46]",
  },
  anulada: {
    label: "Anulada",
    classes: "border-[#E5E7EB] bg-[#F9FAFB] text-[#374151]",
  },
};

export function VentaStatusBadge({ status }: { status: VentaStatus }) {
  const normalized = typeof status === "string" ? status.toLowerCase() : status;
  const config =
    normalized === "registrada" || normalized === "anulada"
      ? statusMap[normalized]
      : {
          label: status ?? "Sin estado",
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
