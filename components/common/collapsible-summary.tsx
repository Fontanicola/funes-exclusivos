"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { BarChart3, ChevronDown } from "lucide-react";

type CollapsibleSummaryProps = {
  sectionKey: string;
  children: ReactNode;
  label?: string;
};

export function CollapsibleSummary({
  sectionKey,
  children,
  label = "Ver resumen",
}: CollapsibleSummaryProps) {
  const storageKey = `funes:summary:${sectionKey}`;
  const [isOpen, setIsOpen] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setIsOpen(window.localStorage.getItem(storageKey) === "open");
    setPortalTarget(document.getElementById("section-subheader-actions"));
  }, [storageKey]);

  function toggle() {
    setIsOpen((current) => {
      const next = !current;
      window.localStorage.setItem(storageKey, next ? "open" : "closed");
      return next;
    });
  }

  const trigger = (
    <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 text-xs font-medium text-[#374151] transition hover:border-[#D8A1B2] hover:text-[#8A1538]"
      >
        <BarChart3 className="h-3.5 w-3.5" />
        {isOpen ? "Ocultar métricas" : label === "Ver resumen" ? "Métricas" : label}
        <ChevronDown className={["h-4 w-4 transition-transform", isOpen ? "rotate-180" : ""].join(" ")} />
      </button>
  );

  return (
    <div>
      {portalTarget ? createPortal(trigger, portalTarget) : null}
      <div
        className={[
          "grid transition-[grid-template-rows,opacity,margin] duration-200 ease-out",
          isOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
        aria-hidden={!isOpen}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
