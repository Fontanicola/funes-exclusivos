"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Camera, Search, X } from "lucide-react";
import { LeadOriginBadge } from "./lead-origin-badge";
import { LeadStatusBadge } from "./lead-status-badge";
import { PaginationControls } from "@/components/common/pagination-controls";
import { AdvancedFilters } from "@/components/common/advanced-filters";
import { DataEntryModal } from "@/components/common/data-entry-modal";

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
    color: string | null;
    km: number | null;
    precio_venta: number | null;
    precio_moneda: string | null;
    fotos: string[] | string | null;
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

function getPrimaryPhoto(value: string[] | string | null | undefined) {
  if (Array.isArray(value)) return value.find((photo) => typeof photo === "string" && photo.trim()) ?? null;
  if (typeof value !== "string" || !value.trim()) return null;
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:image/")) return value;
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.find((photo) => typeof photo === "string" && photo.trim()) ?? null : null;
  } catch {
    return null;
  }
}

function formatVehiclePrice(vehicle: NonNullable<Lead["vehiculo"]>) {
  if (vehicle.precio_venta == null) return null;
  const currency = (vehicle.precio_moneda ?? "ARS").toLowerCase() === "usd" ? "USD" : "ARS";
  const symbol = currency === "USD" ? "US$" : "$";
  return `${symbol} ${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(vehicle.precio_venta)}`;
}

function VehicleInterestCard({ lead }: { lead: Lead }) {
  const vehicle = lead.vehiculo;
  if (!vehicle) return <span className="text-sm text-[#6B7280]">—</span>;

  const title = `${vehicle.marca ?? "Sin marca"} ${vehicle.modelo ?? ""}`.trim();
  const subtitle = [vehicle.version, vehicle.anio ? String(vehicle.anio) : null, vehicle.dominio]
    .filter(Boolean)
    .join(" · ");
  const photo = getPrimaryPhoto(vehicle.fotos);
  const price = formatVehiclePrice(vehicle);

  return (
    <DataEntryModal
      triggerLabel={title}
      triggerContent={
        <>
          <span className="flex h-11 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#E5E7EB] bg-[#F9FAFB]">
            {photo ? (
              <img src={photo} alt={`Foto de ${title}`} loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <Camera className="h-4 w-4 text-[#9CA3AF]" aria-label="Sin foto" />
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-[#111827]">{title}</span>
            <span className="mt-0.5 block truncate text-xs text-[#6B7280]">{subtitle || "Ficha incompleta"}</span>
          </span>
        </>
      }
      title="Vehículo de interés"
      description="Información comercial de la unidad asociada al lead."
      size="default"
      triggerClassName="group flex w-full max-w-[300px] items-center gap-3 rounded-md border border-[#E5E7EB] bg-white p-2 text-left transition hover:border-[#D8A1B2] hover:bg-[#FDF8F9]"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          {photo ? (
            <img src={photo} alt="" className="h-24 w-32 rounded-md object-cover" />
          ) : (
            <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-md bg-[#FDF2F5] text-xs font-semibold uppercase tracking-[0.12em] text-[#8A1538]">Sin foto</div>
          )}
          <div className="min-w-0 space-y-1">
            <p className="text-base font-semibold text-[#111827]">{title}</p>
            {subtitle ? <p className="text-sm text-[#6B7280]">{subtitle}</p> : null}
            {price ? <p className="pt-2 text-sm font-semibold text-[#8A1538]">{price}</p> : null}
          </div>
        </div>
        <div className="grid gap-3 rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-3 text-sm sm:grid-cols-2">
          <div><span className="text-[#6B7280]">Color</span><p className="font-medium text-[#111827]">{vehicle.color ?? "—"}</p></div>
          <div><span className="text-[#6B7280]">Kilómetros</span><p className="font-medium text-[#111827]">{vehicle.km != null ? new Intl.NumberFormat("es-AR").format(vehicle.km) : "—"}</p></div>
          <div><span className="text-[#6B7280]">Dominio</span><p className="font-medium text-[#111827]">{vehicle.dominio ?? "—"}</p></div>
          <div><span className="text-[#6B7280]">Lead</span><p className="font-medium text-[#111827]">{lead.nombre ?? "Sin nombre"}</p></div>
        </div>
      </div>
    </DataEntryModal>
  );
}

function getContactLine(lead: Lead) {
  return lead.telefono ?? lead.email ?? lead.documento ?? "—";
}

function getSellerName(lead: Lead) {
  return lead.vendedor?.nombre ?? "Sin vendedor";
}

export function LeadsTable({ leads, toolbarAction }: { leads: Lead[]; toolbarAction?: ReactNode }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("");
  const [originFilter, setOriginFilter] = useState<(typeof origins)[number]>("");
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleLeads = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <section className="rounded-md border border-[#E5E7EB] bg-white">
      <div className="border-b border-[#E5E7EB] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            {toolbarAction ? <div className="shrink-0">{toolbarAction}</div> : null}
            <div className="relative min-w-[260px] flex-1 sm:w-[320px] sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar lead"
              className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white pl-9 pr-9 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]"
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

            <AdvancedFilters>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as (typeof statuses)[number])}
              className="h-10 min-w-[180px] flex-1 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6] sm:flex-none"
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
              className="h-10 min-w-[180px] flex-1 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6] sm:flex-none"
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
            </AdvancedFilters>
          </div>
          <p className="text-xs text-[#6B7280]">
            Mostrando {visibleLeads.length} de {filtered.length}
          </p>
        </div>
      </div>

      <div className="max-h-[min(68vh,760px)] overflow-auto">
        <table className="min-w-full divide-y divide-[#E5E7EB]">
          <thead className="sticky top-0 z-10 bg-[#FAFAFA]">
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
                      <VehicleInterestCard lead={lead} />
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
                        className="inline-flex items-center rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
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
                      {leads.length ? "No encontramos leads con esos filtros" : "Todavía no hay leads cargados"}
                    </p>
                    <p className="text-sm leading-6 text-[#6B7280]">
                      {leads.length
                        ? "Probá limpiar la búsqueda o cambiar el estado."
                        : "Cargá el primer lead para comenzar a seguir oportunidades."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls page={currentPage} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </section>
  );
}
