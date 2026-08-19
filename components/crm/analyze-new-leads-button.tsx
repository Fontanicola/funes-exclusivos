"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { analyzeNewLeadsWithAiAction } from "@/app/(dashboard)/crm/actions";

export function AnalyzeNewLeadsButton({ availableCount = 0 }: { availableCount?: number }) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [limit, setLimit] = useState(String(Math.min(Math.max(availableCount, 1), 20)));
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = 224;
      setPopoverPosition({
        top: rect.bottom + 8,
        left: Math.min(Math.max(rect.left, 12), Math.max(12, window.innerWidth - width - 12)),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  function handleAnalyze() {
    setFeedback(null);
    setIsOpen(false);
    startTransition(async () => {
      const result = await analyzeNewLeadsWithAiAction(Number(limit));
      setFeedback(result.error ?? result.message ?? null);
      if (result.success) window.location.reload();
    });
  }

  return (
    <div className="relative flex flex-col items-end gap-1">
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setIsOpen((current) => !current)}
        disabled={isPending || availableCount === 0}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#D8A1B2] bg-white px-2.5 text-xs font-medium text-[#8A1538] transition hover:bg-[#FDF2F5] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {isPending ? "Analizando..." : "Analizar"}
      </button>
      {isOpen ? (
        <div
          className="fixed z-[60] w-56 max-w-[calc(100vw-2rem)] rounded-md border border-[#E5E7EB] bg-white p-3 shadow-lg"
          style={{ top: popoverPosition.top, left: popoverPosition.left }}
          role="dialog"
          aria-label="Analizar leads nuevos"
        >
          <p className="text-xs font-medium text-[#111827]">¿Cuántos leads analizamos?</p>
          <select
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
            className="mt-2 h-9 w-full rounded-md border border-[#D1D5DB] bg-white px-2 text-sm text-[#111827] outline-none focus:border-[#8A1538]"
          >
            {[10, 20, 50, 100, 200]
              .filter((value) => value <= Math.max(availableCount, 10))
              .map((value) => (
                <option key={value} value={value}>
                  {value} leads
                </option>
              ))}
            <option value={availableCount}>Todos ({availableCount})</option>
          </select>
          <button
            type="button"
            onClick={handleAnalyze}
            className="mt-2 h-9 w-full rounded-md bg-[#8A1538] px-3 text-sm font-medium text-white transition hover:bg-[#6F102D]"
          >
            Comenzar análisis
          </button>
        </div>
      ) : null}
      {feedback ? <p className="max-w-[280px] text-right text-xs text-[#6B7280]">{feedback}</p> : null}
    </div>
  );
}
