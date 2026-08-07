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
    <div className="flex min-h-[180px] items-center justify-center rounded-md border border-dashed border-[#CBD5E1] bg-white px-6 py-8 text-center">
      <div className="max-w-md space-y-4">
        {icon ? (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-[#D8A1B2] bg-[#FDF2F5] text-[#8A1538]">
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
            className="inline-flex h-10 items-center justify-center rounded-md bg-[#8A1538] px-4 text-sm font-medium text-white transition hover:bg-[#6F102D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D8A1B2]"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
