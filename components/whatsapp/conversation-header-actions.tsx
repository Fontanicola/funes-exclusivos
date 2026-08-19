"use client";

import type { ReactNode } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import {
  generateConversationAiSummaryAction,
} from "@/app/(dashboard)/whatsapp/actions";

type ActionState = {
  error?: string;
  success?: boolean;
};

const initialState: ActionState = {};

function SubmitButton({
  children,
  icon,
  tone = "default",
}: {
  children: string;
  icon: ReactNode;
  tone?: "default" | "primary";
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={[
        "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70",
        tone === "primary"
          ? "border-[#8A1538] bg-[#8A1538] text-white hover:bg-[#6F102D]"
          : "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]",
      ].join(" ")}
    >
      {pending ? <RefreshCw className="h-4 w-4 animate-spin" /> : icon}
      {pending ? "Procesando..." : children}
    </button>
  );
}

export function ConversationHeaderActions({
  conversationId,
  hasSummary,
}: {
  conversationId: string;
  hasSummary: boolean;
}) {
  const [summaryState, summaryAction] = useFormState(generateConversationAiSummaryAction, initialState);

  return (
    <div className="flex flex-wrap items-start justify-end gap-2">
      <form action={summaryAction}>
        <input type="hidden" name="conversation_id" value={conversationId} />
        <SubmitButton icon={<Sparkles className="h-4 w-4" />} tone="primary">
          {hasSummary ? "Actualizar resumen IA" : "Generar resumen IA"}
        </SubmitButton>
      </form>

      {summaryState.error ? (
        <p className="w-full text-right text-xs text-[#6B7280]">{summaryState.error}</p>
      ) : null}
    </div>
  );
}
