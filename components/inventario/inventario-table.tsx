"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, PencilLine, Search, SlidersHorizontal, X } from "lucide-react";
import { VehiculoStatusBadge } from "./vehiculo-status-badge";

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

function getExternalBadge(value: boolean | null) {
  return value ? "border-[#D1FAE5] bg-[#ECFDF5] text-[#065F46]" : "border-[#E5E7EB] bg-[#FAFAFA] text-[#6B7280]";
}

export function InventarioTable({
  vehiculos,
  proveedores = [],
  canEdit = true,
}: {
  vehiculos: Vehiculo[];
  proveedores?: Proveedor[];
  canEdit?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [onlyStock, setOnlyStock] = useState(false);

  const filteredVehiculos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return vehiculos.filter((vehiculo) => {
      if (onlyStock && vehiculo.estado !== "en_stock") {
        return false;
      }

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
  }, [onlyStock, query, vehiculos]);

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#E5E7EB] p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">Vehículos</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Filtrá por marca, modelo, versión, dominio o color.
          </p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative w-full md:w-[320px]">
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

          <button
            type="button"
            onClick={() => setOnlyStock((current) => !current)}
            className={[
              "inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition",
              onlyStock
                ? "border-[#E5E7EB] bg-[#111827] text-white hover:bg-[#1F2937]"
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
              <th className="px-4 py-3">Ubicación</th>
              <th className="px-4 py-3">Compra</th>
              <th className="px-4 py-3">Pricing</th>
              <th className="px-4 py-3">Preparación</th>
              <th className="px-4 py-3">Publicación</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Ingreso</th>
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {filteredVehiculos.length ? (
              filteredVehiculos.map((vehiculo) => {
                const photoUrl = getPhotoUrl(vehiculo.fotos);
                const initials = getInitials(vehiculo.marca, vehiculo.modelo);
                const publishedMl = Boolean(vehiculo.publicado_mercadolibre);
                const publishedRg = Boolean(vehiculo.publicado_rodados_google);

                return (
                  <tr
                    key={vehiculo.id}
                    className="transition hover:bg-[#F9FAFB]"
                  >
                    <td className="px-4 py-3 align-middle">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FAFAFA]">
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
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">
                          Contado {formatCompactCurrency(vehiculo.precio_contado, vehiculo.precio_moneda)}
                        </p>
                        <p className="text-sm text-[#6B7280]">
                          Permuta {formatCompactCurrency(vehiculo.precio_permuta, vehiculo.precio_moneda)}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          Infoauto {formatCompactCurrency(vehiculo.precio_infoauto_actual, vehiculo.precio_moneda)}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          Venta {formatCompactCurrency(vehiculo.precio_venta, vehiculo.precio_moneda)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">
                          {vehiculo.estado_preparacion ?? "Sin estado"}
                        </p>
                        <p className="text-sm text-[#6B7280]">
                          {vehiculo.chapero ?? "Sin chapero"}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {vehiculo.costo_reposicion != null
                            ? `Reposición ${formatCompactCurrency(vehiculo.costo_reposicion, vehiculo.costo_moneda)}`
                            : "Sin costo de reposición"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getExternalBadge(vehiculo.publicado_mercadolibre)}`}>
                          ML {publishedMl ? "Sí" : "No"}
                        </span>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getExternalBadge(vehiculo.publicado_rodados_google)}`}>
                          RG {publishedRg ? "Sí" : "No"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <VehiculoStatusBadge status={vehiculo.estado} />
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-[#111827]">
                      {formatDate(vehiculo.fecha_ingreso)}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/inventario/${vehiculo.id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
                        >
                          <Eye className="h-4 w-4 text-[#6B7280]" />
                          Ver
                        </Link>
                        {canEdit ? (
                          <Link
                            href={`/inventario/${vehiculo.id}/editar`}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
                          >
                            <PencilLine className="h-4 w-4 text-[#6B7280]" />
                            Editar
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="px-4 py-14 text-center">
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
    </section>
  );
}
