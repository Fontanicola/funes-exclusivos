"use client";

import { useEffect, useRef } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addGestoriaPresupuestoItemAction } from "@/app/(dashboard)/gestoria/presupuestos/actions";

type ActionState = {
  error?: string;
  success?: boolean;
};

const initialState: ActionState = {};

const ITEM_TYPES = [
  ["valor_tabla_dnrpa", "Tabla DNRPA"],
  ["valor_tabla_api", "Tabla API"],
  ["ceta_factura", "CETA / Factura"],
  ["aranceles", "Aranceles"],
  ["impuesto_sellos", "Impuesto de sellos"],
  ["certificaciones", "Certificaciones"],
  ["formularios", "Formularios"],
  ["honorarios", "Honorarios"],
  ["registro", "Registro"],
  ["patentes", "Patentes"],
  ["otro", "Otro"],
] as const;

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return <label htmlFor={htmlFor} className="text-sm font-medium text-[#111827]">{children}</label>;
}

function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={["h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]", className].join(" ")} />;
}

function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={["min-h-[90px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]", className].join(" ")} />;
}

function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={["h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]", className].join(" ")}>{children}</select>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="inline-flex h-10 items-center justify-center rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A] disabled:cursor-not-allowed disabled:opacity-70">
      {pending ? "Agregando..." : "Agregar ítem"}
    </button>
  );
}

export function PresupuestoItemForm({ presupuestoId }: { presupuestoId: string }) {
  const [state, formAction] = useFormState(addGestoriaPresupuestoItemAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <input type="hidden" name="presupuesto_id" value={presupuestoId} />
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-[#111827]">Agregar ítem</h3>
        <p className="text-sm text-[#6B7280]">Completá una línea extra si el presupuesto necesita ajustes.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="tipo">Tipo</FieldLabel>
          <Select id="tipo" name="tipo" defaultValue="aranceles">
            {ITEM_TYPES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="monto">Monto</FieldLabel>
          <Input id="monto" name="monto" type="number" min="0" step="0.01" placeholder="0" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <FieldLabel htmlFor="descripcion">Descripción</FieldLabel>
          <Textarea id="descripcion" name="descripcion" placeholder="Detalle del nuevo ítem..." />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="moneda">Moneda</FieldLabel>
          <Select id="moneda" name="moneda" defaultValue="ARS">
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
          </Select>
        </div>
      </div>

      {state.error ? (
        <div className="rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">{state.error}</div>
      ) : null}

      <SubmitButton />
    </form>
  );
}
