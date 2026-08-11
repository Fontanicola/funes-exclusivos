"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { PresupuestoStatusBadge } from "./presupuesto-status-badge";
import { PaginationControls } from "@/components/common/pagination-controls";
import { AdvancedFilters } from "@/components/common/advanced-filters";

type Presupuesto = {
  id: string;
  estado: string | null;
  cliente_nombre: string | null;
  cliente_telefono: string | null;
  cliente_email: string | null;
  cliente_documento: string | null;
  fecha: string | null;
  moneda: string | null;
  valor_tabla_dnrpa: number | null;
  valor_tabla_api: number | null;
  total: number | null;
  tramite: {
    id: string;
    titulo: string | null;
    tipo: string | null;
    estado: string | null;
  } | null;
  venta: {
    id: string;
    fecha_venta: string | null;
    cliente_nombre: string | null;
  } | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    version: string | null;
    anio: number | null;
    dominio: string | null;
  } | null;
};

const states = ["", "borrador", "enviado", "aprobado", "rechazado", "facturado", "anulado"] as const;
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

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function getVehicleLabel(presupuesto: Presupuesto) {
  return [presupuesto.vehiculo?.marca, presupuesto.vehiculo?.modelo].filter(Boolean).join(" ") || "—";
}

function getVehicleSubtitle(presupuesto: Presupuesto) {
  const parts = [presupuesto.vehiculo?.version, presupuesto.vehiculo?.anio ? String(presupuesto.vehiculo.anio) : null, presupuesto.vehiculo?.dominio]
    .filter(Boolean);
  if (parts.length) return parts.join(" · ");
  if (presupuesto.venta) return `Venta ${formatDate(presupuesto.venta.fecha_venta)}`;
  if (presupuesto.tramite) return presupuesto.tramite.titulo ?? "Trámite";
  return "—";
}

function getClientSubtitle(presupuesto: Presupuesto) {
  return presupuesto.cliente_telefono ?? presupuesto.cliente_email ?? presupuesto.cliente_documento ?? "—";
}

function getRelevantTotal(presupuesto: Presupuesto) {
  return presupuesto.total ?? (presupuesto.valor_tabla_dnrpa ?? 0) + (presupuesto.valor_tabla_api ?? 0);
}

export function PresupuestosTable({ presupuestos }: { presupuestos: Presupuesto[] }) {
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<(typeof states)[number]>("");
  const [currencyFilter, setCurrencyFilter] = useState<(typeof currencies)[number]>("");
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return presupuestos.filter((presupuesto) => {
      if (stateFilter && normalize(presupuesto.estado) !== stateFilter) return false;
      if (currencyFilter && presupuesto.moneda !== currencyFilter) return false;

      if (!normalizedQuery) return true;

      const searchable = [
        presupuesto.cliente_nombre,
        presupuesto.cliente_email,
        presupuesto.cliente_documento,
        presupuesto.vehiculo?.dominio,
        presupuesto.vehiculo?.marca,
        presupuesto.vehiculo?.modelo,
        presupuesto.tramite?.titulo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [currencyFilter, presupuestos, query, stateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visiblePresupuestos = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <section className="rounded-md border border-[#E5E7EB] bg-white">
      <div className="border-b border-[#E5E7EB] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[260px] flex-1 sm:w-[320px] sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar presupuesto"
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
            value={stateFilter}
            onChange={(event) => setStateFilter(event.target.value as (typeof states)[number])}
            className="h-10 min-w-[180px] flex-1 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6] sm:flex-none"
          >
            <option value="">Todos los estados</option>
            <option value="borrador">Borrador</option>
            <option value="enviado">Enviado</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
            <option value="facturado">Facturado</option>
            <option value="anulado">Anulado</option>
          </select>

          <select
            value={currencyFilter}
            onChange={(event) => setCurrencyFilter(event.target.value as (typeof currencies)[number])}
            className="h-10 min-w-[160px] flex-1 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6] sm:flex-none"
          >
            <option value="">Todas las monedas</option>
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
          </select>
          </AdvancedFilters>
        </div>
        <p className="text-xs text-[#6B7280]">
          Mostrando {visiblePresupuestos.length} de {filtered.length}
        </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#E5E7EB]">
          <thead className="bg-[#FAFAFA]">
            <tr className="text-left text-xs font-medium uppercase tracking-[0.08em] text-[#6B7280]">
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Vehículo / Venta</th>
              <th className="px-4 py-3">Valores tabla</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {visiblePresupuestos.length ? (
              visiblePresupuestos.map((presupuesto) => (
                <tr key={presupuesto.id} className="transition hover:bg-[#F9FAFB]">
                  <td className="px-4 py-3 align-top text-sm text-[#111827]">{formatDate(presupuesto.fecha)}</td>
                  <td className="px-4 py-3 align-top">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-[#111827]">{presupuesto.cliente_nombre ?? "—"}</p>
                      <p className="text-xs text-[#6B7280]">{getClientSubtitle(presupuesto)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-[#111827]">{getVehicleLabel(presupuesto)}</p>
                      <p className="text-xs text-[#6B7280]">{getVehicleSubtitle(presupuesto)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="space-y-1">
                      <p className="text-xs text-[#6B7280]">
                        DNRPA {formatMoney(presupuesto.valor_tabla_dnrpa, presupuesto.moneda)}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        API {formatMoney(presupuesto.valor_tabla_api, presupuesto.moneda)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-sm font-medium text-[#111827]">
                    {formatMoney(getRelevantTotal(presupuesto), presupuesto.moneda)}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <PresupuestoStatusBadge status={presupuesto.estado} />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Link
                      href={`/gestoria/presupuestos/${presupuesto.id}`}
                      className="text-sm font-medium text-[#111827] transition hover:text-[#6B7280]"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center">
                  <div className="mx-auto max-w-sm space-y-2">
                    <p className="text-sm font-medium text-[#111827]">No hay resultados para mostrar</p>
                    <p className="text-sm leading-6 text-[#6B7280]">
                      Probá ajustar los filtros o buscá otro presupuesto.
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
