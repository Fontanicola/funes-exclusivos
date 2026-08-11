"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createEmpleadoAction } from "@/app/(dashboard)/empleados/actions";

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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center rounded-md bg-[#8A1538] px-4 text-sm font-medium text-white transition hover:bg-[#6F102D] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Creando..." : "Crear usuario"}
    </button>
  );
}

const inputClassName =
  "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]";

export function EmpleadoCreateForm() {
  const [state, formAction] = useFormState(createEmpleadoAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <section className="rounded-md border border-[#E5E7EB] bg-white p-5">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-[#111827]">Nuevo usuario</h2>
        <p className="text-sm text-[#6B7280]">
          Creá el acceso y asigná su rol operativo dentro de Funes Exclusivos.
        </p>
      </div>

      {state.error ? (
        <div className="mt-4 rounded-md border border-[#F3D1D9] bg-[#FFF7F8] px-4 py-3 text-sm text-[#8A1538]">
          {state.error}
        </div>
      ) : null}
      {state.success ? (
        <div className="mt-4 rounded-md border border-[#D1FAE5] bg-[#F0FDF4] px-4 py-3 text-sm text-[#166534]">
          Usuario creado correctamente.
        </div>
      ) : null}

      <form ref={formRef} action={formAction} className="mt-5 space-y-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2 xl:col-span-2">
            <FieldLabel htmlFor="create-email">Email</FieldLabel>
            <input id="create-email" name="email" type="email" required placeholder="nombre@funesexclusivos.com" className={inputClassName} />
          </div>
          <div className="space-y-2 xl:col-span-2">
            <FieldLabel htmlFor="create-password">Contraseña inicial</FieldLabel>
            <input id="create-password" name="password" type="password" required minLength={8} placeholder="Mínimo 8 caracteres" className={inputClassName} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="create-nombre">Nombre completo</FieldLabel>
            <input id="create-nombre" name="nombre" required placeholder="Nombre y apellido" className={inputClassName} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="create-telefono">Teléfono</FieldLabel>
            <input id="create-telefono" name="telefono" type="tel" placeholder="Opcional" className={inputClassName} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="create-rol">Rol</FieldLabel>
            <select id="create-rol" name="rol" defaultValue="vendedor" className={inputClassName}>
              <option value="admin">Admin</option>
              <option value="vendedor">Vendedor</option>
              <option value="gestor">Gestor</option>
            </select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="create-cargo">Cargo</FieldLabel>
            <input id="create-cargo" name="cargo" placeholder="Opcional" className={inputClassName} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="create-fecha">Fecha de ingreso</FieldLabel>
            <input id="create-fecha" name="fecha_ingreso" type="date" className={inputClassName} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="create-comision">Comisión default (%)</FieldLabel>
            <input id="create-comision" name="comision_default_porcentaje" type="number" min="0" step="0.01" defaultValue="1" className={inputClassName} />
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="create-notas">Notas internas</FieldLabel>
          <textarea id="create-notas" name="notas" rows={2} placeholder="Opcional" className="min-h-[72px] w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]" />
        </div>

        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </section>
  );
}
