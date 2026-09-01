"use client";

import { useState } from "react";
import { CalendarDays, ClipboardCheck } from "lucide-react";
import { createPeritajeAction } from "@/app/(dashboard)/peritajes/actions";

export function PeritajeCreateForm({ vehiculoId }: { vehiculoId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await createPeritajeAction(formData);
    setLoading(false);
    if (result.error) setError(result.error);
    if (result.peritajeId) window.location.href = `/inventario/${vehiculoId}/peritaje`;
  }

  return (
    <form action={submit} className="rounded-md border border-slate-200 bg-white p-5">
      <input type="hidden" name="vehiculo_id" value={vehiculoId} />
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-rose-50 p-2 text-[#8A1538]"><ClipboardCheck className="h-5 w-5" /></div>
        <div>
          <h2 className="font-semibold text-slate-900">Iniciar peritaje</h2>
          <p className="mt-1 text-sm text-slate-500">Cargá la revisión del vehículo, el estado de sus paneles y los costos estimados.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <label className="space-y-1.5 text-sm font-medium text-slate-700">Fecha
          <span className="relative block"><CalendarDays className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" /><input required type="date" name="fecha_peritaje" defaultValue={new Date().toISOString().slice(0, 10)} className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm" /></span>
        </label>
        <label className="space-y-1.5 text-sm font-medium text-slate-700">Responsable
          <input name="cliente_nombre" placeholder="Nombre del responsable" className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
        </label>
        <label className="space-y-1.5 text-sm font-medium text-slate-700">Contacto del responsable
          <input name="cliente_telefono" placeholder="Teléfono o contacto" className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
        </label>
      </div>
      {error ? <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      <button disabled={loading} className="mt-5 inline-flex h-10 items-center rounded-md bg-[#8A1538] px-4 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Iniciando..." : "Iniciar peritaje"}</button>
    </form>
  );
}
