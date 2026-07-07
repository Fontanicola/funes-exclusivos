"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { VehiculoStatusBadge } from "@/components/inventario/vehiculo-status-badge";

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

export function ComprasTable({ compras }: { compras: Compra[] }) {
  const [query, setQuery] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState<(typeof currencyFilters)[number]>("");
  const [withDebt, setWithDebt] = useState(false);

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

  return (
    <section className="rounded-[28px] border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#E5E7EB] p-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">Compras de vehículos</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Buscá por proveedor, dominio, marca, modelo o número de operación.
          </p>
        </div>

        <div className="grid gap-2 xl:grid-cols-[320px_180px_170px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar compra"
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

          <div className="relative">
            <select
              value={currencyFilter}
              onChange={(event) => setCurrencyFilter(event.target.value as (typeof currencyFilters)[number])}
              className="h-10 w-full appearance-none rounded-xl border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
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
              "inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition",
              withDebt
                ? "border-[#111827] bg-[#111827] text-white"
                : "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]",
            ].join(" ")}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Con deuda
          </button>
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
            {filteredCompras.length ? (
              filteredCompras.map((compra) => {
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
                    <p className="text-sm font-medium text-[#111827]">No hay resultados para mostrar</p>
                    <p className="text-sm text-[#6B7280]">Probá limpiando filtros o cargando nuevas compras.</p>
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
