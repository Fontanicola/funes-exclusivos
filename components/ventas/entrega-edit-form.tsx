"use client";

import { useEffect, type ReactNode } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateVentaEntregaAction } from "@/app/(dashboard)/ventas/pendientes-entrega/actions";

type Entrega = {
  id: string;
  estado: string | null;
  fecha_entrega: string | null;
  status_informe_vu: string | null;
  usado_credito: string | null;
  usado_informe_dominio: string | null;
  usado_multas: string | null;
  usado_patentes: string | null;
  usado_observaciones: string | null;
  observaciones: string | null;
};

type ActionState = {
  error?: string;
  success?: string;
};

const initialState: ActionState = {};

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
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
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]",
        className,
      ].join(" ")}
    />
  );
}

function Textarea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[
        "min-h-[96px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]",
        className,
      ].join(" ")}
    />
  );
}

function Select({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[
        "h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]",
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
      className="inline-flex h-10 items-center justify-center rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Guardando..." : "Guardar cambios"}
    </button>
  );
}

function formatDate(value: string | null) {
  if (!value) return "";
  return value.includes("T") ? value.slice(0, 10) : value;
}

export function EntregaEditForm({
  entrega,
  onCancel,
  onSaved,
}: {
  entrega: Entrega;
  onCancel: () => void;
  onSaved?: () => void;
}) {
  const [state, formAction] = useFormState(updateVentaEntregaAction, initialState);

  useEffect(() => {
    if (state.success) {
      onSaved?.();
    }
  }, [onSaved, state.success]);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
      <input type="hidden" name="id" value={entrega.id} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor={`estado-${entrega.id}`}>Estado</FieldLabel>
          <Select id={`estado-${entrega.id}`} name="estado" defaultValue={entrega.estado ?? "pendiente"} required>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En proceso</option>
            <option value="lista_para_entregar">Lista para entregar</option>
            <option value="entregada">Entregada</option>
            <option value="observada">Observada</option>
            <option value="cancelada">Cancelada</option>
          </Select>
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor={`fecha_entrega-${entrega.id}`}>Fecha de entrega</FieldLabel>
          <Input
            id={`fecha_entrega-${entrega.id}`}
            name="fecha_entrega"
            type="date"
            defaultValue={formatDate(entrega.fecha_entrega)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor={`status_informe_vu-${entrega.id}`}>Informe de usado</FieldLabel>
          <Input
            id={`status_informe_vu-${entrega.id}`}
            name="status_informe_vu"
            defaultValue={entrega.status_informe_vu ?? ""}
            placeholder="Pendiente / OK / Observado"
          />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor={`usado_credito-${entrega.id}`}>Crédito</FieldLabel>
          <Input
            id={`usado_credito-${entrega.id}`}
            name="usado_credito"
            defaultValue={entrega.usado_credito ?? ""}
            placeholder="Estado del crédito"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <FieldLabel htmlFor={`usado_informe_dominio-${entrega.id}`}>Informe dominio</FieldLabel>
          <Input
            id={`usado_informe_dominio-${entrega.id}`}
            name="usado_informe_dominio"
            defaultValue={entrega.usado_informe_dominio ?? ""}
            placeholder="Pendiente / OK"
          />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor={`usado_multas-${entrega.id}`}>Multas</FieldLabel>
          <Input
            id={`usado_multas-${entrega.id}`}
            name="usado_multas"
            defaultValue={entrega.usado_multas ?? ""}
            placeholder="Pendiente / OK"
          />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor={`usado_patentes-${entrega.id}`}>Patentes</FieldLabel>
          <Input
            id={`usado_patentes-${entrega.id}`}
            name="usado_patentes"
            defaultValue={entrega.usado_patentes ?? ""}
            placeholder="Pendiente / OK"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor={`usado_observaciones-${entrega.id}`}>Observaciones del usado</FieldLabel>
          <Textarea
            id={`usado_observaciones-${entrega.id}`}
            name="usado_observaciones"
            defaultValue={entrega.usado_observaciones ?? ""}
            placeholder="Comentarios sobre el usado recibido"
          />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor={`observaciones-${entrega.id}`}>Observaciones generales</FieldLabel>
          <Textarea
            id={`observaciones-${entrega.id}`}
            name="observaciones"
            defaultValue={entrega.observaciones ?? ""}
            placeholder="Seguimiento operativo"
          />
        </div>
      </div>

      {state.error ? (
        <div className="rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="rounded-xl border border-[#D1FAE5] bg-[#ECFDF5] px-4 py-3 text-sm text-[#065F46]">
          {state.success}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <SubmitButton />
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
