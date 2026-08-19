"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { updateVehiculoCatalogoAction } from "@/app/(dashboard)/catalogo/actions";
import { CatalogoStatusBadge } from "./catalogo-status-badge";
import { PaginationControls } from "@/components/common/pagination-controls";
import { AdvancedFilters } from "@/components/common/advanced-filters";

type Vehiculo = {
  id: string;
  marca: string | null;
  modelo: string | null;
  version: string | null;
  anio: number | null;
  color: string | null;
  km: number | null;
  dominio: string | null;
  precio_venta: number | null;
  precio_moneda: string | null;
  estado: string | null;
  fotos: string[] | string | null;
  catalogo_publicado: boolean | null;
  catalogo_destacado: boolean | null;
  catalogo_titulo: string | null;
  catalogo_descripcion: string | null;
  catalogo_orden: number | null;
  estado_preparacion?: string | null;
  created_at: string | null;
};

type ActionState = {
  error?: string;
  success?: boolean;
};

const initialState: ActionState = {};

const publicationFilters = [
  { value: "", label: "Todos" },
  { value: "publicado", label: "Publicados" },
  { value: "no_publicado", label: "No publicados" },
] as const;
const preparationFilters = [
  { value: "", label: "Toda preparación" },
  { value: "sin_preparar", label: "Sin preparar" },
  { value: "en_preparacion", label: "En preparación" },
  { value: "listo", label: "Listo" },
] as const;
const PAGE_SIZE = 10;

function FieldLabel({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-medium uppercase tracking-[0.08em] text-[#6B7280]">
      {children}
    </label>
  );
}

function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]",
        className,
      ].join(" ")}
    />
  );
}

function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[
        "min-h-[72px] w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]",
        className,
      ].join(" ")}
    />
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center rounded-md bg-[#8A1538] px-4 text-sm font-medium text-white transition hover:bg-[#6F102D] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Guardando..." : "Guardar"}
    </button>
  );
}

