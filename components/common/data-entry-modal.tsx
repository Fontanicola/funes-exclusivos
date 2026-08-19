"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { X } from "lucide-react";

export function DataEntryModal({
  triggerLabel,
  triggerContent,
  title,
  description,
  children,
  triggerClassName,
  size = "wide",
}: {
  triggerLabel: string;
  triggerContent?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  triggerClassName?: string;
  size?: "default" | "wide";
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName ?? "inline-flex h-10 items-center justify-center rounded-md bg-[#8A1538] px-4 text-sm font-medium text-white transition hover:bg-[#6F102D]"}
      >
        {triggerContent ?? triggerLabel}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#111827]/45 px-4 py-6 sm:py-10"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={["w-full overflow-hidden rounded-md border border-[#E5E7EB] bg-white shadow-xl", size === "wide" ? "max-w-5xl" : "max-w-2xl"].join(" ")}
          >
            <header className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] px-5 py-4">
              <div className="min-w-0 space-y-1">
                <h2 id={titleId} className="text-lg font-semibold text-[#111827]">{title}</h2>
                {description ? <p className="text-sm text-[#6B7280]">{description}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] transition hover:bg-[#F9FAFB] hover:text-[#111827]"
                aria-label="Cerrar ventana"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="max-h-[calc(100vh-170px)] overflow-y-auto p-5">{children}</div>
          </section>
        </div>
      ) : null}
    </>
  );
}
