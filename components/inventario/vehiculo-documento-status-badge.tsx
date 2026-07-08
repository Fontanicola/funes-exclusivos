type VehiculoDocumentoStatus =
  | "pendiente"
  | "recibido"
  | "observado"
  | "vencido"
  | "archivado"
  | string
  | null
  | undefined;

const statusMap: Record<
  "pendiente" | "recibido" | "observado" | "vencido" | "archivado",
  { label: string; classes: string }
> = {
  pendiente: {
    label: "Pendiente",
    classes: "border-amber-200 bg-amber-50/80 text-amber-900",
  },
  recibido: {
    label: "Recibido",
    classes: "border-emerald-200 bg-emerald-50/80 text-emerald-900",
  },
  observado: {
    label: "Observado",
    classes: "border-rose-200 bg-rose-50/80 text-rose-900",
  },
  vencido: {
    label: "Vencido",
    classes: "border-rose-200 bg-rose-50/80 text-rose-900",
  },
  archivado: {
    label: "Archivado",
    classes: "border-[#E5E7EB] bg-[#FAFAFA] text-[#6B7280]",
  },
};

export function VehiculoDocumentoStatusBadge({ status }: { status: VehiculoDocumentoStatus }) {
  const normalized = (status ?? "").toLowerCase();
  const config =
    normalized in statusMap
      ? statusMap[normalized as keyof typeof statusMap]
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
