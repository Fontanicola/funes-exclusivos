"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { updateVehiculoCatalogoAction } from "@/app/(dashboard)/catalogo/actions";
import { CatalogoStatusBadge } from "./catalogo-status-badge";

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
        "h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]",
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
        "min-h-[72px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]",
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
      className="inline-flex h-10 items-center justify-center rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A] disabled:cursor-not-allowed disabled:opacity-70"
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

function CatalogoRow({
  vehicle,
}: {
  vehicle: Vehiculo;
}) {
  const [state, formAction] = useFormState(updateVehiculoCatalogoAction, initialState);
  const [feedback, setFeedback] = useState<string | null>(null);
  const formId = `catalogo-vehiculo-${vehicle.id}`;
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
    <tr className="transition hover:bg-[#F9FAFB]">
      <td className="px-4 py-4 align-top">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FAFAFA]">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={`${vehicle.marca ?? "Vehículo"} ${vehicle.modelo ?? ""}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs font-semibold tracking-[0.12em] text-[#6B7280]">
              {initials}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-4 align-top">
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#111827]">{getVehicleTitle(vehicle)}</p>
            {vehicle.catalogo_descripcion ? (
              <p className="text-sm text-[#6B7280]">{vehicle.catalogo_descripcion}</p>
            ) : null}
            {getVehicleSubtitle(vehicle) ? (
              <p className="text-xs text-[#6B7280]">{getVehicleSubtitle(vehicle)}</p>
            ) : null}
            {vehicle.estado !== "en_stock" ? (
              <p className="text-xs font-medium text-[#6B7280]">No está en stock</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <div className="space-y-1">
              <FieldLabel htmlFor={`${formId}-titulo`}>Título público</FieldLabel>
              <Input
                id={`${formId}-titulo`}
                name="catalogo_titulo"
                form={formId}
                defaultValue={vehicle.catalogo_titulo ?? ""}
                placeholder={`${vehicle.marca ?? "Vehículo"} ${vehicle.modelo ?? ""}`.trim()}
              />
            </div>
            <div className="space-y-1">
              <FieldLabel htmlFor={`${formId}-descripcion`}>Descripción pública</FieldLabel>
              <Textarea
                id={`${formId}-descripcion`}
                name="catalogo_descripcion"
                form={formId}
                defaultValue={vehicle.catalogo_descripcion ?? ""}
                placeholder="Descripción visible en la web"
              />
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 align-top">
        <p className="text-sm font-medium text-[#111827]">{vehicle.estado ?? "—"}</p>
      </td>
      <td className="px-4 py-4 align-top">
        <div className="space-y-3">
          <CatalogoStatusBadge
            status={vehicle.catalogo_publicado ? "publicado" : "no_publicado"}
          />
          <label
            htmlFor={`${formId}-publicado`}
            className="flex items-center gap-2 text-sm text-[#111827]"
          >
            <input
              id={`${formId}-publicado`}
              name="catalogo_publicado"
              form={formId}
              type="checkbox"
              defaultChecked={Boolean(vehicle.catalogo_publicado)}
              className="h-4 w-4 rounded border-[#D1D5DB] text-[#18181B] focus:ring-[#D1D5DB]"
            />
            Publicado
          </label>
        </div>
      </td>
      <td className="px-4 py-4 align-top">
        <div className="space-y-3">
          {vehicle.catalogo_destacado ? (
            <CatalogoStatusBadge status="destacado" />
          ) : (
            <span className="text-sm text-[#6B7280]">—</span>
          )}
          <label
            htmlFor={`${formId}-destacado`}
            className="flex items-center gap-2 text-sm text-[#111827]"
          >
            <input
              id={`${formId}-destacado`}
              name="catalogo_destacado"
              form={formId}
              type="checkbox"
              defaultChecked={Boolean(vehicle.catalogo_destacado)}
              className="h-4 w-4 rounded border-[#D1D5DB] text-[#18181B] focus:ring-[#D1D5DB]"
            />
            Destacado
          </label>
        </div>
      </td>
      <td className="px-4 py-4 align-top">
        <div className="space-y-1">
          <FieldLabel htmlFor={`${formId}-orden`}>Orden</FieldLabel>
          <Input
            id={`${formId}-orden`}
            name="catalogo_orden"
            form={formId}
            type="number"
            min="0"
            step="1"
            defaultValue={vehicle.catalogo_orden ?? ""}
            className="max-w-[100px]"
          />
        </div>
      </td>
      <td className="px-4 py-4 align-top">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[#111827]">{formatMoney(vehicle.precio_venta, vehicle.precio_moneda)}</p>
          <p className="text-xs text-[#6B7280]">{formatKm(vehicle.km)} km</p>
        </div>
      </td>
      <td className="px-4 py-4 align-top">
        <div className="space-y-2">
          <form id={formId} action={formAction} className="space-y-2">
            <input type="hidden" name="vehiculo_id" value={vehicle.id} />
            <SubmitButton />
          </form>
          {state.error ? (
            <p className="max-w-[180px] text-xs leading-5 text-[#B45309]">{state.error}</p>
          ) : null}
          {feedback ? <p className="text-xs text-[#6B7280]">{feedback}</p> : null}
        </div>
      </td>
    </tr>
  );
}

export function CatalogoVehiculosTable({ vehiculos }: { vehiculos: Vehiculo[] }) {
  const [query, setQuery] = useState("");
  const [publicationFilter, setPublicationFilter] = useState<(typeof publicationFilters)[number]["value"]>("");
  const [onlyStock, setOnlyStock] = useState(false);

  const filteredVehiculos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return vehiculos.filter((vehicle) => {
      if (onlyStock && vehicle.estado !== "en_stock") return false;
      if (publicationFilter === "publicado" && !vehicle.catalogo_publicado) return false;
      if (publicationFilter === "no_publicado" && vehicle.catalogo_publicado) return false;

      if (!normalizedQuery) return true;

      return getSearchableText(vehicle).includes(normalizedQuery);
    });
  }, [onlyStock, publicationFilter, query, vehiculos]);

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#E5E7EB] p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">Vehículos del catálogo</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Editá publicación, destacado, orden y contenido visible.
          </p>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative w-full lg:w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar vehículo"
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
            value={publicationFilter}
            onChange={(event) =>
              setPublicationFilter(event.target.value as (typeof publicationFilters)[number]["value"])
            }
            className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          >
            {publicationFilters.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setOnlyStock((current) => !current)}
            className={[
              "inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition",
              onlyStock
                ? "border-[#E5E7EB] bg-[#18181B] text-white hover:bg-[#27272A]"
                : "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]",
            ].join(" ")}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Solo stock
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#E5E7EB]">
          <thead className="bg-[#FAFAFA]">
            <tr className="text-left text-xs font-medium uppercase tracking-[0.08em] text-[#6B7280]">
              <th className="px-4 py-3">Foto</th>
              <th className="px-4 py-3">Vehículo</th>
              <th className="px-4 py-3">Estado inventario</th>
              <th className="px-4 py-3">Publicación</th>
              <th className="px-4 py-3">Destacado</th>
              <th className="px-4 py-3">Orden</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {filteredVehiculos.length ? (
              filteredVehiculos.map((vehicle) => (
                <CatalogoRow key={vehicle.id} vehicle={vehicle} />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center text-sm text-[#6B7280]">
                  No hay vehículos que coincidan con los filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
