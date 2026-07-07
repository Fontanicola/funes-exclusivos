type EntregaStatus =
  | "pendiente"
  | "en_proceso"
  | "lista_para_entregar"
  | "entregada"
  | "observada"
  | "cancelada"
  | string
  | null;

const statusMap: Record<
  "pendiente" | "en_proceso" | "lista_para_entregar" | "entregada" | "observada" | "cancelada",
  { label: string; classes: string }
> = {
  pendiente: {
    label: "Pendiente",
    classes: "border-[#FEF3C7] bg-[#FFFBEB] text-[#92400E]",
  },
  en_proceso: {
    label: "En proceso",
    classes: "border-[#E5E7EB] bg-[#FAFAFA] text-[#374151]",
  },
  lista_para_entregar: {
    label: "Lista para entregar",
    classes: "border-[#E5E7EB] bg-[#FAFAFA] text-[#374151]",
  },
  entregada: {
    label: "Entregada",
    classes: "border-[#D1FAE5] bg-[#ECFDF5] text-[#065F46]",
  },
  observada: {
    label: "Observada",
    classes: "border-[#FEF3C7] bg-[#FFFBEB] text-[#92400E]",
  },
  cancelada: {
    label: "Cancelada",
    classes: "border-[#FEE2E2] bg-[#FEF2F2] text-[#991B1B]",
  },
};

export function EntregaStatusBadge({ status }: { status: EntregaStatus }) {
  const normalized = typeof status === "string" ? status.toLowerCase() : status;
  const config =
    normalized === "pendiente" ||
    normalized === "en_proceso" ||
    normalized === "lista_para_entregar" ||
    normalized === "entregada" ||
    normalized === "observada" ||
    normalized === "cancelada"
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
