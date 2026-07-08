import type { ReactNode } from "react";

type DashboardChartCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function DashboardChartCard({
  title,
  description,
  action,
  className = "",
  children,
}: DashboardChartCardProps) {
  return (
    <section className={["rounded-[32px] border border-[#E5E7EB] bg-white shadow-sm", className].join(" ")}>
      <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] p-5">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
          {description ? <p className="mt-1 text-sm text-[#6B7280]">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}
