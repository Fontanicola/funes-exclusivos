"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createWhatsappInstanceAction } from "@/app/(dashboard)/whatsapp/actions";

type Employee = {
  id: string;
  nombre: string | null;
  email: string | null;
  rol: string | null;
};

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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Creando..." : "Crear instancia"}
    </button>
  );
}

export function WhatsappInstanceCreateForm({ employees }: { employees: Employee[] }) {
  const [state, formAction] = useFormState(createWhatsappInstanceAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
    >
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-[#111827]">Crear instancia</h2>
        <p className="text-sm text-[#6B7280]">
          La instancia se crea automáticamente con un nombre interno por vendedor.
        </p>
      </div>

      {state.error ? (
        <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-sm text-[#111827]">
          {state.error}
        </div>
      ) : null}

      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <FieldLabel htmlFor="empleado_id">Vendedor</FieldLabel>
          <select
            id="empleado_id"
            name="empleado_id"
            className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
            defaultValue=""
            required
          >
            <option value="">Seleccionar vendedor</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.nombre ?? employee.email}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-xs leading-5 text-[#6B7280]">
          El nombre interno se genera como <span className="font-medium text-[#111827]">funes_emp_XXXXXXXX</span>.
        </div>

        <SubmitButton />
      </div>
    </form>
  );
}
