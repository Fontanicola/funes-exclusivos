type PresupuestoStatus =
  | "borrador"
  | "enviado"
  | "aprobado"
  | "rechazado"
  | "facturado"
  | "anulado"
  | string
  | null
  | undefined;

const statusMap: Record<string, { label: string; classes: string }> = {
  borrador: {
    label: "Borrador",
    classes: "border-amber-200 bg-amber-50 text-amber-800",
  },
  enviado: {
    label: "Enviado",
    classes: "border-slate-200 bg-slate-50 text-slate-700",
  },
  aprobado: {
    label: "Aprobado",
    classes: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  rechazado: {
    label: "Rechazado",
    classes: "border-rose-200 bg-rose-50 text-rose-700",
  },
  facturado: {
    label: "Facturado",
    classes: "border-indigo-200 bg-indigo-50 text-indigo-800",
  },
  anulado: {
    label: "Anulado",
    classes: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

export function PresupuestoStatusBadge({ status }: { status: PresupuestoStatus }) {
  const normalized = (status ?? "").toLowerCase();
  const config = statusMap[normalized] ?? statusMap.borrador;

  return (
    <span
      className={[
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium",
        config.classes,
      ].join(" ")}
    >
      {config.label}
    </span>
  );
}
