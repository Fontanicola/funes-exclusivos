"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateEmpleadoAction } from "@/app/(dashboard)/empleados/actions";
import { EmpleadoRoleBadge } from "./empleado-role-badge";

type Employee = {
  id: string;
  email: string;
  nombre: string | null;
  telefono: string | null;
  avatar_url: string | null;
  rol: string | null;
  activo: boolean | null;
  cargo: string | null;
  fecha_ingreso: string | null;
  comision_default_porcentaje: number | null;
  notas: string | null;
};

type ActionState = {
  error?: string;
  success?: boolean;
};

const initialState: ActionState = {};

function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-[#111827]">
      {children}
    </label>
  );
}

function SubmitButton({ canSave }: { canSave: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || !canSave}
      className="inline-flex h-10 items-center justify-center rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Guardando..." : "Guardar cambios"}
    </button>
  );
}

export function EmpleadoEditForm({
  employee,
  currentUserId,
  onCancel,
}: {
  employee: Employee;
  currentUserId: string | null;
  onCancel: () => void;
}) {
  const [state, formAction] = useFormState(updateEmpleadoAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const isSelf = currentUserId === employee.id;

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      onCancel();
    }
  }, [onCancel, state.success]);

  return (
    <form ref={formRef} action={formAction} className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
      <input type="hidden" name="id" value={employee.id} />
      {isSelf ? <input type="hidden" name="rol" value={employee.rol ?? "vendedor"} /> : null}
      {isSelf ? <input type="hidden" name="activo" value={String(employee.activo === true)} /> : null}

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[#111827]">Editar empleado</h3>
          <p className="text-sm text-[#6B7280]">
            {employee.email}
          </p>
        </div>
        <EmpleadoRoleBadge role={employee.rol} />
      </div>

      {state.error ? (
        <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827]">
          {state.error}
        </div>
      ) : null}
      {state.success ? (
        <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827]">
          Cambios guardados.
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-1">
          <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
          <input
            id="nombre"
            name="nombre"
            defaultValue={employee.nombre ?? ""}
            className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          />
        </div>
        <div className="space-y-2 md:col-span-1">
          <FieldLabel htmlFor="telefono">Teléfono</FieldLabel>
          <input
            id="telefono"
            name="telefono"
            defaultValue={employee.telefono ?? ""}
            className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="rol">Rol</FieldLabel>
          <select
            id="rol"
            name="rol"
            defaultValue={employee.rol ?? "vendedor"}
            disabled={isSelf}
            className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          >
            <option value="admin">Admin</option>
            <option value="vendedor">Vendedor</option>
            <option value="gestor">Gestor</option>
          </select>
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="activo">Activo</FieldLabel>
          <select
            id="activo"
            name="activo"
            defaultValue={employee.activo === false ? "false" : "true"}
            disabled={isSelf}
            className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6] disabled:cursor-not-allowed disabled:bg-[#F9FAFB]"
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
          {isSelf ? (
            <p className="text-xs text-[#6B7280]">No podés desactivarte ni cambiar tu propio rol desde aquí.</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="cargo">Cargo</FieldLabel>
          <input
            id="cargo"
            name="cargo"
            defaultValue={employee.cargo ?? ""}
            className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="fecha_ingreso">Fecha ingreso</FieldLabel>
          <input
            id="fecha_ingreso"
            name="fecha_ingreso"
            type="date"
            defaultValue={employee.fecha_ingreso ?? ""}
            className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="comision_default_porcentaje">Comisión default %</FieldLabel>
          <input
            id="comision_default_porcentaje"
            name="comision_default_porcentaje"
            type="number"
            min="0"
            step="0.01"
            defaultValue={employee.comision_default_porcentaje ?? 0}
            className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <FieldLabel htmlFor="notas">Notas</FieldLabel>
          <textarea
            id="notas"
            name="notas"
            defaultValue={employee.notas ?? ""}
            rows={4}
            className="min-h-[96px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
        >
          Cancelar
        </button>
        <SubmitButton canSave={true} />
      </div>
    </form>
  );
}
