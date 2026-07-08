"use client";

import { useMemo, useState } from "react";
import { Search, X, Check, CalendarClock, Ban } from "lucide-react";
import {
  cancelRecordatorioAction,
  completeRecordatorioAction,
  postponeRecordatorioAction,
} from "@/app/(dashboard)/recordatorios/actions";
import { RecordatorioStatusBadge } from "./recordatorio-status-badge";
import { RecordatorioPriorityBadge } from "./recordatorio-priority-badge";
import { RecordatorioTypeBadge } from "./recordatorio-type-badge";

type Employee = {
  id: string;
  nombre: string | null;
  email: string | null;
  rol: string | null;
};

type Recordatorio = {
  id: string;
  tipo: string | null;
  estado: string | null;
  prioridad: string | null;
  titulo: string | null;
  descripcion: string | null;
  fecha_vencimiento: string | null;
  fecha_completado: string | null;
  fecha_pospuesto: string | null;
  asignado_a: string | null;
  lead_id: string | null;
  conversacion_id: string | null;
  venta_id: string | null;
  entrega_id: string | null;
  tramite_id: string | null;
  vehiculo_id: string | null;
  comision_liquidacion_id: string | null;
  origen_automatico: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  asignado: {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
  } | null;
  lead: {
    id: string;
    nombre: string | null;
    telefono: string | null;
    estado: string | null;
  } | null;
  conversacion: {
    id: string;
    contacto_nombre: string | null;
    contacto_telefono: string | null;
    ultimo_mensaje_at: string | null;
  } | null;
  venta: {
    id: string;
    cliente_nombre: string | null;
    fecha_venta: string | null;
  } | null;
  entrega: {
    id: string;
    estado: string | null;
    fecha_entrega: string | null;
  } | null;
  tramite: {
    id: string;
    titulo: string | null;
    tipo: string | null;
    estado: string | null;
    fecha_vencimiento: string | null;
  } | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    dominio: string | null;
  } | null;
};

const statusOptions = ["", "pendiente", "pospuesto", "completado", "cancelado"] as const;
const priorityOptions = ["", "baja", "media", "alta", "critica"] as const;
const dueFilters = ["all", "today", "overdue", "soon"] as const;

function normalizeDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatDate(value: string | null) {
  const date = normalizeDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-AR").format(date);
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function getDateOffset(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function isOverdue(recordatorio: Recordatorio) {
  const due = normalizeDate(recordatorio.fecha_vencimiento);
  if (!due) return false;
  const state = (recordatorio.estado ?? "").toLowerCase();
  return due.getTime() < startOfToday().getTime() && !["completado", "cancelado"].includes(state);
}

function isDueToday(recordatorio: Recordatorio) {
  const due = normalizeDate(recordatorio.fecha_vencimiento);
  if (!due) return false;
  const today = startOfToday();
  return due.getTime() === today.getTime() && !["completado", "cancelado"].includes((recordatorio.estado ?? "").toLowerCase());
}

function isDueSoon(recordatorio: Recordatorio) {
  const due = normalizeDate(recordatorio.fecha_vencimiento);
  if (!due) return false;
  const today = startOfToday();
  const inSeven = new Date(today);
  inSeven.setDate(inSeven.getDate() + 7);
  const state = (recordatorio.estado ?? "").toLowerCase();
  return due.getTime() > today.getTime() && due.getTime() <= inSeven.getTime() && !["completado", "cancelado"].includes(state);
}

function isFinal(recordatorio: Recordatorio) {
  const state = (recordatorio.estado ?? "").toLowerCase();
  return ["completado", "cancelado"].includes(state);
}

function getAssigneeLabel(recordatorio: Recordatorio) {
  return recordatorio.asignado?.nombre ?? recordatorio.asignado?.email ?? "—";
}

function getLinkLabel(recordatorio: Recordatorio) {
  if (recordatorio.lead) {
    return {
      title: recordatorio.lead.nombre ?? "Lead",
      subtitle: recordatorio.lead.telefono ?? recordatorio.lead.estado ?? "Lead",
    };
  }

  if (recordatorio.conversacion) {
    return {
      title: recordatorio.conversacion.contacto_nombre ?? "WhatsApp",
      subtitle: recordatorio.conversacion.contacto_telefono ?? "Conversación",
    };
  }

  if (recordatorio.tramite) {
    return {
      title: recordatorio.tramite.titulo ?? "Gestoría",
      subtitle: [recordatorio.tramite.tipo, recordatorio.tramite.estado].filter(Boolean).join(" · ") || "Trámite",
    };
  }

  if (recordatorio.vehiculo) {
    return {
      title: `${recordatorio.vehiculo.marca ?? "-"} ${recordatorio.vehiculo.modelo ?? ""}`.trim(),
      subtitle: recordatorio.vehiculo.dominio ?? "Vehículo",
    };
  }

  if (recordatorio.venta) {
    return {
      title: recordatorio.venta.cliente_nombre ?? "Venta",
      subtitle: formatDate(recordatorio.venta.fecha_venta),
    };
  }

  if (recordatorio.entrega) {
    return {
      title: "Entrega",
      subtitle: recordatorio.entrega.estado ?? "Pendiente",
    };
  }

  return {
    title: "Manual",
    subtitle: "Sin vínculo",
  };
}

function getSearchableText(recordatorio: Recordatorio) {
  return [
    recordatorio.titulo,
    recordatorio.descripcion,
    recordatorio.asignado?.nombre,
    recordatorio.asignado?.email,
    recordatorio.lead?.nombre,
    recordatorio.lead?.telefono,
    recordatorio.conversacion?.contacto_nombre,
    recordatorio.conversacion?.contacto_telefono,
    recordatorio.venta?.cliente_nombre,
    recordatorio.tramite?.titulo,
    recordatorio.vehiculo?.marca,
    recordatorio.vehiculo?.modelo,
    recordatorio.vehiculo?.dominio,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getStatusFilterLabel(value: (typeof statusOptions)[number]) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "Todos";
}

function getPriorityFilterLabel(value: (typeof priorityOptions)[number]) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "Todas";
}

async function completeAction(formData: FormData) {
  await completeRecordatorioAction({}, formData);
}

async function cancelAction(formData: FormData) {
  await cancelRecordatorioAction({}, formData);
}

async function postponeAction(formData: FormData) {
  await postponeRecordatorioAction({}, formData);
}

export function RecordatoriosTable({
  recordatorios,
  employees,
}: {
  recordatorios: Recordatorio[];
  employees: Employee[];
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("");
  const [priorityFilter, setPriorityFilter] = useState<(typeof priorityOptions)[number]>("");
  const [typeFilter, setTypeFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [dueFilter, setDueFilter] = useState<(typeof dueFilters)[number]>("all");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return recordatorios.filter((recordatorio) => {
      if (statusFilter && recordatorio.estado !== statusFilter) return false;
      if (priorityFilter && recordatorio.prioridad !== priorityFilter) return false;
      if (typeFilter && recordatorio.tipo !== typeFilter) return false;
      if (assigneeFilter && recordatorio.asignado_a !== assigneeFilter) return false;

      if (dueFilter === "today" && !isDueToday(recordatorio)) return false;
      if (dueFilter === "overdue" && !isOverdue(recordatorio)) return false;
      if (dueFilter === "soon" && !isDueSoon(recordatorio)) return false;

      if (!normalizedQuery) return true;

      return getSearchableText(recordatorio).includes(normalizedQuery);
    });
  }, [assigneeFilter, dueFilter, priorityFilter, query, recordatorios, statusFilter, typeFilter]);

  return (
    <section className="rounded-[28px] border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-[#E5E7EB] p-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-[#111827]">Listado de recordatorios</h2>
          <p className="max-w-2xl text-sm leading-6 text-[#6B7280]">
            Buscá por título, descripción, persona o entidad vinculada. Los vencidos y los de hoy aparecen primero en la tabla general.
          </p>
        </div>

        <div className="grid gap-2 xl:grid-cols-[minmax(0,280px)_180px_180px_180px_160px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar recordatorio"
              className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white pl-9 pr-9 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[#6B7280] transition hover:bg-[#F3F4F6]"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as (typeof statusOptions)[number])}
            className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
            title={getStatusFilterLabel(statusFilter)}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="pospuesto">Pospuesto</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value as (typeof priorityOptions)[number])}
            className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
            title={getPriorityFilterLabel(priorityFilter)}
          >
            <option value="">Todas las prioridades</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          >
            <option value="">Todos los tipos</option>
            <option value="seguimiento_crm">Seguimiento CRM</option>
            <option value="gestoria">Gestoría</option>
            <option value="entrega">Entrega</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="caja">Caja</option>
            <option value="comision">Comisión</option>
            <option value="inventario">Inventario</option>
            <option value="otro">Otro</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(event) => setAssigneeFilter(event.target.value)}
            className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          >
            <option value="">Todos los asignados</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.nombre ?? employee.email ?? employee.id}
              </option>
            ))}
          </select>

          <select
            value={dueFilter}
            onChange={(event) => setDueFilter(event.target.value as (typeof dueFilters)[number])}
            className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          >
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="overdue">Vencidos</option>
            <option value="soon">Próximos 7 días</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#E5E7EB]">
          <thead className="bg-[#FAFAFA]">
            <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              <th className="px-4 py-3">Vencimiento</th>
              <th className="px-4 py-3">Recordatorio</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Prioridad</th>
              <th className="px-4 py-3">Asignado</th>
              <th className="px-4 py-3">Vínculo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {filtered.length ? (
              filtered.map((recordatorio) => {
                const overdue = isOverdue(recordatorio);
                const dueToday = isDueToday(recordatorio);
                const link = getLinkLabel(recordatorio);
                const canAct = !isFinal(recordatorio);

                return (
                  <tr key={recordatorio.id} className="transition hover:bg-[#F9FAFB]">
                    <td className="px-4 py-4 align-top">
                      <div className="space-y-1">
                        <p className={`text-sm font-medium ${overdue ? "text-rose-700" : "text-[#111827]"}`}>
                          {formatDate(recordatorio.fecha_vencimiento)}
                        </p>
                        {overdue ? (
                          <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-700">
                            Vencido
                          </span>
                        ) : dueToday ? (
                          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700">
                            Hoy
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">{recordatorio.titulo ?? "—"}</p>
                        <p className="max-w-[24rem] text-sm leading-6 text-[#6B7280]">
                          {recordatorio.descripcion ?? "Sin descripción"}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <RecordatorioTypeBadge type={recordatorio.tipo} />
                    </td>

                    <td className="px-4 py-4 align-top">
                      <RecordatorioPriorityBadge priority={recordatorio.prioridad} />
                    </td>

                    <td className="px-4 py-4 align-top">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">{getAssigneeLabel(recordatorio)}</p>
                        <p className="text-sm text-[#6B7280]">{recordatorio.asignado?.rol ?? "—"}</p>
                      </div>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">{link.title}</p>
                        <p className="text-sm text-[#6B7280]">{link.subtitle}</p>
                      </div>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <div className="space-y-2">
                        <RecordatorioStatusBadge status={recordatorio.estado} />
                        {recordatorio.origen_automatico ? (
                          <p className="text-[11px] text-[#6B7280]">Generado automáticamente</p>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-4 py-4 align-top">
                      {canAct ? (
                        <div className="space-y-3">
                          <form action={completeAction} className="flex items-center gap-2">
                            <input type="hidden" name="id" value={recordatorio.id} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Completar
                            </button>
                          </form>

                          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-3">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                              <CalendarClock className="h-3.5 w-3.5" />
                              Posponer
                            </div>
                            <form action={postponeAction} className="mt-2 flex items-center gap-2">
                              <input type="hidden" name="id" value={recordatorio.id} />
                              <input
                                type="date"
                                name="nueva_fecha"
                                className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-2 text-xs text-[#111827] outline-none"
                                defaultValue={recordatorio.fecha_vencimiento ?? getDateOffset(1)}
                              />
                              <button
                                type="submit"
                                className="inline-flex h-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
                              >
                                Posponer
                              </button>
                            </form>
                            <div className="mt-2 flex gap-2">
                              <QuickPostponeForm id={recordatorio.id} label="Mañana" nuevaFecha={getDateOffset(1)} />
                              <QuickPostponeForm id={recordatorio.id} label="7 días" nuevaFecha={getDateOffset(7)} />
                            </div>
                          </div>

                          <form action={cancelAction}>
                            <input type="hidden" name="id" value={recordatorio.id} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 transition hover:bg-rose-100"
                            >
                              <Ban className="h-3.5 w-3.5" />
                              Cancelar
                            </button>
                          </form>
                        </div>
                      ) : (
                        <span className="text-sm text-[#6B7280]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="px-4 py-12 text-center text-sm text-[#6B7280]" colSpan={8}>
                  No hay recordatorios con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function QuickPostponeForm({
  id,
  label,
  nuevaFecha,
}: {
  id: string;
  label: string;
  nuevaFecha: string;
}) {
  return (
    <form action={postponeAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="nueva_fecha" value={nuevaFecha} />
      <button
        type="submit"
        className="inline-flex h-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-2.5 text-[11px] font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
      >
        {label}
      </button>
    </form>
  );
}
