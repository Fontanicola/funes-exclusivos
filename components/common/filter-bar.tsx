import type { ReactNode } from "react";

export function FilterBar({
  title,
  description,
  children,
  action,
  className,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={["rounded-md border border-[#E5E7EB] bg-white", className].filter(Boolean).join(" ")}>
      <div className="space-y-3 border-b border-[#E5E7EB] p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
            {description ? <p className="max-w-3xl text-sm leading-6 text-[#64748B]">{description}</p> : null}
          </div>

          {action ? <div className="shrink-0">{action}</div> : null}
        </div>

        {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
      </div>
    </section>
  );
}
