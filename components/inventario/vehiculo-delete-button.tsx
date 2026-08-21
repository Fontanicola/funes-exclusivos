"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { deleteVehiculoAction } from "@/app/(dashboard)/inventario/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="flex w-full items-center rounded px-3 py-2 text-sm font-medium text-[#8A1538] hover:bg-[#FFF7F8] disabled:opacity-60">{pending ? "Eliminando..." : "Eliminar"}</button>;
}

export function VehiculoDeleteButton({ vehicleId, vehicleName }: { vehicleId: string; vehicleName: string }) {
  const [state, formAction] = useFormState(deleteVehiculoAction, {});
  const router = useRouter();

  useEffect(() => {
    if (state.success) router.refresh();
  }, [router, state.success]);

  return (
    <>
      <form action={formAction} onSubmit={(event) => {
        if (!window.confirm(`¿Eliminar ${vehicleName}? Esta acción no se puede deshacer.`)) event.preventDefault();
      }}>
        <input type="hidden" name="id" value={vehicleId} />
        <SubmitButton />
      </form>
      {state.error ? <p className="max-w-[220px] px-3 py-1 text-xs text-[#8A1538]">{state.error}</p> : null}
    </>
  );
}
