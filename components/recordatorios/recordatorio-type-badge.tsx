type RecordatorioType = string | null | undefined;

const typeStyles: Record<
  string,
  { label: string; className: string }
> = {
  seguimiento_crm: {
    label: "Seguimiento CRM",
    className: "border-slate-200 bg-slate-50 text-slate-800",
  },
  gestoria: {
    label: "Gestoría",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  entrega: {
    label: "Entrega",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  whatsapp: {
    label: "WhatsApp",
    className: "border-slate-200 bg-zinc-50 text-zinc-800",
  },
  caja: {
    label: "Caja",
    className: "border-slate-200 bg-slate-50 text-slate-800",
  },
  comision: {
    label: "Comisión",
    className: "border-rose-200 bg-rose-50 text-rose-800",
  },
  inventario: {
    label: "Inventario",
    className: "border-slate-200 bg-slate-50 text-slate-800",
  },
  otro: {
    label: "Otro",
    className: "border-slate-200 bg-[#FAFAFA] text-[#6B7280]",
  },
};

export function RecordatorioTypeBadge({ type }: { type: RecordatorioType }) {
  const normalized = (type ?? "").toLowerCase();
  const config = typeStyles[normalized] ?? typeStyles.otro;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
