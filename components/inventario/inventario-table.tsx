"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronDown, ChevronUp, Eye, LayoutGrid, List, PencilLine, Search, X } from "lucide-react";
import { canManageInventory, canViewCosts } from "@/lib/auth/permissions";
import { VehiculoStatusBadge } from "./vehiculo-status-badge";
import { PaginationControls } from "@/components/common/pagination-controls";
import { ActionMenu } from "@/components/common/action-menu";
import { AdvancedFilters } from "@/components/common/advanced-filters";
import { VehiculoDeleteButton } from "@/components/inventario/vehiculo-delete-button";

type Vehiculo = {
  id: string;
  marca: string | null;
  modelo: string | null;
  version: string | null;
  anio: number | null;
  color: string | null;
  km: number | null;
  dominio: string | null;
  motor: string | null;
  ubicacion: string | null;
  nro_operacion: string | null;
  proveedor_id: string | null;
  fecha_compra: string | null;
  costo_adquisicion: number | null;
  costo_moneda: string | null;
  precio_venta: number | null;
  precio_moneda: string | null;
  precio_infoauto_compra: number | null;
  precio_infoauto_actual: number | null;
  precio_infoauto_anterior: number | null;
  precio_permuta: number | null;
  precio_contado: number | null;
  costo_reposicion: number | null;
  estado: string | null;
  estado_preparacion: string | null;
  chapero: string | null;
  preparacion_comentarios: string | null;
  publicado_mercadolibre: boolean | null;
  publicado_rodados_google: boolean | null;
  fotos: string[] | string | null;
  fecha_ingreso: string | null;
  created_at: string | null;
};

type Proveedor = {
  id: string;
  nombre: string | null;
  categoria: string | null;
};

function formatKm(value: number | null) {
  if (value == null) return "-";
  return new Intl.NumberFormat("es-AR").format(value);
}

function formatCurrency(value: number | null, currency: string | null) {
  if (value == null) return "-";

  const isoCurrency = (currency ?? "").toLowerCase() === "usd" ? "USD" : "ARS";
  const symbol = isoCurrency === "USD" ? "US$" : "$";
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: isoCurrency,
    maximumFractionDigits: 0,
  }).format(value);

  return formatted.replace("US$", symbol).replace("$", symbol);
}

function formatCompactCurrency(value: number | null, currency: string | null) {
  if (value == null) return "—";
  return formatCurrency(value, currency);
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("es-AR").format(date);
}

function getPhotoUrl(fotos: Vehiculo["fotos"]) {
  if (Array.isArray(fotos)) return fotos[0] ?? null;
  if (typeof fotos === "string") {
    try {
      const parsed = JSON.parse(fotos);
      if (Array.isArray(parsed)) return parsed[0] ?? null;
      return fotos;
    } catch {
      return fotos;
    }
  }
  return null;
}

function getInitials(marca: string | null, modelo: string | null) {
  const first = marca?.trim().charAt(0) ?? "";
  const second = modelo?.trim().charAt(0) ?? "";
  const initials = `${first}${second}`.trim();
  return initials ? initials.toUpperCase() : "VE";
}

function getProviderLabel(vehiculo: Vehiculo, proveedores: Proveedor[]) {
  const provider = proveedores.find((item) => item.id === vehiculo.proveedor_id);
  if (!provider) return vehiculo.proveedor_id ?? "Sin proveedor";
  return provider.categoria ? `${provider.nombre ?? "Proveedor"} · ${provider.categoria}` : provider.nombre ?? "Proveedor";
}

function getCommercialPrice(vehiculo: Vehiculo) {
  return vehiculo.precio_permuta ?? vehiculo.precio_venta;
}

function getDaysInStock(vehiculo: Vehiculo) {
  const source = vehiculo.fecha_compra ?? vehiculo.fecha_ingreso ?? vehiculo.created_at;
  if (!source) return null;
  const start = new Date(source);
  if (Number.isNaN(start.getTime())) return null;
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86400000));
}

