"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, ClipboardCheck, Plus, Save } from "lucide-react";
import { savePeritajeAction } from "@/app/(dashboard)/peritajes/actions";
import { PeritajePanelDiagram } from "@/components/peritajes/peritaje-panel-diagram";
import { PeritajeStatusBadge } from "@/components/peritajes/peritaje-status-badge";
import {
  PERITAJE_STATUS_LABELS,
  type PeritajeItem,
  type PeritajeItemStatus,
  type PeritajeRecord,
  type PeritajeRepair,
  type PeritajeTemplateSection,
  type PeritajeVehicle,
} from "@/lib/peritajes/types";

const stateOptions = Object.keys(PERITAJE_STATUS_LABELS) as PeritajeItemStatus[];

function fieldValue(item: PeritajeItem) {
  const value = item.valor?.value;
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function isIdentityItem(item: PeritajeItem) {
  const name = item.nombre.trim().toLowerCase();
  return name === "cliente" || name === "teléfono" || name === "telefono";
}

function sectionProgress(items: PeritajeItem[]) {
  const completed = items.filter((item) => item.estado === "listo" || item.estado === "no_aplica" || Boolean(item.valor?.value)).length;
  return `${completed}/${items.length}`;
}

export function PeritajeWorkspace({
  vehicle,
  peritaje,
  sections,
  readOnly = false,
  demo = false,
}: {
  vehicle: PeritajeVehicle;
  peritaje: PeritajeRecord;
  sections: PeritajeTemplateSection[];
  readOnly?: boolean;
  demo?: boolean;
}) {
  const [state, setState] = useState(peritaje.estado);
  const [date, setDate] = useState(peritaje.fecha_peritaje);
  const [clientName, setClientName] = useState(peritaje.cliente_nombre ?? "");
  const [clientPhone, setClientPhone] = useState(peritaje.cliente_telefono ?? "");
  const [general, setGeneral] = useState(peritaje.datos_generales ?? {});
  const [equipment, setEquipment] = useState(peritaje.equipamiento ?? {});
  const [observations, setObservations] = useState(peritaje.observaciones ?? "");
  const [items, setItems] = useState(peritaje.items ?? []);
  const [panels, setPanels] = useState(peritaje.paneles ?? []);
  const [repairs, setRepairs] = useState(peritaje.reparaciones ?? []);
  const [gastoTotal, setGastoTotal] = useState(peritaje.gasto_total ?? 0);
  const [currency, setCurrency] = useState<"ARS" | "USD">(peritaje.moneda ?? "ARS");
  const [values, setValues] = useState({
    mercado: peritaje.valor_mercado ?? null,
    sitio1: peritaje.valor_sitio_1 ?? null,
    sitio2: peritaje.valor_sitio_2 ?? null,
    tasado: peritaje.valor_tasado ?? null,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const groupedSections = useMemo(
    () => sections.map((section) => ({
      ...section,
      items: items.filter((item) => item.seccion === section.nombre).sort((a, b) => a.orden - b.orden),
    })),
    [sections, items],
  );

  const panelSummary = useMemo(() => ({
    revisar: panels.filter((panel) => panel.estado === "revisar").length,
    reparar: panels.filter((panel) => panel.estado === "reparar").length,
    listo: panels.filter((panel) => panel.estado === "listo").length,
    pendiente: panels.filter((panel) => panel.estado === "pendiente").length,
  }), [panels]);

  function updateItem(code: string, patch: Partial<PeritajeItem>) {
    setItems((current) => current.map((item) => item.codigo === code ? { ...item, ...patch } : item));
  }

  function addRepair() {
    setRepairs((current) => [...current, { orden: current.length, descripcion: "", monto: 0, moneda: currency, estado: "pendiente" }]);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    if (demo) {
      setSaving(false);
      setMessage("Modo demo: los cambios se mantienen mientras navegás esta pantalla.");
      return;
    }
    const result = await savePeritajeAction({
      id: peritaje.id,
      vehiculoId: vehicle.id,
      estado: state,
      fechaPeritaje: date,
      clienteNombre: clientName,
      clienteTelefono: clientPhone,
      datosGenerales: general,
      equipamiento: equipment,
      observaciones: observations,
      gastoTotal: Number(gastoTotal) || 0,
      moneda: currency,
      valorMercado: values.mercado,
      valorSitio1: values.sitio1,
      valorSitio2: values.sitio2,
      valorTasado: values.tasado,
      items,
      paneles: panels,
      reparaciones: repairs.filter((repair) => repair.descripcion.trim()),
    });
    setSaving(false);
    if (result.error) setError(result.error);
    else setMessage(result.success ?? "Guardado.");
  }

  function renderItem(item: PeritajeItem) {
    if (item.tipo === "check" || item.tipo === "boolean") {
      const checked = Boolean(item.valor?.value);
      return (
        <button
          key={item.codigo}
          type="button"
          disabled={readOnly}
          onClick={() => updateItem(item.codigo, { valor: { value: !checked } })}
          className={`flex min-h-11 items-center justify-between rounded-md border px-3 text-sm transition ${checked ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
        >
          <span>{item.nombre}</span>
          <span className={`flex h-5 w-5 items-center justify-center rounded border ${checked ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300"}`}>
            {checked ? <Check className="h-3.5 w-3.5" /> : null}
          </span>
        </button>
      );
    }

    if (item.tipo === "estado") {
      return (
        <div key={item.codigo} className="rounded-md border border-slate-200 bg-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-slate-700">{item.nombre}</span>
            <select
              disabled={readOnly}
              value={item.estado}
              onChange={(event) => updateItem(item.codigo, { estado: event.target.value as PeritajeItemStatus })}
              className="h-8 min-w-28 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"
            >
              {stateOptions.map((option) => <option key={option} value={option}>{PERITAJE_STATUS_LABELS[option]}</option>)}
            </select>
          </div>
          <input
            disabled={readOnly}
            value={item.nota ?? ""}
            onChange={(event) => updateItem(item.codigo, { nota: event.target.value })}
            placeholder="Nota opcional"
            className="mt-2 h-8 w-full rounded-md border border-slate-200 px-2 text-xs text-slate-700 placeholder:text-slate-400"
          />
        </div>
      );
    }

    return (
      <label key={item.codigo} className="block rounded-md border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700">
        {item.nombre}
        <input
          disabled={readOnly}
          value={fieldValue(item)}
          onChange={(event) => updateItem(item.codigo, { valor: { value: event.target.value } })}
          className="mt-2 h-9 w-full rounded-md border border-slate-200 px-3 text-sm font-normal text-slate-900"
        />
      </label>
    );
  }

  const generalItems = groupedSections.find((section) => section.nombre === "Datos generales")?.items.filter((item) => !isIdentityItem(item)) ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="rounded-md bg-rose-50 p-2 text-[#8A1538]"><ClipboardCheck className="h-5 w-5" /></div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Inspección de unidad</p>
              <h2 className="mt-1 truncate text-lg font-semibold text-slate-900">{[vehicle.marca, vehicle.modelo, vehicle.version].filter(Boolean).join(" ") || "Vehículo"}</h2>
              <p className="mt-0.5 text-sm text-slate-500">{[vehicle.dominio, vehicle.anio, vehicle.color, vehicle.km ? `${vehicle.km.toLocaleString("es-AR")} km` : null].filter(Boolean).join(" · ") || "Sin datos adicionales"}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <CalendarDays className="h-4 w-4" />
              <input disabled={readOnly} type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700" />
            </label>
            <select disabled={readOnly} value={state} onChange={(event) => setState(event.target.value as typeof state)} className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700">
              <option value="borrador">Borrador</option>
              <option value="en_proceso">En proceso</option>
              <option value="completado">Completado</option>
              <option value="anulado">Anulado</option>
            </select>
            <PeritajeStatusBadge status={state} />
            {!readOnly ? <button type="button" onClick={save} disabled={saving} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#8A1538] px-3 text-sm font-semibold text-white transition hover:bg-[#74122f] disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Guardando..." : "Guardar"}</button> : null}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-4">
          {[
            ["Pendientes", panelSummary.pendiente, "text-slate-500"],
            ["Revisar", panelSummary.revisar, "text-amber-700"],
            ["Reparar", panelSummary.reparar, "text-rose-700"],
            ["Listos", panelSummary.listo, "text-emerald-700"],
          ].map(([label, count, color]) => (
            <div key={label} className="rounded-md bg-slate-50 px-3 py-2">
              <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${color}`}>{label}</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {message ? <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(440px,0.78fr)]">
        <section className="space-y-4">
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <div className="mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900">Datos de la inspección</h3>
              <p className="mt-0.5 text-xs text-slate-500">Cliente e información general de la unidad.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-medium text-slate-600">Cliente<input disabled={readOnly} value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Nombre y apellido" className="mt-1 h-9 w-full rounded-md border border-slate-200 px-3 text-sm font-normal text-slate-900" /></label>
              <label className="block text-xs font-medium text-slate-600">Teléfono<input disabled={readOnly} value={clientPhone} onChange={(event) => setClientPhone(event.target.value)} placeholder="Número de contacto" className="mt-1 h-9 w-full rounded-md border border-slate-200 px-3 text-sm font-normal text-slate-900" /></label>
              {generalItems.map(renderItem)}
            </div>
          </div>

          {groupedSections.filter((section) => section.nombre !== "Datos generales").map((section, index) => (
            <details key={section.id} open={index === 0} className="group rounded-md border border-slate-200 bg-white">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-900">{section.nombre}</span>
                  {section.descripcion ? <span className="mt-0.5 block text-xs text-slate-500">{section.descripcion}</span> : null}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full border border-slate-200 px-2 py-1 text-xs font-medium text-slate-500">{sectionProgress(section.items)}</span>
                  <span className="text-lg leading-none text-slate-400 transition group-open:rotate-180">⌄</span>
                </span>
              </summary>
              <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                {section.items.length > 0 ? <div className="grid gap-2 md:grid-cols-2">{section.items.map(renderItem)}</div> : <p className="py-3 text-sm text-slate-500">No hay elementos configurados en esta sección.</p>}
              </div>
            </details>
          ))}

          <div className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold text-slate-900">Reparaciones y gastos</h3><p className="mt-0.5 text-xs text-slate-500">Registrá trabajos sugeridos y su costo estimado.</p></div><button type="button" disabled={readOnly} onClick={addRepair} className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-medium text-slate-700 hover:bg-slate-50"><Plus className="h-3.5 w-3.5" />Agregar</button></div>
            <div className="mt-3 space-y-2">{repairs.map((repair, index) => <div key={`${repair.id ?? "new"}-${index}`} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px_100px]"><input disabled={readOnly} value={repair.descripcion} onChange={(event) => setRepairs((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, descripcion: event.target.value } : item))} placeholder="Trabajo o reparación" className="h-9 rounded-md border border-slate-200 px-3 text-sm" /><input disabled={readOnly} type="number" min="0" value={repair.monto} onChange={(event) => setRepairs((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, monto: Number(event.target.value) } : item))} className="h-9 rounded-md border border-slate-200 px-3 text-sm" /><select disabled={readOnly} value={repair.estado} onChange={(event) => setRepairs((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, estado: event.target.value as PeritajeRepair["estado"] } : item))} className="h-9 rounded-md border border-slate-200 px-2 text-xs"><option value="pendiente">Pendiente</option><option value="realizado">Realizado</option><option value="no_aplica">No aplica</option></select></div>)}</div>
            <div className="mt-3 flex flex-wrap items-end gap-3"><label className="text-xs font-medium text-slate-600">Total<input disabled={readOnly} type="number" min="0" value={gastoTotal} onChange={(event) => setGastoTotal(Number(event.target.value))} className="mt-1 h-9 w-32 rounded-md border border-slate-200 px-3 text-sm" /></label><label className="text-xs font-medium text-slate-600">Moneda<select disabled={readOnly} value={currency} onChange={(event) => setCurrency(event.target.value as typeof currency)} className="mt-1 h-9 rounded-md border border-slate-200 px-2 text-sm"><option>ARS</option><option>USD</option></select></label></div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-4"><h3 className="font-semibold text-slate-900">Observaciones generales</h3><textarea disabled={readOnly} value={observations} onChange={(event) => setObservations(event.target.value)} className="mt-3 min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm" placeholder="Anotá observaciones generales de la unidad..." /></div>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-5">
          <PeritajePanelDiagram panels={panels} onChange={setPanels} readOnly={readOnly} />
          <div className="rounded-md border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><div><h3 className="font-semibold text-slate-900">Valores de referencia</h3><p className="mt-0.5 text-xs text-slate-500">Compará mercado, publicaciones y tasación.</p></div><span className="text-xs text-slate-400">{currency}</span></div><div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">{([['mercado', 'Valor de mercado'], ['sitio1', 'Valor de referencia 1'], ['sitio2', 'Valor de referencia 2'], ['tasado', 'Valor tasado']] as const).map(([key, label]) => <label key={key} className="block text-xs font-medium text-slate-500">{label}<input disabled={readOnly} type="number" min="0" value={values[key] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value === "" ? null : Number(event.target.value) }))} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-900" /></label>)}</div></div>
        </aside>
      </div>
    </div>
  );
}
