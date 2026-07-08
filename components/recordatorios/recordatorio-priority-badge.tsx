type Priority = string | null | undefined;

const priorityStyles: Record<
  string,
  { label: string; className: string }
> = {
  baja: {
    label: "Baja",
    className: "border-slate-200 bg-slate-50 text-slate-800",
  },
  media: {
    label: "Media",
    className: "border-slate-200 bg-zinc-50 text-zinc-800",
  },
  alta: {
    label: "Alta",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  critica: {
    label: "Crítica",
    className: "border-rose-200 bg-rose-50 text-rose-800",
  },
};

export function RecordatorioPriorityBadge({ priority }: { priority: Priority }) {
  const normalized = (priority ?? "").toLowerCase();
  const config = priorityStyles[normalized] ?? priorityStyles.media;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
