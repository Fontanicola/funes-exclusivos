"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

export function ActionMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeWhenOutside = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !menuRef.current?.contains(target)) setOpen(false);
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
    <div ref={menuRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Abrir acciones"
        aria-expanded={open}
        title="Acciones"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] transition hover:bg-[#F9FAFB] hover:text-[#111827]"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 flex max-w-[min(92vw,280px)] min-w-[180px] flex-col gap-1 rounded-md border border-[#E5E7EB] bg-white p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
          {children}
        </div>
      ) : null}
    </div>
  );
}
