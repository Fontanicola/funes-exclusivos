"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { CajaTipoBadge } from "./caja-tipo-badge";

type Proveedor = {
  id: string;
  nombre: string | null;
  categoria: string | null;
};

type Activo = {
  id: string;
  tipo: string | null;
  nombre: string | null;
};

type Movimiento = {
  id: string;
  tipo: string | null;
  origen?: string | null;
  compra_id?: string | null;
  venta_id?: string | null;
  venta_pago_id?: string | null;
  comision_liquidacion_id?: string | null;
  monto: number | null;
  importe?: number | null;
  moneda: string | null;
  fecha: string | null;
  medio?: string | null;
  concepto?: string | null;
  detalle_1: string | null;
  detalle_2: string | null;
  detalle_3: string | null;
  periodo?: string | null;
  cuenta?: string | null;
  observaciones: string | null;
  created_at: string | null;
  proveedor: Proveedor | null;
  activo: Activo | null;
  compra?: {
    id: string;
    nro_operacion: string | null;
    fecha: string | null;
    vehiculo: {
      id: string;
      marca: string | null;
      modelo: string | null;
      dominio: string | null;
    } | null;
    proveedor: {
      id: string;
      nombre: string | null;
    } | null;
  } | null;
  venta?: {
    id: string;
    cliente_nombre: string | null;
    vehiculo: {
      id: string;
      marca: string | null;
      modelo: string | null;
      version: string | null;
      anio: number | null;
      dominio: string | null;
    } | null;
  } | null;
  liquidacion?: {
    id: string;
    periodo: string | null;
    neto_a_cobrar: number | null;
    vendedor: {
      id: string;
      nombre: string | null;
      email: string | null;
    } | null;
  } | null;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatMoney(value: number, currency: string | null) {
  const normalizedCurrency = (currency ?? "").toUpperCase() === "USD" ? "USD" : "ARS";
  const symbol = normalizedCurrency === "USD" ? "US$" : "$";
  const formatted = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(Math.abs(value));

  return `${value >= 0 ? "+" : "-"}${symbol} ${formatted}`;
}

function relationSearchValue(proveedor: Proveedor | null, activo: Activo | null) {
  return [proveedor?.nombre, proveedor?.categoria, activo?.nombre, activo?.tipo]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function relationCompraValue(compra: Movimiento["compra"] | null | undefined) {
  return [compra?.proveedor?.nombre, compra?.nro_operacion, compra?.vehiculo?.marca, compra?.vehiculo?.modelo, compra?.vehiculo?.dominio]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function formatMedium(value: string | null | undefined) {
  if (!value) return "—";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatOrigin(value: string | null | undefined) {
  switch ((value ?? "").toLowerCase()) {
    case "venta":
      return "Venta";
    case "compra":
      return "Compra";
    case "comision":
      return "Comisión";
    case "ajuste":
      return "Ajuste";
    case "manual":
    default:
      return "Manual";
  }
}

function sameSearch(value: string) {
  return value.toLowerCase();
}

export function CajaMovimientosTable({ movimientos }: { movimientos: Movimiento[] }) {
  const [query, setQuery] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [origenFilter, setOrigenFilter] = useState("");
  const [monedaFilter, setMonedaFilter] = useState("");

  const filtered = useMemo(() => {
    const normalizedQuery = sameSearch(query.trim());

    return movimientos.filter((movimiento) => {
      const searchHaystack = [
        movimiento.origen,
        movimiento.medio,
        movimiento.concepto,
        movimiento.detalle_1,
        movimiento.detalle_2,
        movimiento.detalle_3,
        movimiento.periodo,
        movimiento.cuenta,
        movimiento.proveedor?.nombre,
        movimiento.proveedor?.categoria,
        movimiento.activo?.nombre,
        movimiento.activo?.tipo,
        movimiento.compra?.nro_operacion,
        movimiento.compra?.vehiculo?.marca,
        movimiento.compra?.vehiculo?.modelo,
        movimiento.compra?.vehiculo?.dominio,
        relationCompraValue(movimiento.compra),
        movimiento.venta?.cliente_nombre,
        movimiento.venta?.vehiculo?.marca,
        movimiento.venta?.vehiculo?.modelo,
        movimiento.venta?.vehiculo?.dominio,
        movimiento.liquidacion?.periodo,
        movimiento.liquidacion?.vendedor?.nombre,
        movimiento.liquidacion?.vendedor?.email,
        relationSearchValue(movimiento.proveedor, movimiento.activo),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        !normalizedQuery ||
        searchHaystack.includes(normalizedQuery);
      const matchesTipo = !tipoFilter || movimiento.tipo === tipoFilter;
      const matchesOrigen = !origenFilter || (movimiento.origen ?? "manual") === origenFilter;
      const matchesMoneda = !monedaFilter || (movimiento.moneda ?? "").toUpperCase() === monedaFilter;

      return matchesQuery && matchesTipo && matchesOrigen && matchesMoneda;
    });
  }, [movimientos, monedaFilter, origenFilter, query, tipoFilter]);

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="border-b border-[#E5E7EB] px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#111827]">Movimientos</h2>
            <p className="text-sm text-[#6B7280]">Listado compacto con filtros rápidos.</p>
          </div>

          <div className="grid gap-2 md:grid-cols-4 lg:min-w-[720px]">
            <input
              value={query}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
              className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
              placeholder="Buscar por detalle, proveedor o activo"
            />
            <select
              value={tipoFilter}
              onChange={(event) => setTipoFilter(event.target.value)}
              className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
            >
              <option value="">Todos los tipos</option>
              <option value="ingreso">Ingreso</option>
              <option value="egreso">Egreso</option>
            </select>
            <select
              value={origenFilter}
              onChange={(event) => setOrigenFilter(event.target.value)}
              className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
            >
              <option value="">Todos los orígenes</option>
              <option value="manual">Manual</option>
              <option value="venta">Venta</option>
              <option value="compra">Compra</option>
              <option value="comision">Comisión</option>
              <option value="ajuste">Ajuste</option>
            </select>
            <select
              value={monedaFilter}
              onChange={(event) => setMonedaFilter(event.target.value)}
              className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
            >
              <option value="">Todas las monedas</option>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#E5E7EB] text-left text-sm">
          <thead className="bg-[#FAFAFA] text-xs uppercase tracking-[0.14em] text-[#6B7280]">
            <tr>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Origen</th>
              <th className="px-4 py-3 font-medium">Medio</th>
              <th className="px-4 py-3 font-medium">Concepto</th>
              <th className="px-4 py-3 font-medium">Detalle 1</th>
              <th className="px-4 py-3 font-medium">Detalle 2</th>
              <th className="px-4 py-3 font-medium">Detalle 3 / Proveedor</th>
              <th className="px-4 py-3 font-medium">Cuenta / Período</th>
              <th className="px-4 py-3 font-medium">Activo / Compra</th>
              <th className="px-4 py-3 font-medium">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {filtered.length ? (
              filtered.map((movimiento) => (
                <tr key={movimiento.id} className="transition hover:bg-[#F9FAFB]">
                  <td className="whitespace-nowrap px-4 py-3 text-[#111827]">
                    {formatDate(movimiento.fecha)}
                  </td>
                  <td className="px-4 py-3">
                    <CajaTipoBadge tipo={movimiento.tipo} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-[#111827]">{formatOrigin(movimiento.origen)}</p>
                      {movimiento.origen === "venta" ? (
                        <p className="text-xs text-[#6B7280]">Generado por venta</p>
                      ) : null}
                      {movimiento.origen === "compra" ? (
                        <p className="text-xs text-[#6B7280]">Generado por compra</p>
                      ) : null}
                      {movimiento.origen === "comision" ? (
                        <p className="text-xs text-[#6B7280]">Pago de liquidación</p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#111827]">{formatMedium(movimiento.medio)}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-[#111827]">{movimiento.concepto ?? "—"}</p>
                      <p className="text-xs text-[#6B7280]">{movimiento.periodo ?? "Sin período"}</p>
                      {movimiento.liquidacion ? (
                        <p className="text-xs text-[#6B7280]">
                          {movimiento.liquidacion.vendedor?.nombre ?? movimiento.liquidacion.vendedor?.email ?? "Vendedor"} ·{" "}
                          {movimiento.liquidacion.periodo ?? "Sin período"}
                        </p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#111827]">{movimiento.detalle_1 ?? "—"}</td>
                  <td className="px-4 py-3 text-[#111827]">{movimiento.detalle_2 ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-[#111827]">{movimiento.detalle_3 ?? "—"}</p>
                      <p className="text-xs text-[#6B7280]">
                        {movimiento.proveedor
                          ? movimiento.proveedor.categoria
                            ? `${movimiento.proveedor.nombre ?? "Proveedor"} · ${movimiento.proveedor.categoria}`
                            : movimiento.proveedor.nombre ?? "Proveedor"
                          : "Sin proveedor"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-[#111827]">{movimiento.cuenta ?? "—"}</p>
                      <p className="text-xs text-[#6B7280]">{movimiento.periodo ?? "—"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#111827]">
                    {movimiento.compra?.vehiculo?.marca || movimiento.compra?.vehiculo?.modelo
                      ? `${movimiento.compra?.vehiculo?.marca ?? ""} ${movimiento.compra?.vehiculo?.modelo ?? ""}`.trim()
                      : movimiento.liquidacion
                        ? "Liquidación"
                        : movimiento.activo?.nombre ?? "—"}
                    {movimiento.compra?.nro_operacion ? (
                      <p className="text-xs text-[#6B7280]">{movimiento.compra.nro_operacion}</p>
                    ) : null}
                    {movimiento.compra?.proveedor?.nombre ? (
                      <p className="text-xs text-[#6B7280]">{movimiento.compra.proveedor.nombre}</p>
                    ) : null}
                    {movimiento.liquidacion ? (
                      <>
                        <p className="text-xs text-[#6B7280]">
                          {movimiento.liquidacion.vendedor?.nombre ?? movimiento.liquidacion.vendedor?.email ?? "Vendedor"}
                        </p>
                        <p className="text-xs text-[#6B7280]">{movimiento.liquidacion.periodo ?? "Sin período"}</p>
                      </>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-[#111827]">
                    {formatMoney(
                      movimiento.tipo === "egreso"
                        ? -((movimiento.importe ?? movimiento.monto) ?? 0)
                        : (movimiento.importe ?? movimiento.monto) ?? 0,
                      movimiento.moneda
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="px-4 py-14 text-center text-sm text-[#6B7280]">
                  No hay movimientos que coincidan con los filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
