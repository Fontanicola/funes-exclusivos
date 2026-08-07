"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

export function AdvancedFilters({
  children,
  label = "Más filtros",
}: {
  children: ReactNode;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="contents">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={[
          "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition",
          open
            ? "border-[#D8A1B2] bg-[#FDF2F5] text-[#8A1538]"
            : "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]",
        ].join(" ")}
        aria-expanded={open}
      >
        <SlidersHorizontal className="h-4 w-4" />
        {label}
      </button>

      {open ? (
        <div className="flex w-full flex-wrap gap-2 rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-3">
          {children}
        </div>
      ) : null}
    </div>
  );
}
