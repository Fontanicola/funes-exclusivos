"use client";

import { useEffect, useMemo, useState } from "react";
import { CarFront, Check, CircleAlert, Wrench, X } from "lucide-react";
import { PERITAJE_STATUS_LABELS, type PeritajeItemStatus, type PeritajePanel } from "@/lib/peritajes/types";

const statusClass: Record<PeritajeItemStatus, string> = {
  pendiente: "border-slate-300 bg-white text-slate-600",
  revisar: "border-amber-300 bg-amber-50 text-amber-700",
  reparar: "border-rose-300 bg-rose-50 text-rose-700",
  listo: "border-emerald-300 bg-emerald-50 text-emerald-700",
  no_aplica: "border-slate-200 bg-slate-50 text-slate-400",
};

const statusDot: Record<PeritajeItemStatus, string> = {
  pendiente: "bg-slate-300",
  revisar: "bg-amber-500",
  reparar: "bg-rose-500",
  listo: "bg-emerald-500",
  no_aplica: "bg-slate-200",
};

export function PeritajePanelDiagram({ panels, onChange, readOnly = false }: { panels: PeritajePanel[]; onChange: (panels: PeritajePanel[]) => void; readOnly?: boolean }) {
  const [selected, setSelected] = useState<PeritajePanel | null>(null);
  const update = (panel: PeritajePanel, patch: Partial<PeritajePanel>) => onChange(panels.map((item) => item.codigo === panel.codigo ? { ...item, ...patch } : item));
  const current = (code: string) => panels.find((panel) => panel.codigo === code) ?? null;
  const counts = useMemo(() => ({
    pendiente: panels.filter((panel) => panel.estado === "pendiente").length,
    revisar: panels.filter((panel) => panel.estado === "revisar").length,
    reparar: panels.filter((panel) => panel.estado === "reparar").length,
    listo: panels.filter((panel) => panel.estado === "listo").length,
  }), [panels]);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  const mapPanels: Array<[string, string, string]> = [
    ["frente", "Frente", "col-span-5"],
    ["guardabarros_izq", "Guard. izq.", "col-span-1 row-span-2"],
    ["capot", "Capot", "col-span-3"],
    ["guardabarros_der", "Guard. der.", "col-span-1 row-span-2"],
    ["puerta_del_izq", "P. del. izq.", "col-span-1"],
    ["techo", "Techo", "col-span-3"],
    ["puerta_del_der", "P. del. der.", "col-span-1"],
    ["puerta_tras_izq", "P. tras. izq.", "col-span-1"],
    ["parabrisas", "Parabrisas", "col-span-3"],
    ["puerta_tras_der", "P. tras. der.", "col-span-1"],
    ["lateral_izq", "Lateral izq.", "col-span-2"],
    ["baul", "Baúl", "col-span-1"],
    ["lateral_der", "Lateral der.", "col-span-2"],
    ["paragolpes_tras", "Trasero", "col-span-5"],
  ];

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900">Estado de carrocería</h3><p className="mt-0.5 text-xs text-slate-500">Seleccioná un panel para definir su estado y agregar una nota.</p></div><CarFront className="h-5 w-5 text-slate-400" /></div>
        <div className="mt-3 grid grid-cols-4 gap-2">{([['pendiente', 'Pendientes'], ['revisar', 'Revisar'], ['reparar', 'Reparar'], ['listo', 'Listos']] as const).map(([status, label]) => <div key={status} className="rounded-md bg-slate-50 px-2 py-2"><p className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className={`h-2 w-2 rounded-full ${statusDot[status]}`} />{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{counts[status]}</p></div>)}</div>
      </div>

      <div className="grid lg:grid-cols-[minmax(360px,0.92fr)_minmax(0,1.08fr)]">
        <div className="border-b border-slate-200 bg-slate-50/60 p-5 lg:border-b-0 lg:border-r">
          <div className="mx-auto grid max-w-[400px] grid-cols-5 grid-rows-5 gap-2 rounded-[30px] border-2 border-slate-300 bg-white p-4 shadow-sm">
            {mapPanels.map(([code, label, className]) => {
              const panel = current(code);
              if (!panel) return null;
              return <button key={code} type="button" disabled={readOnly} onClick={() => setSelected(panel)} className={`${className} min-h-12 rounded-md border px-2 py-2 text-[11px] font-medium transition hover:border-[#8A1538] ${statusClass[panel.estado]}`}>{label}</button>;
            })}
          </div>
          <p className="mx-auto mt-3 max-w-[400px] text-center text-xs text-slate-400">Los colores indican el estado de cada panel.</p>
        </div>
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold text-slate-900">Paneles de la unidad</p><span className="text-xs text-slate-400">{panels.length} zonas</span></div>
          <div className="max-h-[470px] space-y-2 overflow-y-auto pr-1">{panels.map((panel) => <button type="button" key={panel.codigo} disabled={readOnly} onClick={() => setSelected(panel)} className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-md border px-3 text-left text-sm transition hover:border-[#8A1538] ${statusClass[panel.estado]}`}><span className="flex min-w-0 items-center gap-2"><span className={`h-2 w-2 shrink-0 rounded-full ${statusDot[panel.estado]}`} /><span className="truncate">{panel.nombre}</span></span><span className="shrink-0 text-xs">{PERITAJE_STATUS_LABELS[panel.estado]}</span></button>)}</div>
        </div>
      </div>

      {selected ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4" role="dialog" aria-modal="true" aria-label={`Editar ${selected.nombre}`} onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><div className="w-full max-w-md rounded-md border border-slate-200 bg-white p-5 shadow-xl"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Panel seleccionado</p><h3 className="mt-1 text-lg font-semibold text-slate-900">{selected.nombre}</h3></div><button type="button" onClick={() => setSelected(null)} aria-label="Cerrar" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button></div><div className="mt-5 grid grid-cols-2 gap-2">{(Object.keys(PERITAJE_STATUS_LABELS) as PeritajeItemStatus[]).map((status) => <button type="button" disabled={readOnly} key={status} onClick={() => { update(selected, { estado: status }); setSelected({ ...selected, estado: status }); }} className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm ${statusClass[status]}`}>{status === "revisar" ? <CircleAlert className="h-4 w-4" /> : status === "reparar" ? <Wrench className="h-4 w-4" /> : status === "listo" ? <Check className="h-4 w-4" /> : null}{PERITAJE_STATUS_LABELS[status]}</button>)}</div><label className="mt-4 block text-sm font-medium text-slate-700">Nota<textarea disabled={readOnly} value={selected.nota ?? ""} onChange={(event) => { update(selected, { nota: event.target.value }); setSelected({ ...selected, nota: event.target.value }); }} className="mt-1 min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm" placeholder="Detalle del estado, daño o reparación sugerida..." /></label><button type="button" onClick={() => setSelected(null)} className="mt-4 h-10 w-full rounded-md bg-[#8A1538] text-sm font-semibold text-white">Guardar panel</button></div></div> : null}
    </div>
  );
}
