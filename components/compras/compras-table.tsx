"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { VehiculoStatusBadge } from "@/components/inventario/vehiculo-status-badge";
import { PaginationControls } from "@/components/common/pagination-controls";

type Compra = {
  id: string;
  vehiculo_id: string | null;
  proveedor_id: string | null;
  fecha: string | null;
  nro_operacion: string | null;
  precio_compra: number | null;
  precio_boleto: number | null;
  moneda: string | null;
  diferencia_b: number | null;
  deuda_pendiente: number | null;
  observaciones: string | null;
  created_at: string | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    version: string | null;
    anio: number | null;
    color: string | null;
    km: number | null;
    dominio: string | null;
    estado: string | null;
    costo_adquisicion: number | null;
    costo_moneda: string | null;
    fecha_compra: string | null;
    nro_operacion: string | null;
  } | null;
  proveedor: {
    id: string;
    nombre: string | null;
    categoria: string | null;
    telefono: string | null;
  } | null;
};

const currencyFilters = ["", "ARS", "USD"] as const;

function formatDate(value: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR").format(parsed);
}

function formatMoney(value: number | null, currency: string | null) {
  if (value == null) return "—";
  const isoCurrency = (currency ?? "").toLowerCase() === "usd" ? "USD" : "ARS";
  const symbol = isoCurrency === "USD" ? "US$" : "$";
  return `${symbol} ${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(value)}`;
}

function getVehicleSummary(compra: Compra) {
  const vehicle = compra.vehiculo;
  if (!vehicle) return { title: "—", subtitle: "" };

  const pieces = [
    `${vehicle.marca ?? "-"} ${vehicle.modelo ?? ""}`.trim(),
    vehicle.version,
    vehicle.anio ? String(vehicle.anio) : null,
    vehicle.dominio,
  ].filter(Boolean);

  return {
    title: pieces[0] ?? "—",
    subtitle: pieces.slice(1).join(" · "),
  };
}

function getProviderSummary(compra: Compra) {
  const provider = compra.proveedor;
  if (!provider) return { title: "—", subtitle: "" };

  return {
    title: provider.nombre ?? "Proveedor",
    subtitle: [provider.categoria, provider.telefono].filter(Boolean).join(" · "),
  };
}

export function ComprasTable({ compras, toolbarAction }: { compras: Compra[]; toolbarAction?: ReactNode }) {
  const [query, setQuery] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState<(typeof currencyFilters)[number]>("");
  const [withDebt, setWithDebt] = useState(false);
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  const filteredCompras = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return compras.filter((compra) => {
      if (currencyFilter && (compra.moneda ?? "").toUpperCase() !== currencyFilter) return false;
      if (withDebt && !((compra.deuda_pendiente ?? 0) > 0)) return false;
      if (!normalizedQuery) return true;

      const searchable = [
        compra.proveedor?.nombre,
        compra.proveedor?.categoria,
        compra.proveedor?.telefono,
        compra.vehiculo?.marca,
        compra.vehiculo?.modelo,
        compra.vehiculo?.version,
        compra.vehiculo?.dominio,
        compra.nro_operacion,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [compras, currencyFilter, query, withDebt]);

  const totalPages = Math.max(1, Math.ceil(filteredCompras.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleCompras = filteredCompras.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
              placeholder="Buscar compra"
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

            <div className="min-w-[180px] flex-1 sm:flex-none">
            <select
              value={currencyFilter}
              onChange={(event) => setCurrencyFilter(event.target.value as (typeof currencyFilters)[number])}
              className="h-10 w-full appearance-none rounded-md border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6] sm:w-auto"
            >
              <option value="">Todas las monedas</option>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
            </div>

            <button
            type="button"
            onClick={() => setWithDebt((value) => !value)}
            className={[
              "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition",
              withDebt
                ? "border-[#8A1538] bg-[#8A1538] text-white"
                : "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]",
            ].join(" ")}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Con deuda
            </button>
          </div>
          <p className="text-xs text-[#6B7280]">
            Mostrando {visibleCompras.length} de {filteredCompras.length}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#E5E7EB]">
          <thead className="bg-[#FAFAFA]">
            <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Operación</th>
              <th className="px-4 py-3">Vehículo</th>
              <th className="px-4 py-3">Proveedor</th>
              <th className="px-4 py-3">Precio compra</th>
              <th className="px-4 py-3">Precio boleto</th>
              <th className="px-4 py-3">Diferencia B</th>
              <th className="px-4 py-3">Deuda</th>
              <th className="px-4 py-3">Estado stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {visibleCompras.length ? (
              visibleCompras.map((compra) => {
                const vehicle = getVehicleSummary(compra);
                const provider = getProviderSummary(compra);
                const hasDebt = (compra.deuda_pendiente ?? 0) > 0;

                return (
                  <tr key={compra.id} className="transition hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3 align-top text-sm text-[#111827]">{formatDate(compra.fecha)}</td>
                    <td className="px-4 py-3 align-top">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">{compra.nro_operacion ?? "—"}</p>
                        <p className="text-xs text-[#6B7280]">{compra.observaciones ?? "Sin observaciones"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">{vehicle.title}</p>
                        {vehicle.subtitle ? <p className="text-sm text-[#6B7280]">{vehicle.subtitle}</p> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">{provider.title}</p>
                        {provider.subtitle ? <p className="text-sm text-[#6B7280]">{provider.subtitle}</p> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-sm font-medium text-[#111827]">
                      {formatMoney(compra.precio_compra, compra.moneda)}
                    </td>
                    <td className="px-4 py-3 align-top text-sm text-[#111827]">
                      {formatMoney(compra.precio_boleto, compra.moneda)}
                    </td>
                    <td className="px-4 py-3 align-top text-sm text-[#111827]">
                      {formatMoney(compra.diferencia_b, compra.moneda)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {hasDebt ? (
                        <span className="inline-flex items-center rounded-full border border-[#FEF3C7] bg-[#FFFBEB] px-2.5 py-1 text-xs font-medium text-[#92400E]">
                          {formatMoney(compra.deuda_pendiente, compra.moneda)}
                        </span>
                      ) : (
                        <span className="text-sm text-[#6B7280]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <VehiculoStatusBadge status={compra.vehiculo?.estado ?? "en_stock"} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-14 text-center">
                  <div className="mx-auto max-w-sm space-y-2">
                    <p className="text-sm font-medium text-[#111827]">
                      {compras.length ? "No encontramos compras con esos filtros" : "Todavía no hay compras cargadas"}
                    </p>
                    <p className="text-sm text-[#6B7280]">
                      {compras.length
                        ? "Probá limpiar la búsqueda o ajustar la moneda."
                        : "Registrá la primera compra para empezar a seguir stock y costos."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls page={currentPage} totalItems={filteredCompras.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </section>
  );
}
