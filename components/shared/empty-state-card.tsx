import Link from "next/link";
import type { ReactNode } from "react";

export function EmptyStateCard({
  title,
  description,
  actionHref,
  actionLabel,
  icon,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-6 py-10 text-center">
      <div className="max-w-md space-y-4">
        {icon ? (
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white text-[#6B7280]">
            {icon}
          </div>
        ) : null}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-[#111827]">{title}</h3>
          {description ? (
            <p className="text-sm leading-6 text-[#6B7280]">{description}</p>
          ) : null}
        </div>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#111827] px-4 text-sm font-medium text-white transition hover:bg-[#27272A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D1D5DB]"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
