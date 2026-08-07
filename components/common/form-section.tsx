import type { ReactNode } from "react";

export function FormSection({
  title,
  description,
  badge,
  children,
  className,
}: {
  title: string;
  description?: string;
  badge?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={["rounded-md border border-[#E5E7EB] bg-white p-4", className].filter(Boolean).join(" ")}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
          {description ? <p className="text-sm leading-6 text-[#6B7280]">{description}</p> : null}
        </div>
        {badge ? (
          <span className="rounded-full border border-[#D8A1B2] bg-[#FDF2F5] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A1538]">
            {badge}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}