function VehicleCard({
  vehiculo,
  proveedores,
  canEdit,
  showCosts,
  showPreparation,
  canDelete,
}: {
  vehiculo: Vehiculo;
  proveedores: Proveedor[];
  canEdit: boolean;
  showCosts: boolean;
  showPreparation: boolean;
  canDelete: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const photoUrl = getPhotoUrl(vehiculo.fotos);
  const initials = getInitials(vehiculo.marca, vehiculo.modelo);

  return (
    <article className="relative rounded-md border border-[#E5E7EB] bg-white transition hover:border-[#D8A1B2]">
      <div className="relative aspect-[16/9] overflow-hidden bg-[#F9FAFB]">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={`${vehiculo.marca ?? "Vehículo"} ${vehiculo.modelo ?? ""}`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center"><span className="text-sm font-semibold tracking-[0.12em] text-[#9CA3AF]">{initials}</span></div>
        )}
        <div className="absolute left-2 top-2"><VehiculoStatusBadge status={vehiculo.estado} /></div>
      </div>
      <div className="space-y-3 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[#111827]">{vehiculo.marca ?? "-"} {vehiculo.modelo ?? ""}</h3>
            <p className="mt-1 text-[11px] text-[#6B7280]">{formatKm(vehiculo.km)} km · {getDaysInStock(vehiculo) ?? "—"} días en stock</p>
          </div>
          <p className="shrink-0 text-right text-xs font-semibold text-[#111827]">{formatCompactCurrency(getCommercialPrice(vehiculo), vehiculo.precio_moneda)}</p>
        </div>
        <button type="button" onClick={() => setExpanded((value) => !value)} className="flex w-full items-center justify-between border-t border-[#E5E7EB] pt-2 text-[11px] font-medium text-[#6B7280] hover:text-[#8A1538]">
          <span>{expanded ? "Ocultar detalles" : "Ver más"}</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        <div className="flex justify-end">
          <ActionMenu>
            <Link href={`/inventario/${vehiculo.id}`} className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm font-medium text-[#111827] hover:bg-[#F9FAFB]"><Eye className="h-4 w-4 text-[#6B7280]" />Ver</Link>
            {canEdit ? <Link href={`/inventario/${vehiculo.id}/editar`} className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm font-medium text-[#111827] hover:bg-[#F9FAFB]"><PencilLine className="h-4 w-4 text-[#6B7280]" />Editar</Link> : null}
            {canDelete ? <VehiculoDeleteButton vehicleId={vehiculo.id} vehicleName={`${vehiculo.marca ?? "Vehículo"} ${vehiculo.modelo ?? ""}`.trim()} /> : null}
          </ActionMenu>
        </div>
        {expanded ? (
          <div className="space-y-2 border-t border-[#E5E7EB] pt-3 text-[11px] text-[#6B7280]">
            <p className="truncate">{[vehiculo.version, vehiculo.anio, vehiculo.dominio].filter(Boolean).join(" · ") || "Sin detalle cargado"}</p>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="rounded-md bg-[#F9FAFB] px-2 py-1.5"><p className="text-[#9CA3AF]">Ubicación</p><p className="mt-0.5 truncate font-medium text-[#374151]">{vehiculo.ubicacion ?? "Sin ubicación"}</p></div>
              <div className="rounded-md bg-[#F9FAFB] px-2 py-1.5"><p className="text-[#9CA3AF]">Ingreso</p><p className="mt-0.5 font-medium text-[#374151]">{formatDate(vehiculo.fecha_ingreso)}</p></div>
            </div>
            {showPreparation ? <p>Preparación: <span className="font-medium text-[#374151]">{vehiculo.estado_preparacion ?? "Sin estado"}</span></p> : null}
            {showCosts ? <p className="truncate">Proveedor: <span className="font-medium text-[#374151]">{getProviderLabel(vehiculo, proveedores)}</span></p> : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function InventarioTable({
  vehiculos,
  proveedores = [],
  canEdit = true,
  role = null,
  toolbarAction,
}: {
  vehiculos: Vehiculo[];
  proveedores?: Proveedor[];
  canEdit?: boolean;
  role?: string | null;
  toolbarAction?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("en_stock");
  const [preparationFilter, setPreparationFilter] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const showCosts = canViewCosts(role);
  const showPreparation = canManageInventory(role);
  const canDelete = (role ?? "").toLowerCase() === "admin";

  const preparationOptions = useMemo(
    () => Array.from(new Set(vehiculos.map((vehiculo) => vehiculo.estado_preparacion).filter(Boolean))).sort(),
    [vehiculos]
  );

  const filteredVehiculos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const minimumPrice = priceFrom ? Number(priceFrom) : null;
    const maximumPrice = priceTo ? Number(priceTo) : null;
    const minimumYear = yearFrom ? Number(yearFrom) : null;
    const maximumYear = yearTo ? Number(yearTo) : null;

    return vehiculos.filter((vehiculo) => {
      if (statusFilter && vehiculo.estado !== statusFilter) return false;
      if (preparationFilter && vehiculo.estado_preparacion !== preparationFilter) return false;
      if (minimumYear != null && (vehiculo.anio == null || vehiculo.anio < minimumYear)) return false;
      if (maximumYear != null && (vehiculo.anio == null || vehiculo.anio > maximumYear)) return false;

      const price = getCommercialPrice(vehiculo);
      if (minimumPrice != null && (price == null || price < minimumPrice)) return false;
      if (maximumPrice != null && (price == null || price > maximumPrice)) return false;

      if (!normalizedQuery) return true;

      const searchable = [
        vehiculo.marca,
        vehiculo.modelo,
        vehiculo.version,
        vehiculo.dominio,
        vehiculo.color,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [preparationFilter, priceFrom, priceTo, query, statusFilter, vehiculos, yearFrom, yearTo]);

  const totalPages = Math.max(1, Math.ceil(filteredVehiculos.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleVehiculos = filteredVehiculos.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <section className="rounded-md border border-[#E5E7EB] bg-white">
      <div className="flex flex-col gap-2 border-b border-[#E5E7EB] p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {toolbarAction ? <div className="shrink-0">{toolbarAction}</div> : null}

          <div className="relative w-full sm:w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar vehículo"
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

          <AdvancedFilters label="Filtros de inventario">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-xs text-[#111827] outline-none focus:border-[#8A1538]"
            >
              <option value="">Todos los estados</option>
              <option value="en_stock">En stock</option>
              <option value="vendido">Vendido</option>
              <option value="en_consignacion">En consignación</option>
              <option value="reservado">Reservado</option>
            </select>
            <select
              value={preparationFilter}
              onChange={(event) => setPreparationFilter(event.target.value)}
              className="h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-xs text-[#111827] outline-none focus:border-[#8A1538]"
            >
              <option value="">Toda la preparación</option>
              {preparationOptions.map((option) => (
                <option key={option} value={option ?? ""}>{option}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                value={yearFrom}
                onChange={(event) => setYearFrom(event.target.value)}
                placeholder="Año desde"
                className="h-9 min-w-0 rounded-md border border-[#E5E7EB] bg-white px-3 text-xs text-[#111827] outline-none focus:border-[#8A1538]"
              />
              <input
                type="number"
                min="0"
                value={yearTo}
                onChange={(event) => setYearTo(event.target.value)}
                placeholder="Año hasta"
                className="h-9 min-w-0 rounded-md border border-[#E5E7EB] bg-white px-3 text-xs text-[#111827] outline-none focus:border-[#8A1538]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                value={priceFrom}
                onChange={(event) => setPriceFrom(event.target.value)}
                placeholder="Precio desde"
                className="h-9 min-w-0 rounded-md border border-[#E5E7EB] bg-white px-3 text-xs text-[#111827] outline-none focus:border-[#8A1538]"
              />
              <input
                type="number"
                min="0"
                value={priceTo}
                onChange={(event) => setPriceTo(event.target.value)}
                placeholder="Precio hasta"
                className="h-9 min-w-0 rounded-md border border-[#E5E7EB] bg-white px-3 text-xs text-[#111827] outline-none focus:border-[#8A1538]"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("en_stock");
                setPreparationFilter("");
                setYearFrom("");
                setYearTo("");
                setPriceFrom("");
                setPriceTo("");
              }}
              className="h-9 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs font-medium text-[#6B7280] transition hover:bg-white"
            >
              Restablecer filtros
            </button>
          </AdvancedFilters>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-md border border-[#E5E7EB] bg-[#F9FAFB] p-0.5" aria-label="Vista de inventario">
            <button type="button" onClick={() => setViewMode("cards")} className={`inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-medium ${viewMode === "cards" ? "bg-white text-[#8A1538] shadow-sm" : "text-[#6B7280]"}`} aria-pressed={viewMode === "cards"}><LayoutGrid className="h-3.5 w-3.5" />Cards</button>
            <button type="button" onClick={() => setViewMode("list")} className={`inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-medium ${viewMode === "list" ? "bg-white text-[#8A1538] shadow-sm" : "text-[#6B7280]"}`} aria-pressed={viewMode === "list"}><List className="h-3.5 w-3.5" />Lista</button>
          </div>
          <p className="hidden text-xs text-[#6B7280] sm:block">{filteredVehiculos.length} de {vehiculos.length} unidades</p>
        </div>
      </div>

      {viewMode === "cards" ? (
        <div className="grid gap-3 p-3 md:grid-cols-3 xl:grid-cols-5">
          {visibleVehiculos.length ? visibleVehiculos.map((vehiculo) => <VehicleCard key={vehiculo.id} vehiculo={vehiculo} proveedores={proveedores} canEdit={canEdit} showCosts={showCosts} showPreparation={showPreparation} canDelete={canDelete} />) : (
            <div className="rounded-md border border-dashed border-[#E5E7EB] px-4 py-14 text-center text-sm text-[#6B7280] md:col-span-2 xl:col-span-3">No hay resultados para mostrar</div>
          )}
        </div>
      ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#E5E7EB]">
          <thead className="bg-[#FAFAFA]">
            <tr className="text-left text-xs font-medium uppercase tracking-[0.08em] text-[#6B7280]">
              <th className="px-4 py-3">Foto</th>
              <th className="px-4 py-3">Vehículo</th>
              <th className="px-4 py-3">Ubicación</th>
              {showCosts ? <th className="px-4 py-3">Compra</th> : null}
              <th className="px-4 py-3">Pricing</th>
              {showPreparation ? <th className="px-4 py-3">Preparación</th> : null}
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Ingreso</th>
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {visibleVehiculos.length ? (
              visibleVehiculos.map((vehiculo) => {
                const photoUrl = getPhotoUrl(vehiculo.fotos);
                const initials = getInitials(vehiculo.marca, vehiculo.modelo);
                return (
                  <tr
                    key={vehiculo.id}
                    className="transition hover:bg-[#F9FAFB]"
                  >
                    <td className="px-4 py-3 align-middle">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border border-[#E5E7EB] bg-[#FAFAFA]">
                        {photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={photoUrl}
                            alt={`${vehiculo.marca ?? "Vehículo"} ${vehiculo.modelo ?? ""}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-semibold tracking-[0.12em] text-[#6B7280]">
                            {initials}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">
                          {vehiculo.marca ?? "-"} {vehiculo.modelo ?? ""}
                        </p>
                        <p className="text-sm text-[#6B7280]">
                          {[vehiculo.version, vehiculo.anio, vehiculo.dominio, vehiculo.motor]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">
                          {vehiculo.ubicacion ?? "Sin ubicación"}
                        </p>
                        <p className="text-sm text-[#6B7280]">
                          {[vehiculo.color, formatKm(vehiculo.km)]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        {showCosts ? (
                          <>
                            <p className="text-sm font-medium text-[#111827]">
                              {getProviderLabel(vehiculo, proveedores)}
                            </p>
                            <p className="text-sm text-[#6B7280]">
                              {vehiculo.fecha_compra ? `Compra ${formatDate(vehiculo.fecha_compra)}` : "Sin fecha de compra"}
                            </p>
                            <p className="text-xs text-[#6B7280]">
                              {vehiculo.costo_adquisicion != null
                                ? `Costo ${formatCompactCurrency(vehiculo.costo_adquisicion, vehiculo.costo_moneda)}`
                                : "Sin costo cargado"}
                            </p>
                            <p className="text-xs text-[#6B7280]">
                              {vehiculo.nro_operacion ? `Op. ${vehiculo.nro_operacion}` : "Sin operación"}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-[#6B7280]">Información interna oculta</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">
                          Permuta {formatCompactCurrency(vehiculo.precio_permuta, vehiculo.precio_moneda)}
                        </p>
                        <p className="text-sm text-[#6B7280]">
                          Contado {formatCompactCurrency(vehiculo.precio_contado, vehiculo.precio_moneda)}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          Venta {formatCompactCurrency(vehiculo.precio_venta, vehiculo.precio_moneda)}
                        </p>
                        {showCosts ? (
                          <p className="text-xs text-[#6B7280]">
                            Infoauto {formatCompactCurrency(vehiculo.precio_infoauto_actual, vehiculo.precio_moneda)}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    {showPreparation ? (
                      <td className="px-4 py-3 align-middle">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-[#111827]">
                            {vehiculo.estado_preparacion ?? "Sin estado"}
                          </p>
                          <p className="text-sm text-[#6B7280]">
                            {vehiculo.chapero ?? "Sin chapero"}
                          </p>
                          {showCosts ? (
                            <p className="text-xs text-[#6B7280]">
                              {vehiculo.costo_reposicion != null
                                ? `Reposición ${formatCompactCurrency(vehiculo.costo_reposicion, vehiculo.costo_moneda)}`
                                : "Sin costo de reposición"}
                            </p>
                          ) : (
                            <p className="text-xs text-[#6B7280]">Uso operativo</p>
                          )}
                        </div>
                      </td>
                    ) : null}
                    <td className="px-4 py-3 align-middle">
                      <VehiculoStatusBadge status={vehiculo.estado} />
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-[#111827]">
                      {formatDate(vehiculo.fecha_ingreso)}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <ActionMenu>
                        <Link
                          href={`/inventario/${vehiculo.id}`}
                          className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
                        >
                          <Eye className="h-4 w-4 text-[#6B7280]" />
                          Ver
                        </Link>
                        {canEdit ? (
                          <Link
                            href={`/inventario/${vehiculo.id}/editar`}
                            className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
                          >
                            <PencilLine className="h-4 w-4 text-[#6B7280]" />
                            Editar
                          </Link>
                        ) : null}
                        {canDelete ? (
                          <VehiculoDeleteButton
                            vehicleId={vehiculo.id}
                            vehicleName={`${vehiculo.marca ?? "Vehículo"} ${vehiculo.modelo ?? ""}`.trim()}
                          />
                        ) : null}
                      </ActionMenu>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={
                    7 + (showCosts ? 1 : 0) + (showPreparation ? 1 : 0)
                  }
                  className="px-4 py-14 text-center"
                >
                  <div className="mx-auto max-w-sm space-y-2">
                    <p className="text-sm font-medium text-[#111827]">
                      No hay resultados para mostrar
                    </p>
                    <p className="text-sm leading-6 text-[#6B7280]">
                      Probá cambiar el filtro o buscar otro vehículo.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      <PaginationControls page={currentPage} totalItems={filteredVehiculos.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </section>
  );
}
