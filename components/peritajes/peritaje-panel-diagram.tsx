"use client";

import { useState } from "react";
import { CarFront, Check, CircleAlert, Wrench } from "lucide-react";
import { PERITAJE_STATUS_LABELS, type PeritajeItemStatus, type PeritajePanel } from "@/lib/peritajes/types";

const statusClass: Record<PeritajeItemStatus, string> = {
  pendiente: "border-slate-300 bg-white text-slate-600",
  revisar: "border-amber-300 bg-amber-50 text-amber-700",
  reparar: "border-rose-300 bg-rose-50 text-rose-700",
  listo: "border-emerald-300 bg-emerald-50 text-emerald-700",
  no_aplica: "border-slate-200 bg-slate-50 text-slate-400",
};

const nextStatus: Record<PeritajeItemStatus, PeritajeItemStatus> = {
  pendiente: "revisar",
  revisar: "reparar",
  reparar: "listo",
  listo: "pendiente",
  no_aplica: "pendiente",
};

export function PeritajePanelDiagram({ panels, onChange, readOnly = false }: { panels: PeritajePanel[]; onChange: (panels: PeritajePanel[]) => void; readOnly?: boolean }) {
  const [selected, setSelected] = useState<PeritajePanel | null>(null);
  const update = (panel: PeritajePanel, patch: Partial<PeritajePanel>) => onChange(panels.map((item) => item.codigo === panel.codigo ? { ...item, ...patch } : item));
  const current = (code: string) => panels.find((panel) => panel.codigo === code) ?? null;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="rounded-md border border-slate-200 bg-slate-50/70 p-4">
        <div className="mb-4 flex items-center justify-between"><div><h3 className="font-semibold text-slate-900">Mapa de paneles</h3><p className="text-xs text-slate-500">Seleccioná una zona para cargar estado y nota.</p></div><CarFront className="h-5 w-5 text-slate-400" /></div>
        <div className="mx-auto grid max-w-[520px] grid-cols-5 grid-rows-5 gap-2 rounded-[32px] border-2 border-slate-300 bg-white p-4 shadow-sm">
          {[
            ["frente", "Frente", "col-span-5"], ["guardabarros_izq", "Guard. izq.", "col-span-1 row-span-2"], ["capot", "Capot", "col-span-3"], ["guardabarros_der", "Guard. der.", "col-span-1 row-span-2"],
            ["puerta_del_izq", "P. del. izq.", "col-span-1"], ["techo", "Techo", "col-span-3"], ["puerta_del_der", "P. del. der.", "col-span-1"],
            ["puerta_tras_izq", "P. tras. izq.", "col-span-1"], ["parabrisas", "Parabrisas", "col-span-3"], ["puerta_tras_der", "P. tras. der.", "col-span-1"],
            ["lateral_izq", "Lateral izq.", "col-span-2"], ["baul", "Baúl", "col-span-1"], ["lateral_der", "Lateral der.", "col-span-2"],
            ["paragolpes_tras", "Trasero", "col-span-5"],
          ].map(([code, label, className]) => {
            const panel = current(code);
            if (!panel) return null;
            return <button type="button" disabled={readOnly} key={code} onClick={() => setSelected(panel)} className={`${className} min-h-10 rounded-md border px-2 py-2 text-[11px] font-medium transition hover:border-[#8A1538] ${statusClass[panel.estado]}`}>{label}</button>;
          })}
        </div>
      </div>
      <div className="rounded-md border border-slate-200 bg-white p-4">
        <h3 className="font-semibold text-slate-900">Estado por panel</h3>
        <div className="mt-3 space-y-2">
          {panels.map((panel) => <button type="button" key={panel.codigo} disabled={readOnly} onClick={() => setSelected(panel)} className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-xs ${statusClass[panel.estado]}`}><span>{panel.nombre}</span><span>{PERITAJE_STATUS_LABELS[panel.estado]}</span></button>)}
        </div>
      </div>
      {selected ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><div className="w-full max-w-md rounded-md border border-slate-200 bg-white p-5 shadow-xl"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Panel seleccionado</p><h3 className="mt-1 text-lg font-semibold text-slate-900">{selected.nombre}</h3></div><button type="button" onClick={() => setSelected(null)} className="text-sm text-slate-500">Cerrar</button></div><div className="mt-5 grid grid-cols-2 gap-2">{(Object.keys(PERITAJE_STATUS_LABELS) as PeritajeItemStatus[]).map((status) => <button type="button" disabled={readOnly} key={status} onClick={() => { update(selected, { estado: status }); setSelected({ ...selected, estado: status }); }} className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm ${statusClass[status]}`}>{status === "revisar" ? <CircleAlert className="h-4 w-4" /> : status === "reparar" ? <Wrench className="h-4 w-4" /> : status === "listo" ? <Check className="h-4 w-4" /> : null}{PERITAJE_STATUS_LABELS[status]}</button>)}</div><label className="mt-4 block text-sm font-medium text-slate-700">Nota<textarea disabled={readOnly} value={selected.nota ?? ""} onChange={(event) => { update(selected, { nota: event.target.value }); setSelected({ ...selected, nota: event.target.value }); }} className="mt-1 min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm" placeholder="Detalle del estado, daño o reparación sugerida..." /></label><button type="button" onClick={() => setSelected(null)} className="mt-4 h-10 w-full rounded-md bg-[#8A1538] text-sm font-semibold text-white">Guardar panel</button></div></div> : null}
    </div>
  );
}
