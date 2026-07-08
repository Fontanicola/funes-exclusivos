"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { LeadOriginBadge } from "./lead-origin-badge";
import { LeadStatusBadge } from "./lead-status-badge";

type Lead = {
  id: string;
  nombre: string | null;
  telefono: string | null;
  email: string | null;
  documento: string | null;
  origen: string | null;
  estado: string | null;
  presupuesto_min: number | null;
  presupuesto_max: number | null;
  presupuesto_moneda: string | null;
  nivel_interes: number | null;
  proximo_contacto: string | null;
  created_at: string | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    version: string | null;
    anio: number | null;
    dominio: string | null;
  } | null;
  vendedor: {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
  } | null;
};

const statuses = ["", "nuevo", "contactado", "interesado", "negociacion", "reservado", "ganado", "perdido"] as const;
const origins = ["", "whatsapp", "instagram", "facebook", "web", "referido", "presencial", "otro"] as const;

function formatBudget(lead: Lead) {
  const hasMin = lead.presupuesto_min != null;
  const hasMax = lead.presupuesto_max != null;

  if (!hasMin && !hasMax) return "—";

  const currency = (lead.presupuesto_moneda ?? "ARS").toLowerCase() === "usd" ? "USD" : "ARS";
  const symbol = currency === "USD" ? "US$" : "$";
  const formatter = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

  if (hasMin && hasMax && lead.presupuesto_min !== lead.presupuesto_max) {
    return `${symbol} ${formatter.format(lead.presupuesto_min ?? 0)} - ${symbol} ${formatter.format(lead.presupuesto_max ?? 0)}`;
  }

  return `${symbol} ${formatter.format((lead.presupuesto_min ?? lead.presupuesto_max ?? 0))}`;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR").format(date);
}

function getVehicleSummary(lead: Lead) {
  const vehicle = lead.vehiculo;
  const title = vehicle ? `${vehicle.marca ?? "-"} ${vehicle.modelo ?? ""}`.trim() : "—";
  const subtitle = [vehicle?.version, vehicle?.anio ? String(vehicle.anio) : null, vehicle?.dominio]
    .filter(Boolean)
    .join(" · ");

  return { title, subtitle };
}

function getContactLine(lead: Lead) {
  return lead.telefono ?? lead.email ?? lead.documento ?? "—";
}

function getSellerName(lead: Lead) {
  return lead.vendedor?.nombre ?? lead.vendedor?.email ?? "—";
}

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("");
  const [originFilter, setOriginFilter] = useState<(typeof origins)[number]>("");
  const MAX_VISIBLE_ROWS = 200;

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return leads.filter((lead) => {
      if (statusFilter && lead.estado !== statusFilter) return false;
      if (originFilter && lead.origen !== originFilter) return false;

      if (!normalizedQuery) return true;

      const searchable = [
        lead.nombre,
        lead.telefono,
        lead.email,
        lead.documento,
        lead.vehiculo?.marca,
        lead.vehiculo?.modelo,
        lead.vehiculo?.dominio,
        lead.vendedor?.nombre,
        lead.vendedor?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [leads, originFilter, query, statusFilter]);

  const visibleLeads = filtered.slice(0, MAX_VISIBLE_ROWS);
  const hasMoreRows = filtered.length > MAX_VISIBLE_ROWS;

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#E5E7EB] p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">Leads</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Buscá por nombre, contacto, vehículo o vendedor.
          </p>
        </div>

        <div className="grid gap-2 md:grid-cols-[320px_160px_160px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar lead"
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
            <option value="nuevo">Nuevo</option>
            <option value="contactado">Contactado</option>
            <option value="interesado">Interesado</option>
            <option value="negociacion">Negociación</option>
            <option value="reservado">Reservado</option>
            <option value="ganado">Ganado</option>
            <option value="perdido">Perdido</option>
          </select>

          <select
            value={originFilter}
            onChange={(event) => setOriginFilter(event.target.value as (typeof origins)[number])}
            className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          >
            <option value="">Todos los orígenes</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="web">Web</option>
            <option value="referido">Referido</option>
            <option value="presencial">Presencial</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#E5E7EB]">
          <thead className="bg-[#FAFAFA]">
            <tr className="text-left text-xs font-medium uppercase tracking-[0.08em] text-[#6B7280]">
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Origen</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Vehículo interés</th>
              <th className="px-4 py-3">Vendedor</th>
              <th className="px-4 py-3">Presupuesto</th>
              <th className="px-4 py-3">Próximo contacto</th>
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {visibleLeads.length ? (
              visibleLeads.map((lead) => {
                const vehicle = getVehicleSummary(lead);

                return (
                  <tr key={lead.id} className="transition hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">{lead.nombre ?? "Sin nombre"}</p>
                        <p className="text-sm text-[#6B7280]">{getContactLine(lead)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <LeadOriginBadge origin={lead.origen} />
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <LeadStatusBadge status={lead.estado} />
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">{vehicle.title}</p>
                        {vehicle.subtitle ? (
                          <p className="text-sm text-[#6B7280]">{vehicle.subtitle}</p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-[#111827]">
                      {getSellerName(lead)}
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-[#111827]">
                      {formatBudget(lead)}
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-[#111827]">
                      {formatDate(lead.proximo_contacto)}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <Link
                        href={`/crm/${lead.id}`}
                        className="inline-flex items-center rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center">
                  <div className="mx-auto max-w-sm space-y-2">
                    <p className="text-sm font-medium text-[#111827]">
                      No hay resultados para mostrar
                    </p>
                    <p className="text-sm leading-6 text-[#6B7280]">
                      Probá ajustar los filtros o buscar otro lead.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasMoreRows ? (
        <div className="border-t border-[#E5E7EB] px-4 py-3 text-xs text-[#6B7280]">
          Mostrando los primeros {MAX_VISIBLE_ROWS} resultados. Afiná filtros para ver el resto.
        </div>
      ) : null}
    </section>
  );
}
