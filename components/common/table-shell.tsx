import type { ReactNode } from "react";

export function TableShell({
  children,
  footer,
  className,
}: {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <section className={["rounded-md border border-[#E5E7EB] bg-white", className].filter(Boolean).join(" ")}>
      {children}
      {footer ? <div className="border-t border-[#E5E7EB] px-4 py-3">{footer}</div> : null}
    </section>
  );
}
