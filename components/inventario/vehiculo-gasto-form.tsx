"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createVehiculoGastoAction } from "@/app/(dashboard)/inventario/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="h-10 rounded-md bg-[#8A1538] px-4 text-sm font-medium text-white disabled:opacity-60">{pending ? "Guardando..." : "Guardar gasto"}</button>;
}

export function VehiculoGastoForm({ vehiculoId }: { vehiculoId: string }) {
  const [state, action] = useFormState(createVehiculoGastoAction, {});
  return <form action={action} className="space-y-4">
    <input type="hidden" name="vehiculo_id" value={vehiculoId} />
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-2 text-sm font-medium text-[#111827]">Tipo<select name="tipo" defaultValue="preparacion" className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm font-normal"><option value="preparacion">Preparación</option><option value="gestoria">Gestoría</option><option value="reparacion">Reparación</option><option value="otro">Otro</option></select></label>
      <label className="space-y-2 text-sm font-medium text-[#111827]">Fecha<input name="fecha" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-sm font-normal" /></label>
      <label className="space-y-2 text-sm font-medium text-[#111827]">Monto<input name="monto" type="number" min="0" step="0.01" required className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-sm font-normal" /></label>
      <label className="space-y-2 text-sm font-medium text-[#111827]">Moneda<select name="moneda" defaultValue="ARS" className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm font-normal"><option>ARS</option><option>USD</option></select></label>
    </div>
    <label className="block space-y-2 text-sm font-medium text-[#111827]">Detalle<textarea name="detalle" className="min-h-20 w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-sm font-normal" placeholder="Ej.: cambio de aceite y filtros" /></label>
    {state.error ? <p className="text-sm text-[#8A1538]">{state.error}</p> : null}
    <div className="flex justify-end"><SubmitButton /></div>
  </form>;
}
