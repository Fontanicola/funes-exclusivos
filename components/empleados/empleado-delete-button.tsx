"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { deleteEmpleadoAction } from "@/app/(dashboard)/empleados/actions";

type ActionState = {
  error?: string;
  success?: boolean;
};

const initialState: ActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-9 items-center justify-center rounded-md border border-[#F3D1D9] bg-white px-3 text-sm font-medium text-[#8A1538] transition hover:bg-[#FFF7F8] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Eliminando..." : "Eliminar"}
    </button>
  );
}

export function EmpleadoDeleteButton({ employeeId, employeeName }: { employeeId: string; employeeName: string }) {
  const [state, formAction] = useFormState(deleteEmpleadoAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) router.refresh();
  }, [router, state.success]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form
        action={formAction}
        onSubmit={(event) => {
          if (!window.confirm(`¿Eliminar a ${employeeName} y quitar su acceso al sistema?`)) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={employeeId} />
        <SubmitButton />
      </form>
      {state.error ? <p className="max-w-[240px] text-xs text-[#8A1538]">{state.error}</p> : null}
    </div>
  );
}
