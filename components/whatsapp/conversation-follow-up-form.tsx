"use client";

import { useEffect, useRef } from "react";
import type { SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateConversationFollowUpAction } from "@/app/(dashboard)/whatsapp/actions";

type Conversation = {
  id: string;
  estado: string | null;
  interes_compra: string | null;
  resumen_ia: string | null;
  intencion_detectada: string | null;
  proxima_accion_sugerida: string | null;
  requiere_atencion: boolean | null;
};

type ActionState = {
  error?: string;
  success?: boolean;
};

const initialState: ActionState = {};

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: string;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-[#111827]">
      {children}
    </label>
  );
}

function Input(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="min-h-[90px] w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]" />;
}

function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="h-11 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]"
    />
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center rounded-md bg-[#8A1538] px-4 text-sm font-medium text-white transition hover:bg-[#6F102D] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Guardando..." : "Guardar seguimiento"}
    </button>
  );
}

export function ConversationFollowUpForm({ conversation }: { conversation: Conversation }) {
  const [state, formAction] = useFormState(updateConversationFollowUpAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <section className="rounded-md border border-[#E5E7EB] bg-white p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-[#111827]">Seguimiento comercial</h3>
        <p className="text-sm text-[#6B7280]">
          Ajustá el estado y la próxima acción sin duplicar el resumen IA.
        </p>
      </div>

      <form ref={formRef} action={formAction} className="mt-4 space-y-4">
        <input type="hidden" name="conversation_id" value={conversation.id} />
        <input type="hidden" name="resumen_ia" value={conversation.resumen_ia ?? ""} />
        <input type="hidden" name="intencion_detectada" value={conversation.intencion_detectada ?? ""} />

        <div className="grid gap-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="estado">Estado</FieldLabel>
            <Select id="estado" name="estado" defaultValue={conversation.estado ?? "abierta"}>
              <option value="abierta">Abierta</option>
              <option value="en_seguimiento">En seguimiento</option>
              <option value="cerrada">Cerrada</option>
              <option value="archivada">Archivada</option>
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="interes_compra">Interés</FieldLabel>
            <Select id="interes_compra" name="interes_compra" defaultValue={conversation.interes_compra ?? "no_detectado"}>
              <option value="alto">Alto</option>
              <option value="medio">Medio</option>
              <option value="bajo">Bajo</option>
              <option value="sin_interes">Sin interés</option>
              <option value="no_detectado">No detectado</option>
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="proxima_accion_sugerida">Próxima acción sugerida</FieldLabel>
            <Input
              id="proxima_accion_sugerida"
              name="proxima_accion_sugerida"
              defaultValue={conversation.proxima_accion_sugerida ?? ""}
            />
          </div>
          <label
            htmlFor="requiere_atencion"
            className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-3 text-sm text-[#111827]"
          >
            <input
              id="requiere_atencion"
              name="requiere_atencion"
              type="checkbox"
              defaultChecked={Boolean(conversation.requiere_atencion)}
              className="h-4 w-4 rounded border-[#D1D5DB] text-[#18181B] focus:ring-[#D1D5DB]"
            />
            Requiere atención
          </label>
        </div>

        {state.error ? (
          <div className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-sm text-[#111827]">
            {state.error}
          </div>
        ) : null}

        {state.success ? (
          <div className="rounded-md border border-[#D1FAE5] bg-[#ECFDF5] px-4 py-3 text-sm text-[#065F46]">
            Seguimiento actualizado correctamente.
          </div>
        ) : null}

        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </section>
  );
}
