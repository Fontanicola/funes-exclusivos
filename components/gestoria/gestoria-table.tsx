"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { GestoriaStatusBadge } from "./gestoria-status-badge";
import { GestoriaTypeBadge } from "./gestoria-type-badge";

type GestoriaTramite = {
  id: string;
  tipo: string | null;
  estado: string | null;
  titulo: string | null;
  descripcion: string | null;
  cliente_nombre: string | null;
  cliente_telefono: string | null;
  cliente_email: string | null;
  cliente_documento: string | null;
  fecha_inicio: string | null;
  fecha_vencimiento: string | null;
  fecha_finalizacion: string | null;
  documentos: string[] | string | null;
  observaciones: string | null;
  created_at: string | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    version: string | null;
    anio: number | null;
    dominio: string | null;
  } | null;
  venta: {
    id: string;
    fecha_venta: string | null;
    cliente_nombre: string | null;
  } | null;
  responsable: {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
  } | null;
};

const statuses = ["", "pendiente", "en_proceso", "observado", "completado", "cancelado"] as const;
const types = ["", "transferencia", "cedula", "titulo", "verificacion_policial", "informe_dominio", "prenda", "seguro", "patente", "otro"] as const;

function parseDocuments(documents: GestoriaTramite["documentos"]) {
  if (Array.isArray(documents)) return documents;
  if (typeof documents === "string") {
    try {
      const parsed = JSON.parse(documents);
      return Array.isArray(parsed) ? parsed : documents ? [documents] : [];
    } catch {
      return documents ? [documents] : [];
    }
  }

  return [];
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR").format(date);
}

function isOverdue(tramite: GestoriaTramite) {
  if (!tramite.fecha_vencimiento) return false;
  const due = new Date(`${tramite.fecha_vencimiento}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due.getTime() < today.getTime() && !["completado", "cancelado"].includes((tramite.estado ?? "").toLowerCase());
}

function getVehicleOrSale(tramite: GestoriaTramite) {
  if (tramite.vehiculo) {
    return {
      title: `${tramite.vehiculo.marca ?? "-"} ${tramite.vehiculo.modelo ?? ""}`.trim(),
      subtitle: tramite.vehiculo.dominio ?? null,
    };
  }

  if (tramite.venta) {
    return {
      title: `Venta ${formatDate(tramite.venta.fecha_venta)}`,
      subtitle: tramite.venta.cliente_nombre ?? null,
    };
  }

  return null;
}

function getClientContact(tramite: GestoriaTramite) {
  return tramite.cliente_telefono ?? tramite.cliente_email ?? tramite.cliente_documento ?? "—";
}

function getResponsibleName(tramite: GestoriaTramite) {
  return tramite.responsable?.nombre ?? tramite.responsable?.email ?? "—";
}

export function GestoriaTable({ tramites }: { tramites: GestoriaTramite[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("");
  const [typeFilter, setTypeFilter] = useState<(typeof types)[number]>("");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tramites.filter((tramite) => {
      if (statusFilter && tramite.estado !== statusFilter) return false;
      if (typeFilter && tramite.tipo !== typeFilter) return false;

      if (!normalizedQuery) return true;

      const searchable = [
        tramite.titulo,
        tramite.cliente_nombre,
        tramite.cliente_documento,
        tramite.vehiculo?.dominio,
        tramite.vehiculo?.marca,
        tramite.vehiculo?.modelo,
        tramite.responsable?.nombre,
        tramite.responsable?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [query, statusFilter, tramites, typeFilter]);

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#E5E7EB] p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">Trámites</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Buscá por título, cliente, documento, dominio, vehículo o responsable.
          </p>
        </div>

        <div className="grid gap-2 md:grid-cols-[320px_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar trámite"
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
            onChange={(event) => setStatusFilter(event.target.value as (typeof statuses)[number])}
            className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En proceso</option>
            <option value="observado">Observado</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as (typeof types)[number])}
            className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          >
            <option value="">Todos los tipos</option>
            <option value="transferencia">Transferencia</option>
            <option value="cedula">Cédula</option>
            <option value="titulo">Título</option>
            <option value="verificacion_policial">Verificación policial</option>
            <option value="informe_dominio">Informe dominio</option>
            <option value="prenda">Prenda</option>
            <option value="seguro">Seguro</option>
            <option value="patente">Patente</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#E5E7EB]">
          <thead className="bg-[#FAFAFA]">
            <tr className="text-left text-xs font-medium uppercase tracking-[0.08em] text-[#6B7280]">
              <th className="px-4 py-3">Trámite</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Vehículo / Venta</th>
              <th className="px-4 py-3">Responsable</th>
              <th className="px-4 py-3">Inicio</th>
              <th className="px-4 py-3">Vencimiento</th>
              <th className="px-4 py-3">Documentos</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {filtered.length ? (
              filtered.map((tramite) => {
                const relation = getVehicleOrSale(tramite);
                const documents = parseDocuments(tramite.documentos);
                const overdue = isOverdue(tramite);

                return (
                  <tr key={tramite.id} className="transition hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">{tramite.titulo ?? "—"}</p>
                        <GestoriaTypeBadge type={tramite.tipo} />
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">
                          {tramite.cliente_nombre ?? "—"}
                        </p>
                        <p className="text-sm text-[#6B7280]">{getClientContact(tramite)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {relation ? (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-[#111827]">{relation.title}</p>
                          {relation.subtitle ? (
                            <p className="text-sm text-[#6B7280]">{relation.subtitle}</p>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-sm text-[#6B7280]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-[#111827]">
                      {getResponsibleName(tramite)}
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-[#111827]">
                      {formatDate(tramite.fecha_inicio)}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <p className="text-sm text-[#111827]">{formatDate(tramite.fecha_vencimiento)}</p>
                        {overdue ? (
                          <span className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2.5 py-1 text-xs font-medium text-[#6B7280]">
                            Vencido
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-[#111827]">
                      {documents.length}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <GestoriaStatusBadge status={tramite.estado} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center text-sm text-[#6B7280]">
                  No hay trámites que coincidan con los filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