function formatKm(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("es-AR").format(value);
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

function getVehicleTitle(vehicle: Vehiculo) {
  return vehicle.catalogo_titulo?.trim() || `${vehicle.marca ?? "-"} ${vehicle.modelo ?? ""}`.trim();
}

function getVehicleSubtitle(vehicle: Vehiculo) {
  return [vehicle.version, vehicle.anio ? String(vehicle.anio) : null, vehicle.dominio]
    .filter(Boolean)
    .join(" · ");
}

function getSearchableText(vehicle: Vehiculo) {
  return [
    vehicle.marca,
    vehicle.modelo,
    vehicle.version,
    vehicle.dominio,
    vehicle.color,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function CatalogoCard({
  vehicle,
}: {
  vehicle: Vehiculo;
}) {
  const [state, formAction] = useFormState(updateVehiculoCatalogoAction, initialState);
  const [feedback, setFeedback] = useState<string | null>(null);
  const photoUrl = getPhotoUrl(vehicle.fotos);
  const initials = getInitials(vehicle.marca, vehicle.modelo);

  useEffect(() => {
    if (state.success) {
      setFeedback("Guardado");
      const timeout = window.setTimeout(() => setFeedback(null), 2000);
      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, [state]);

  return (
    <article className="overflow-hidden rounded-md border border-[#E5E7EB] bg-white transition hover:border-[#D8A1B2]">
      <div className="relative aspect-[16/9] overflow-hidden bg-[#F9FAFB]">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={`${vehicle.marca ?? "Vehículo"} ${vehicle.modelo ?? ""}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-sm font-semibold tracking-[0.12em] text-[#9CA3AF]">
              {initials}
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <CatalogoStatusBadge
            status={vehicle.catalogo_publicado ? "publicado" : "no_publicado"}
          />
          {vehicle.catalogo_destacado ? <CatalogoStatusBadge status="destacado" /> : null}
        </div>
      </div>

      <form action={formAction} className="space-y-4 p-4">
        <input type="hidden" name="vehiculo_id" value={vehicle.id} />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="truncate text-base font-semibold text-[#111827]">{getVehicleTitle(vehicle)}</p>
            {getVehicleSubtitle(vehicle) ? (
              <p className="truncate text-xs text-[#6B7280]">{getVehicleSubtitle(vehicle)}</p>
            ) : null}
            {vehicle.estado !== "en_stock" ? (
              <p className="text-xs font-medium text-[#B45309]">No está en stock</p>
            ) : null}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-semibold text-[#111827]">
              {formatMoney(vehicle.precio_venta, vehicle.precio_moneda)}
            </p>
            <p className="text-xs text-[#6B7280]">{formatKm(vehicle.km)} km</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md bg-[#F9FAFB] px-3 py-2 text-xs">
          <span className="text-[#6B7280]">Estado</span>
          <span className="font-medium text-[#111827]">
            {vehicle.estado ?? "—"} · {vehicle.estado_preparacion ?? "Sin preparar"}
          </span>
        </div>

        <div className="grid gap-3">
          <div className="space-y-1">
            <FieldLabel htmlFor={`catalogo-${vehicle.id}-titulo`}>Título público</FieldLabel>
            <Input
              id={`catalogo-${vehicle.id}-titulo`}
              name="catalogo_titulo"
              defaultValue={vehicle.catalogo_titulo ?? ""}
              placeholder={`${vehicle.marca ?? "Vehículo"} ${vehicle.modelo ?? ""}`.trim()}
            />
          </div>
          <div className="space-y-1">
            <FieldLabel htmlFor={`catalogo-${vehicle.id}-descripcion`}>Descripción pública</FieldLabel>
            <Textarea
              id={`catalogo-${vehicle.id}-descripcion`}
              name="catalogo_descripcion"
              defaultValue={vehicle.catalogo_descripcion ?? ""}
              placeholder="Descripción visible en la web"
            />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex items-center gap-2 rounded-md border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827]">
            <input
              name="catalogo_publicado"
              type="checkbox"
              defaultChecked={Boolean(vehicle.catalogo_publicado)}
              className="h-4 w-4 rounded border-[#D1D5DB] text-[#8A1538] focus:ring-[#E9B8C6]"
            />
            Publicado
          </label>
          <label className="flex items-center gap-2 rounded-md border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827]">
            <input
              name="catalogo_destacado"
              type="checkbox"
              defaultChecked={Boolean(vehicle.catalogo_destacado)}
              className="h-4 w-4 rounded border-[#D1D5DB] text-[#8A1538] focus:ring-[#E9B8C6]"
            />
            Destacado
          </label>
        </div>

        <div className="flex items-end gap-3">
          <div className="w-28 space-y-1">
            <FieldLabel htmlFor={`catalogo-${vehicle.id}-orden`}>Orden</FieldLabel>
            <Input
              id={`catalogo-${vehicle.id}-orden`}
              name="catalogo_orden"
              type="number"
              min="0"
              step="1"
              defaultValue={vehicle.catalogo_orden ?? ""}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-wrap justify-end gap-2">
            <SubmitButton />
            {vehicle.catalogo_publicado ? (
              <Link
                href={`/catalogo/${vehicle.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
              >
                Ver
              </Link>
            ) : null}
          </div>
        </div>

        {state.error ? <p className="text-xs leading-5 text-[#B45309]">{state.error}</p> : null}
        {feedback ? <p className="text-xs text-[#6B7280]">{feedback}</p> : null}
      </form>
    </article>
  );
}

export function CatalogoVehiculosTable({
  vehiculos,
  toolbarAction,
}: {
  vehiculos: Vehiculo[];
  toolbarAction?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [publicationFilter, setPublicationFilter] = useState<(typeof publicationFilters)[number]["value"]>("");
  const [preparationFilter, setPreparationFilter] = useState<(typeof preparationFilters)[number]["value"]>("");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [onlyStock, setOnlyStock] = useState(true);
  const [page, setPage] = useState(1);

  const filteredVehiculos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return vehiculos.filter((vehicle) => {
      if (onlyStock && vehicle.estado !== "en_stock") return false;
      if (publicationFilter === "publicado" && !vehicle.catalogo_publicado) return false;
      if (publicationFilter === "no_publicado" && vehicle.catalogo_publicado) return false;
      if (preparationFilter && vehicle.estado_preparacion !== preparationFilter) return false;
      if (onlyFeatured && !vehicle.catalogo_destacado) return false;

      const year = vehicle.anio ?? 0;
      const minYearValue = minYear ? Number(minYear) : null;
      const maxYearValue = maxYear ? Number(maxYear) : null;
      const price = vehicle.precio_venta ?? 0;
      const minPriceValue = minPrice ? Number(minPrice) : null;
      const maxPriceValue = maxPrice ? Number(maxPrice) : null;
      if (minYearValue != null && Number.isFinite(minYearValue) && year < minYearValue) return false;
      if (maxYearValue != null && Number.isFinite(maxYearValue) && year > maxYearValue) return false;
      if (minPriceValue != null && Number.isFinite(minPriceValue) && price < minPriceValue) return false;
      if (maxPriceValue != null && Number.isFinite(maxPriceValue) && price > maxPriceValue) return false;

      if (!normalizedQuery) return true;

      return getSearchableText(vehicle).includes(normalizedQuery);
    });
  }, [maxPrice, maxYear, minPrice, minYear, onlyFeatured, onlyStock, preparationFilter, publicationFilter, query, vehiculos]);

  useEffect(() => {
    setPage(1);
  }, [maxPrice, maxYear, minPrice, minYear, onlyFeatured, onlyStock, preparationFilter, publicationFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filteredVehiculos.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleVehiculos = filteredVehiculos.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <section className="rounded-md border border-[#E5E7EB] bg-white">
      <div className="border-b border-[#E5E7EB] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {toolbarAction ? <div className="flex flex-wrap gap-2">{toolbarAction}</div> : null}
          <div className="relative min-w-[260px] flex-1 sm:w-[320px] sm:flex-none">
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

          <AdvancedFilters label="Filtros del catálogo">
            <label className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-2 text-xs text-[#111827]">
              <input
                type="checkbox"
                checked={onlyStock}
                onChange={(event) => setOnlyStock(event.target.checked)}
                className="h-4 w-4 rounded border-[#D1D5DB] text-[#8A1538] focus:ring-[#E9B8C6]"
              />
              Solo unidades en stock
            </label>
            <select
              value={publicationFilter}
              onChange={(event) => setPublicationFilter(event.target.value as (typeof publicationFilters)[number]["value"])}
              className="h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-xs text-[#111827] outline-none focus:border-[#8A1538]"
            >
              {publicationFilters.map((option) => <option key={option.value || "all"} value={option.value}>{option.label}</option>)}
            </select>
            <select
              value={preparationFilter}
              onChange={(event) => setPreparationFilter(event.target.value as (typeof preparationFilters)[number]["value"])}
              className="h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-xs text-[#111827] outline-none focus:border-[#8A1538]"
            >
              {preparationFilters.map((option) => <option key={option.value || "all-preparation"} value={option.value}>{option.label}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <Input value={minYear} onChange={(event) => setMinYear(event.target.value)} type="number" placeholder="Año desde" aria-label="Año desde" />
              <Input value={maxYear} onChange={(event) => setMaxYear(event.target.value)} type="number" placeholder="Año hasta" aria-label="Año hasta" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input value={minPrice} onChange={(event) => setMinPrice(event.target.value)} type="number" placeholder="Precio desde" aria-label="Precio desde" />
              <Input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} type="number" placeholder="Precio hasta" aria-label="Precio hasta" />
            </div>
            <label className="flex items-center gap-2 px-1 py-1 text-xs text-[#111827]">
              <input
                type="checkbox"
                checked={onlyFeatured}
                onChange={(event) => setOnlyFeatured(event.target.checked)}
                className="h-4 w-4 rounded border-[#D1D5DB] text-[#8A1538] focus:ring-[#E9B8C6]"
              />
              Solo destacados
            </label>
          </AdvancedFilters>
        </div>
        <p className="text-xs text-[#6B7280]">
          Mostrando {visibleVehiculos.length} de {filteredVehiculos.length}
        </p>
        </div>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredVehiculos.length ? (
          visibleVehiculos.map((vehicle) => (
            <CatalogoCard key={vehicle.id} vehicle={vehicle} />
          ))
        ) : (
          <div className="rounded-md border border-dashed border-[#E5E7EB] px-4 py-14 text-center text-sm text-[#6B7280] md:col-span-2 xl:col-span-3">
            No hay vehículos que coincidan con los filtros.
          </div>
        )}
      </div>

      <PaginationControls
        page={currentPage}
        totalItems={filteredVehiculos.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </section>
  );
}
