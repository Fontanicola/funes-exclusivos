"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Sparkles, RefreshCw } from "lucide-react";
import { generateConversationAiSummaryAction } from "@/app/(dashboard)/whatsapp/actions";
import { ConversacionInterestBadge } from "./conversacion-interest-badge";

type Conversation = {
  id: string;
  ia_estado: string | null;
  ia_resumen: string | null;
  ia_interes_compra: string | null;
  ia_score: number | null;
  ia_intencion: string | null;
  ia_proximo_paso: string | null;
  ia_procesado_at: string | null;
  ia_error: string | null;
  resumen_ia: string | null;
  interes_compra: string | null;
  intencion_detectada: string | null;
  proxima_accion_sugerida: string | null;
};

type ActionState = {
  error?: string;
  success?: boolean;
};

const initialState: ActionState = {};

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(date);
}

function getStatusLabel(status: string | null) {
  switch ((status ?? "").toLowerCase()) {
    case "procesado":
      return "Procesado";
    case "pendiente":
      return "Pendiente";
    case "error":
      return "Error";
    case "en_proceso":
      return "En proceso";
    default:
      return "Sin resumen";
  }
}

function SubmitButton({ hasSummary }: { hasSummary: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      {pending ? "Generando..." : hasSummary ? "Actualizar resumen IA" : "Generar resumen IA"}
    </button>
  );
}

export function AiSummaryCard({ conversation }: { conversation: Conversation }) {
  const [state, formAction] = useFormState(generateConversationAiSummaryAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const hasSummary = Boolean(conversation.ia_resumen ?? conversation.resumen_ia);

  useEffect(() => {
    if (state.success) {
      formRef.current?.blur();
    }
  }, [state.success]);

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-[#FBFBFC] p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs font-medium text-[#111827]">
              {getStatusLabel(conversation.ia_estado)}
            </span>
            <ConversacionInterestBadge
              interest={conversation.ia_interes_compra ?? conversation.interes_compra}
            />
            {conversation.ia_score != null ? (
              <span className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-xs font-medium text-[#6B7280]">
                Score {conversation.ia_score}
              </span>
            ) : null}
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-[#111827]">Resumen IA de conversación</h3>
          <p className="text-sm leading-6 text-[#6B7280]">
            Generá un resumen automático con intención de compra, score y próxima acción sugerida.
          </p>
        </div>

        <form ref={formRef} action={formAction}>
          <input type="hidden" name="conversation_id" value={conversation.id} />
          <SubmitButton hasSummary={hasSummary} />
        </form>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Resumen</p>
          <p className="mt-2 text-sm leading-6 text-[#111827]">
            {conversation.ia_resumen ?? conversation.resumen_ia ?? "Sin resumen generado todavía."}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Intención</p>
            <p className="mt-2 text-sm font-medium text-[#111827]">
              {conversation.ia_intencion ?? conversation.intencion_detectada ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Próximo paso</p>
            <p className="mt-2 text-sm font-medium text-[#111827]">
              {conversation.ia_proximo_paso ?? conversation.proxima_accion_sugerida ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:col-span-2">
            <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Procesado</p>
            <p className="mt-2 text-sm font-medium text-[#111827]">
              {formatDateTime(conversation.ia_procesado_at)}
            </p>
          </div>
        </div>
      </div>

      {conversation.ia_error ? (
        <div className="mt-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
          {conversation.ia_error}
        </div>
      ) : null}

      {state.error ? (
        <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827]">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="mt-4 rounded-xl border border-[#D1FAE5] bg-[#ECFDF5] px-4 py-3 text-sm text-[#065F46]">
          Resumen IA actualizado correctamente.
        </div>
      ) : null}
    </section>
  );
}
