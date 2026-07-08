"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { createRecordatorioAction } from "@/app/(dashboard)/recordatorios/actions";

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

const types = [
  { value: "seguimiento_crm", label: "Seguimiento CRM" },
  { value: "gestoria", label: "Gestoría" },
  { value: "entrega", label: "Entrega" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "caja", label: "Caja" },
  { value: "comision", label: "Comisión" },
  { value: "inventario", label: "Inventario" },
  { value: "otro", label: "Otro" },
];

const priorities = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
];

function formatEmployeeLabel(employee: Employee) {
  return employee.nombre ?? employee.email ?? employee.id;
}

export function RecordatorioForm({
  employees,
  defaultAsignadoId,
}: {
  employees: Employee[];
  defaultAsignadoId?: string | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(createRecordatorioAction, initialState);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  const defaultAssigned = defaultAsignadoId ?? employees[0]?.id ?? "";

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-[28px] border border-[#E5E7EB] bg-white shadow-sm"
    >
      <div className="border-b border-[#E5E7EB] p-5">
        <h2 className="text-base font-semibold text-[#111827]">Nuevo recordatorio</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Seguimientos, vencimientos y alertas operativas en una sola carga.
        </p>
      </div>

      <div className="space-y-4 p-5">
        {state.error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {state.error}
          </div>
        ) : null}

        {state.success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Recordatorio creado correctamente.
          </div>
        ) : null}

        <div className="grid gap-4">
          <Field label="Tipo" htmlFor="tipo">
            <select
              id="tipo"
              name="tipo"
              defaultValue="seguimiento_crm"
              className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
            >
              {types.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Prioridad" htmlFor="prioridad">
            <select
              id="prioridad"
              name="prioridad"
              defaultValue="media"
              className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
            >
              {priorities.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Título" htmlFor="titulo">
            <input
              id="titulo"
              name="titulo"
              placeholder="Ej.: Llamar por seguimiento de financiación"
              className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
            />
          </Field>

          <Field label="Descripción" htmlFor="descripcion">
            <textarea
              id="descripcion"
              name="descripcion"
              rows={4}
              placeholder="Notas breves, contexto o detalle de la alerta."
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fecha de vencimiento" htmlFor="fecha_vencimiento">
              <input
                id="fecha_vencimiento"
                name="fecha_vencimiento"
                type="date"
                className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
              />
            </Field>

            <Field label="Asignado" htmlFor="asignado_a">
              <select
                id="asignado_a"
                name="asignado_a"
                defaultValue={defaultAssigned}
                className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
              >
                {employees.length ? (
                  employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {formatEmployeeLabel(employee)}
                    </option>
                  ))
                ) : (
                  <option value={defaultAssigned || ""}>Sin asignar</option>
                )}
              </select>
            </Field>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Volver
          </Link>

          <SubmitButton />
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="grid gap-2">
      <span className="text-sm font-medium text-[#111827]">{label}</span>
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
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      Crear recordatorio
    </button>
  );
}
