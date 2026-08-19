"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { analyzeNewLeadsWithAiAction } from "@/app/(dashboard)/crm/actions";

export function AnalyzeNewLeadsButton() {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleClick() {
    setFeedback(null);
    startTransition(async () => {
      const result = await analyzeNewLeadsWithAiAction();
      setFeedback(result.error ?? result.message ?? null);
      if (result.success) window.location.reload();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#D8A1B2] bg-white px-3 text-sm font-medium text-[#8A1538] transition hover:bg-[#FDF2F5] disabled:cursor-wait disabled:opacity-60"
      >
        <Sparkles className="h-4 w-4" />
        {isPending ? "Analizando leads..." : "Analizar nuevos con IA"}
      </button>
      {feedback ? <p className="max-w-[280px] text-right text-xs text-[#6B7280]">{feedback}</p> : null}
    </div>
  );
}
