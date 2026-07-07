import Link from "next/link";

type KpiTone = "neutral" | "highlight" | "success" | "warning" | "critical" | "info";

type KpiCardProps = {
  title: string;
  value: string;
  description?: string;
  href?: string;
  tone?: KpiTone;
  featured?: boolean;
  badge?: string;
  progress?: {
    value: number;
    label?: string;
  };
  note?: string;
  className?: string;
};

const toneClasses: Record<KpiTone, { shell: string; title: string; accent: string; badge: string }> = {
  neutral: {
    shell: "border-[#E5E7EB] bg-white",
    title: "text-[#111827]",
    accent: "bg-[#111827]",
    badge: "border-[#E5E7EB] bg-[#FAFAFA] text-[#6B7280]",
  },
  highlight: {
    shell: "border-[#111827] bg-[#111827]",
    title: "text-white",
    accent: "bg-white",
    badge: "border-white/15 bg-white/10 text-white/80",
  },
  success: {
    shell: "border-emerald-200 bg-emerald-50/80",
    title: "text-emerald-950",
    accent: "bg-emerald-500",
    badge: "border-emerald-200 bg-white text-emerald-700",
  },
  warning: {
    shell: "border-amber-200 bg-amber-50/80",
    title: "text-amber-950",
    accent: "bg-amber-500",
    badge: "border-amber-200 bg-white text-amber-700",
  },
  critical: {
    shell: "border-rose-200 bg-rose-50/80",
    title: "text-rose-950",
    accent: "bg-rose-500",
    badge: "border-rose-200 bg-white text-rose-700",
  },
  info: {
    shell: "border-slate-200 bg-slate-50/80",
    title: "text-slate-950",
    accent: "bg-slate-500",
    badge: "border-slate-200 bg-white text-slate-700",
  },
};

function ProgressRing({
  tone,
  value,
  label,
}: {
  tone: KpiTone;
  value: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const { accent } = toneClasses[tone];

  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(${tone === "highlight"
            ? "#FFFFFF"
            : tone === "success"
              ? "#10B981"
              : tone === "warning"
                ? "#F59E0B"
                : tone === "critical"
                  ? "#F43F5E"
                  : "#475569"} ${clamped * 3.6}deg, rgba(255,255,255,0.18) 0deg)`,
        }}
      >
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tone === "highlight" ? "bg-[#111827] text-white" : "bg-white text-[#111827]"}`}>
          <span className="text-[11px] font-semibold">{clamped}%</span>
        </div>
      </div>
      <div className="space-y-0.5">
        <p className={`text-xs uppercase tracking-[0.12em] ${tone === "highlight" ? "text-white/65" : "text-[#6B7280]"}`}>
          {label ?? "Progreso"}
        </p>
        <div className={`h-1.5 w-24 overflow-hidden rounded-full ${tone === "highlight" ? "bg-white/15" : "bg-black/5"}`}>
          <div className={`h-full rounded-full ${accent}`} style={{ width: `${clamped}%` }} />
        </div>
      </div>
    </div>
  );
}

export function KpiCard({
  title,
  value,
  description,
  href,
  tone = "neutral",
  featured = false,
  badge,
  progress,
  note,
  className = "",
}: KpiCardProps) {
  const classes = toneClasses[tone];

  const content = (
    <article
      className={[
        "group relative h-full overflow-hidden rounded-[28px] border shadow-sm transition",
        classes.shell,
        featured ? "p-6" : "p-5",
        tone === "highlight" ? "shadow-lg shadow-black/10" : "hover:-translate-y-0.5 hover:shadow-md",
        className,
      ].join(" ")}
    >
      <div className="relative z-10 flex h-full flex-col justify-between gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className={`text-sm font-medium ${tone === "highlight" ? "text-white/75" : "text-[#6B7280]"}`}>
                {title}
              </p>
              {badge ? (
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${classes.badge}`}>
                  {badge}
                </span>
              ) : null}
            </div>
            <p className={`${featured ? "text-4xl" : "text-3xl"} font-semibold tracking-tight ${classes.title}`}>
              {value}
            </p>
            {description ? (
              <p className={`max-w-sm text-sm leading-6 ${tone === "highlight" ? "text-white/70" : "text-[#6B7280]"}`}>
                {description}
              </p>
            ) : null}
          </div>

          {progress ? (
            <ProgressRing tone={tone} value={progress.value} label={progress.label} />
          ) : null}
        </div>

        {note ? (
          <div className={`rounded-2xl border px-3 py-2 text-xs ${tone === "highlight" ? "border-white/10 bg-white/5 text-white/70" : "border-[#E5E7EB] bg-[#FAFAFA] text-[#6B7280]"}`}>
            {note}
          </div>
        ) : null}
      </div>

      {tone === "highlight" ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%)]" />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.45),transparent_45%)] opacity-60" />
      )}
    </article>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D1D5DB]">
      {content}
    </Link>
  );
}
