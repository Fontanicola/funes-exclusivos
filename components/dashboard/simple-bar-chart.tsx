type SimpleBarChartItem = {
  label: string;
  value: number;
  tone?: "slate" | "emerald" | "amber" | "rose" | "zinc";
  helper?: string;
};

type SimpleBarChartProps = {
  items: SimpleBarChartItem[];
  emptyLabel?: string;
  className?: string;
  formatValue?: (value: number) => string;
  compact?: boolean;
};

const toneClasses: Record<NonNullable<SimpleBarChartItem["tone"]>, string> = {
  slate: "bg-slate-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  zinc: "bg-[#111827]",
};

export function SimpleBarChart({
  items,
  emptyLabel = "Sin datos para mostrar.",
  className = "",
  formatValue = (value) => new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(value),
  compact = false,
}: SimpleBarChartProps) {
  if (!items.length) {
    return (
      <div className={["rounded-3xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-4 py-6 text-sm text-[#6B7280]", className].join(" ")}>
        {emptyLabel}
      </div>
    );
  }

  const max = Math.max(...items.map((item) => Math.abs(item.value)), 1);

  return (
    <div className={["space-y-3", className].join(" ")}>
      {items.map((item) => {
        const width = Math.max(8, (Math.abs(item.value) / max) * 100);
        const toneClass = toneClasses[item.tone ?? "zinc"];

        return (
          <div key={item.label} className={compact ? "space-y-1" : "space-y-1.5"}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-medium text-[#111827]">{item.label}</p>
                {item.helper ? <p className="text-xs text-[#6B7280]">{item.helper}</p> : null}
              </div>
              <span className="font-medium text-[#111827]">{formatValue(item.value)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[#F3F4F6]">
              <div className={["h-full rounded-full", toneClass].join(" ")} style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
