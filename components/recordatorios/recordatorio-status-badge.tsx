type RecordatorioStatus = string | null | undefined;

const statusStyles: Record<
  string,
  { label: string; className: string }
> = {
  pendiente: {
    label: "Pendiente",
    className: "border-slate-200 bg-slate-50 text-slate-800",
  },
  completado: {
    label: "Completado",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  pospuesto: {
    label: "Pospuesto",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  cancelado: {
    label: "Cancelado",
    className: "border-rose-200 bg-rose-50 text-rose-800",
  },
};

export function RecordatorioStatusBadge({ status }: { status: RecordatorioStatus }) {
  const normalized = (status ?? "").toLowerCase();
  const config = statusStyles[normalized] ?? statusStyles.pendiente;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
