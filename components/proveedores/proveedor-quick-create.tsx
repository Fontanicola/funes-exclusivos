"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createProveedorAction } from "@/app/(dashboard)/proveedores/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="inline-flex h-10 items-center justify-center rounded-md bg-[#8A1538] px-4 text-sm font-medium text-white hover:bg-[#6F102D] disabled:opacity-60">{pending ? "Guardando..." : "Crear proveedor"}</button>;
}

export function ProveedorQuickCreate() {
  const [state, formAction] = useFormState(createProveedorAction, {});
  const router = useRouter();

  useEffect(() => {
    if (state.success) router.refresh();
  }, [router, state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-[#111827]">Nombre *<input name="nombre" required className="mt-1 h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-sm outline-none focus:border-[#8A1538]" placeholder="Proveedor o empresa" /></label>
        <label className="space-y-1 text-sm font-medium text-[#111827]">Categoría<input name="categoria" className="mt-1 h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-sm outline-none focus:border-[#8A1538]" placeholder="Servicios, repuestos..." /></label>
        <label className="space-y-1 text-sm font-medium text-[#111827] sm:col-span-2">Teléfono<input name="telefono" className="mt-1 h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-sm outline-none focus:border-[#8A1538]" /></label>
      </div>
      {state.error ? <p className="rounded-md bg-[#FFF7F8] px-3 py-2 text-sm text-[#8A1538]">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">Proveedor creado. Actualizá el selector para verlo.</p> : null}
      <div className="flex justify-end"><SubmitButton /></div>
    </form>
  );
}
