import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="space-y-3">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
              {eyebrow}
            </p>
          ) : null}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">{title}</h1>
            {description ? <p className="max-w-3xl text-sm leading-6 text-[#6B7280]">{description}</p> : null}
          </div>
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}

export function PrimaryPageAction({
  href,
  children,
  target,
  rel,
}: {
  href: string;
  children: ReactNode;
  target?: string;
  rel?: string;
}) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className="inline-flex h-10 items-center justify-center rounded-xl bg-[#111827] px-4 text-sm font-medium text-white transition hover:bg-[#27272A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D1D5DB]"
    >
      {children}
    </Link>
  );
}
