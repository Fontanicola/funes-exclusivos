type DonutSegment = {
  label: string;
  value: number;
  tone?: string;
};

type SimpleDonutChartProps = {
  segments: DonutSegment[];
  centerLabel: string;
  centerValue: string;
  sublabel?: string;
  className?: string;
};

const palette = ["#111827", "#10B981", "#F59E0B", "#64748B", "#F43F5E", "#94A3B8"];

export function SimpleDonutChart({
  segments,
  centerLabel,
  centerValue,
  sublabel,
  className = "",
}: SimpleDonutChartProps) {
  const total = segments.reduce((sum, item) => sum + Math.max(0, item.value), 0);

  if (!total) {
    return (
      <div className={["rounded-[28px] border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-4 py-8 text-center text-sm text-[#6B7280]", className].join(" ")}>
        Sin datos para representar.
      </div>
    );
  }

  let cursor = 0;
  const slices = segments.map((segment, index) => {
    const start = cursor;
    const share = (Math.max(0, segment.value) / total) * 100;
    cursor += share;
    return {
      ...segment,
      start,
      end: start + share,
      color: segment.tone ?? palette[index % palette.length],
    };
  });

  const gradient = slices
    .map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`)
    .join(", ");

  return (
    <div className={["grid gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]", className].join(" ")}>
      <div className="flex items-center justify-center">
        <div className="relative flex h-52 w-52 items-center justify-center">
          <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(${gradient})` }} />
          <div className="absolute inset-[18px] rounded-full border border-[#E5E7EB] bg-white shadow-inner" />
          <div className="relative z-10 text-center">
            <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">{centerLabel}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-[#111827]">{centerValue}</p>
            {sublabel ? <p className="mt-1 text-xs text-[#6B7280]">{sublabel}</p> : null}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {slices.map((segment) => (
          <div key={segment.label} className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#111827]">{segment.label}</p>
                <p className="text-xs text-[#6B7280]">{formatPercentage(segment.value, total)}</p>
              </div>
              <span className="text-sm font-semibold text-[#111827]">{new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(segment.value)}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full" style={{ width: `${Math.max(8, (segment.value / total) * 100)}%`, backgroundColor: segment.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatPercentage(value: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}% del total`;
}
