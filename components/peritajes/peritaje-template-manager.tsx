"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  createPeritajeTemplateItemAction,
  createPeritajeTemplateSectionAction,
  deletePeritajeTemplateItemAction,
} from "@/app/(dashboard)/peritajes/actions";
import type { PeritajeTemplate } from "@/lib/peritajes/types";

export function PeritajeTemplateManager({ templates }: { templates: PeritajeTemplate[] }) {
  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <section key={template.id} className="rounded-md border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{template.nombre}</h2>
              {template.descripcion ? <p className="mt-1 text-sm text-slate-500">{template.descripcion}</p> : null}
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Activa</span>
          </div>

          <div className="mt-4 space-y-3">
            {template.secciones.map((section) => (
              <div key={section.id} className="rounded-md border border-slate-200 bg-slate-50/60 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{section.nombre}</h3>
                    {section.descripcion ? <p className="mt-1 text-xs text-slate-500">{section.descripcion}</p> : null}
                  </div>
                  <span className="text-xs text-slate-400">{section.items.length} ítems</span>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {section.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                      <span className="min-w-0 truncate text-slate-700">{item.nombre}</span>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-[11px] text-slate-400">{item.tipo}</span>
                        <form action={async (formData) => { await deletePeritajeTemplateItemAction(formData); }}>
                          <input type="hidden" name="id" value={item.id} />
                          <button type="submit" title="Quitar ítem" className="rounded p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-700"><Trash2 className="h-3.5 w-3.5" /></button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
                <form action={async (formData) => { await createPeritajeTemplateItemAction(formData); }} className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_170px_140px_auto]">
                  <input type="hidden" name="seccion_id" value={section.id} />
                  <input name="nombre" required placeholder="Nuevo ítem" className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm" />
                  <input name="codigo" required placeholder="Código único" className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm" />
                  <select name="tipo" defaultValue="estado" className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"><option value="estado">Estado</option><option value="check">Checklist</option><option value="texto">Texto</option><option value="numero">Número</option><option value="boolean">Sí / No</option><option value="fecha">Fecha</option></select>
                  <button type="submit" className="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"><Plus className="h-4 w-4" />Agregar</button>
                </form>
              </div>
            ))}
          </div>

          <form action={async (formData) => { await createPeritajeTemplateSectionAction(formData); }} className="mt-4 grid gap-2 border-t border-slate-200 pt-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto]">
            <input type="hidden" name="plantilla_id" value={template.id} />
            <input name="nombre" required placeholder="Nueva sección" className="h-9 rounded-md border border-slate-200 px-3 text-sm" />
            <input name="descripcion" placeholder="Descripción breve (opcional)" className="h-9 rounded-md border border-slate-200 px-3 text-sm" />
            <button type="submit" className="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"><Plus className="h-4 w-4" />Sección</button>
          </form>
        </section>
      ))}
      {!templates.length ? <div className="rounded-md border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">No hay plantillas activas. Ejecutá la estructura SQL para cargar la plantilla base.</div> : null}
    </div>
  );
}
