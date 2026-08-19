"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

export function AdvancedFilters({
  children,
  label = "Más filtros",
}: {
  children: ReactNode;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeWhenOutside = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !containerRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeWhenOutside);
    window.addEventListener("keydown", closeWithEscape);

    return () => {
      document.removeEventListener("pointerdown", closeWhenOutside);
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-flex shrink-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={[
          "inline-flex h-10 w-10 items-center justify-center rounded-md border transition",
          open
            ? "border-[#D8A1B2] bg-[#FDF2F5] text-[#8A1538]"
            : "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]",
        ].join(" ")}
        aria-expanded={open}
        aria-label={label}
        title={label}
      >
        <SlidersHorizontal className="h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 flex min-w-[240px] max-w-[min(92vw,360px)] flex-col gap-2 rounded-md border border-[#E5E7EB] bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
          {children}
        </div>
      ) : null}
    </div>
  );
}
