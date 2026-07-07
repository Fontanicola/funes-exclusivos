type VehiculoStatus = "en_stock" | "vendido" | "en_consignacion" | string | null;

const statusMap: Record<
  "en_stock" | "vendido" | "en_consignacion",
  { label: string; classes: string }
> = {
  en_stock: {
    label: "En stock",
    classes: "border-[#D1FAE5] bg-[#ECFDF5] text-[#065F46]",
  },
  vendido: {
    label: "Vendido",
    classes: "border-[#E5E7EB] bg-[#F9FAFB] text-[#374151]",
  },
  en_consignacion: {
    label: "Consignación",
    classes: "border-[#E5E7EB] bg-[#FAFAFA] text-[#4B5563]",
  },
};

export function VehiculoStatusBadge({ status }: { status: VehiculoStatus }) {
  const config =
    status === "en_stock" || status === "vendido" || status === "en_consignacion"
      ? statusMap[status]
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
