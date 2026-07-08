type VehiculoDocumentoType =
  | "titulo"
  | "cedula"
  | "factura"
  | "boleto"
  | "permiso"
  | "comprobante_pago"
  | "informe_dominio"
  | "verificacion_policial"
  | "seguro"
  | "patente"
  | "formulario"
  | "otro"
  | string
  | null
  | undefined;

const typeMap: Record<
  | "titulo"
  | "cedula"
  | "factura"
  | "boleto"
  | "permiso"
  | "comprobante_pago"
  | "informe_dominio"
  | "verificacion_policial"
  | "seguro"
  | "patente"
  | "formulario"
  | "otro",
  { label: string; classes: string }
> = {
  titulo: { label: "Título", classes: "border-slate-200 bg-slate-50/80 text-slate-900" },
  cedula: { label: "Cédula", classes: "border-slate-200 bg-slate-50/80 text-slate-900" },
  factura: { label: "Factura", classes: "border-slate-200 bg-slate-50/80 text-slate-900" },
  boleto: { label: "Boleto", classes: "border-slate-200 bg-slate-50/80 text-slate-900" },
  permiso: { label: "Permiso", classes: "border-slate-200 bg-slate-50/80 text-slate-900" },
  comprobante_pago: {
    label: "Comprobante de pago",
    classes: "border-slate-200 bg-slate-50/80 text-slate-900",
  },
  informe_dominio: {
    label: "Informe de dominio",
    classes: "border-slate-200 bg-slate-50/80 text-slate-900",
  },
  verificacion_policial: {
    label: "Verificación policial",
    classes: "border-slate-200 bg-slate-50/80 text-slate-900",
  },
  seguro: { label: "Seguro", classes: "border-slate-200 bg-slate-50/80 text-slate-900" },
  patente: { label: "Patente", classes: "border-slate-200 bg-slate-50/80 text-slate-900" },
  formulario: { label: "Formulario", classes: "border-slate-200 bg-slate-50/80 text-slate-900" },
  otro: { label: "Otro", classes: "border-[#E5E7EB] bg-[#FAFAFA] text-[#6B7280]" },
};

export function VehiculoDocumentoTypeBadge({ type }: { type: VehiculoDocumentoType }) {
  const normalized = (type ?? "").toLowerCase();
  const config =
    normalized in typeMap
      ? typeMap[normalized as keyof typeof typeMap]
      : { label: type ?? "Otro", classes: "border-[#E5E7EB] bg-[#FAFAFA] text-[#6B7280]" };

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
