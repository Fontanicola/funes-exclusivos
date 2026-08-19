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
    classes: "border-blue-200 bg-blue-50 text-blue-800",
  },
  en_consignacion: {
    label: "Consignación",
    classes: "border-amber-200 bg-amber-50 text-amber-800",
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
