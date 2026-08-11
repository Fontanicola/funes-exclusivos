"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { ComisionStatusBadge } from "./comision-status-badge";
import { PaginationControls } from "@/components/common/pagination-controls";

type Comision = {
  id: string;
  venta_id: string | null;
  vendedor_id: string | null;
  base_comision: number | null;
  porcentaje: number | null;
  monto_comision: number | null;
  moneda: string | null;
  estado: string | null;
  fecha_generada: string | null;
  fecha_pago: string | null;
  observaciones: string | null;
  created_at: string | null;
  vendedor: {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
  } | null;
  venta: {
    id: string;
    fecha_venta: string | null;
    cliente_nombre: string | null;
    precio_venta: number | null;
    moneda: string | null;
    metodo_pago: string | null;
    estado: string | null;
    vehiculo: {
      id: string;
      marca: string | null;
      modelo: string | null;
      version: string | null;
      anio: number | null;
      dominio: string | null;
    } | null;
  } | null;
};

const statuses = ["", "pendiente", "aprobada", "pagada", "anulada"] as const;
const currencies = ["", "ARS", "USD"] as const;

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR").format(date);
}

function formatMoney(value: number | null, currency: string | null) {
  if (value == null) return "—";
  const isoCurrency = (currency ?? "").toLowerCase() === "usd" ? "USD" : "ARS";
  const symbol = isoCurrency === "USD" ? "US$" : "$";
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: isoCurrency,
    maximumFractionDigits: 0,
  }).format(value);

  return formatted.replace("US$", symbol).replace("$", symbol);
}

function getSellerName(comision: Comision) {
  return comision.vendedor?.nombre ?? "Sin vendedor";
}

function getVehicleSummary(comision: Comision) {
  const vehicle = comision.venta?.vehiculo;
  const title = vehicle ? `${vehicle.marca ?? "-"} ${vehicle.modelo ?? ""}`.trim() : "—";
  const subtitle = [vehicle?.version, vehicle?.anio ? String(vehicle.anio) : null, vehicle?.dominio]
    .filter(Boolean)
    .join(" · ");

  return { title, subtitle };
}

export function ComisionesTable({ comisiones, toolbarAction }: { comisiones: Comision[]; toolbarAction?: ReactNode }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("");
  const [currencyFilter, setCurrencyFilter] = useState<(typeof currencies)[number]>("");
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return comisiones.filter((comision) => {
      if (statusFilter && comision.estado !== statusFilter) return false;
      if (currencyFilter && (comision.moneda ?? "").toUpperCase() !== currencyFilter) return false;

      if (!normalizedQuery) return true;

      const searchable = [
        getSellerName(comision),
        comision.venta?.cliente_nombre,
        comision.venta?.vehiculo?.marca,
        comision.venta?.vehiculo?.modelo,
        comision.venta?.vehiculo?.dominio,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [comisiones, currencyFilter, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleComisiones = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
              placeholder="Buscar comisión"
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

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as (typeof statuses)[number])}
              className="h-10 min-w-[180px] flex-1 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6] sm:flex-none"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
              <option value="pagada">Pagada</option>
              <option value="anulada">Anulada</option>
            </select>

            <select
              value={currencyFilter}
              onChange={(event) => setCurrencyFilter(event.target.value as (typeof currencies)[number])}
              className="h-10 min-w-[180px] flex-1 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6] sm:flex-none"
            >
              <option value="">Todas las monedas</option>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <p className="text-xs text-[#6B7280]">
            Mostrando {visibleComisiones.length} de {filtered.length}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#E5E7EB]">
          <thead className="bg-[#FAFAFA]">
            <tr className="text-left text-xs font-medium uppercase tracking-[0.08em] text-[#6B7280]">
              <th className="px-4 py-3">Vendedor</th>
              <th className="px-4 py-3">Venta</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Base</th>
              <th className="px-4 py-3">%</th>
              <th className="px-4 py-3">Comisión</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {visibleComisiones.length ? (
              visibleComisiones.map((comision) => {
                const vehicle = getVehicleSummary(comision);

                return (
                  <tr key={comision.id} className="transition hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3 align-middle">
                      <p className="text-sm font-medium text-[#111827]">{getSellerName(comision)}</p>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">{vehicle.title}</p>
                        {vehicle.subtitle ? (
                          <p className="text-sm text-[#6B7280]">{vehicle.subtitle}</p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <p className="text-sm text-[#111827]">{comision.venta?.cliente_nombre ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-[#111827]">
                      {formatDate(comision.fecha_generada)}
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-[#111827]">
                      {formatMoney(comision.base_comision, comision.moneda)}
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-[#111827]">
                      {comision.porcentaje != null ? `${new Intl.NumberFormat("es-AR", {
                        maximumFractionDigits: 2,
                      }).format(comision.porcentaje)}%` : "—"}
                    </td>
                    <td className="px-4 py-3 align-middle text-sm font-medium text-[#111827]">
                      {formatMoney(comision.monto_comision, comision.moneda)}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <ComisionStatusBadge status={comision.estado} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center">
                  <div className="mx-auto max-w-sm space-y-2">
                    <p className="text-sm font-medium text-[#111827]">
                      {comisiones.length ? "No encontramos comisiones con esos filtros" : "Todavía no hay comisiones cargadas"}
                    </p>
                    <p className="text-sm leading-6 text-[#6B7280]">
                      {comisiones.length
                        ? "Probá limpiar la búsqueda o ajustar el estado."
                        : "Cuando haya ventas, las comisiones aparecerán acá."}
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
