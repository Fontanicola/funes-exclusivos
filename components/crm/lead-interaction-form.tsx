"use client";

import { useEffect, useRef } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createLeadInteractionAction } from "@/app/(dashboard)/crm/actions";

type ActionState = {
  error?: string;
  success?: boolean;
};

const initialState: ActionState = {};

function FieldLabel({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-[#111827]">
      {children}
    </label>
  );
}

function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]",
        className,
      ].join(" ")}
    />
  );
}

function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[
        "min-h-[120px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]",
        className,
      ].join(" ")}
    />
  );
}

function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[
        "h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]",
        className,
      ].join(" ")}
    >
      {children}
    </select>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Agregando..." : "Agregar interacción"}
    </button>
  );
}

export function LeadInteractionForm({ leadId }: { leadId: string }) {
  const [state, formAction] = useFormState(createLeadInteractionAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <input type="hidden" name="lead_id" value={leadId} />

      <div className="space-y-1">
        <h2 className="text-base font-semibold text-[#111827]">Nueva interacción</h2>
        <p className="text-sm text-[#6B7280]">Registrá una llamada, mensaje, visita o nota.</p>
      </div>

      {state.error ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-sm text-[#111827]">
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-4">
        <div className="space-y-2">
          <FieldLabel htmlFor="tipo">Tipo *</FieldLabel>
          <Select id="tipo" name="tipo" defaultValue="nota" required>
            <option value="nota">Nota</option>
            <option value="llamada">Llamada</option>
            <option value="mensaje">Mensaje</option>
            <option value="visita">Visita</option>
            <option value="seguimiento">Seguimiento</option>
          </Select>
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="titulo">Título</FieldLabel>
          <Input id="titulo" name="titulo" placeholder="Título breve" />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="contenido">Contenido *</FieldLabel>
          <Textarea id="contenido" name="contenido" placeholder="Detalle de la interacción" required />
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
