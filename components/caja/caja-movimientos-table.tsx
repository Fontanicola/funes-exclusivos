"use client";

import { Fragment, useMemo, useState } from "react";
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

function movementReference(movimiento: Movimiento) {
  const parts = [movimiento.detalle_1, movimiento.detalle_2, movimiento.detalle_3]
    .filter(Boolean)
    .map((part) => part?.trim())
    .filter(Boolean) as string[];

  if (!parts.length) return "—";

  return parts[0];
}

function movementReferenceDetail(movimiento: Movimiento) {
  const parts = [movimiento.detalle_2, movimiento.detalle_3]
    .filter(Boolean)
    .map((part) => part?.trim())
    .filter(Boolean) as string[];

  if (movimiento.proveedor?.nombre) {
    parts.push(movimiento.proveedor.categoria ? `${movimiento.proveedor.nombre} · ${movimiento.proveedor.categoria}` : movimiento.proveedor.nombre);
  }

  return parts.join(" · ");
}

function linkedValue(movimiento: Movimiento) {
  if (movimiento.compra?.vehiculo?.marca || movimiento.compra?.vehiculo?.modelo) {
    return `${movimiento.compra?.vehiculo?.marca ?? ""} ${movimiento.compra?.vehiculo?.modelo ?? ""}`.trim();
  }

  if (movimiento.liquidacion) {
    return "Liquidación";
  }

  if (movimiento.venta?.cliente_nombre) {
    return movimiento.venta.cliente_nombre;
  }

  if (movimiento.activo?.nombre) {
    return movimiento.activo.nombre;
  }

  return "—";
}

export function CajaMovimientosTable({ movimientos }: { movimientos: Movimiento[] }) {
  const [query, setQuery] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [origenFilter, setOrigenFilter] = useState("");
  const [monedaFilter, setMonedaFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const MAX_VISIBLE_ROWS = 200;

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return movimientos.filter((movimiento) => {
      const searchHaystack = [
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
        movementReferenceDetail(movimiento),
        movimiento.liquidacion?.periodo,
        movimiento.liquidacion?.vendedor?.nombre,
        movimiento.liquidacion?.vendedor?.email,
        relationSearchValue(movimiento.proveedor, movimiento.activo),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = !normalizedQuery || searchHaystack.includes(normalizedQuery);
      const matchesTipo = !tipoFilter || movimiento.tipo === tipoFilter;
      const matchesOrigen = !origenFilter || (movimiento.origen ?? "manual") === origenFilter;
      const matchesMoneda = !monedaFilter || (movimiento.moneda ?? "").toUpperCase() === monedaFilter;

      return matchesQuery && matchesTipo && matchesOrigen && matchesMoneda;
    });
  }, [movimientos, monedaFilter, origenFilter, query, tipoFilter]);

  const visibleMovimientos = filtered.slice(0, MAX_VISIBLE_ROWS);
  const hasMoreRows = filtered.length > MAX_VISIBLE_ROWS;

  return (
    <section className="rounded-md border border-[#E5E7EB] bg-white">
      <div className="border-b border-[#E5E7EB] px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <input
              value={query}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
              className="h-10 min-w-[220px] flex-1 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]"
              placeholder="Buscar por referencia, concepto o tercero"
            />
            <select
              value={tipoFilter}
              onChange={(event) => setTipoFilter(event.target.value)}
              className="h-10 min-w-[160px] rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]"
            >
              <option value="">Todos los tipos</option>
              <option value="ingreso">Ingresos</option>
              <option value="egreso">Egresos</option>
            </select>
            <select
              value={monedaFilter}
              onChange={(event) => setMonedaFilter(event.target.value)}
              className="h-10 min-w-[140px] rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]"
            >
              <option value="">Todas las monedas</option>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
            <select
              value={origenFilter}
              onChange={(event) => setOrigenFilter(event.target.value)}
              className="h-10 min-w-[160px] rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]"
            >
              <option value="">Todos los orígenes</option>
              <option value="manual">Manual</option>
              <option value="venta">Venta</option>
              <option value="compra">Compra</option>
              <option value="comision">Comisión</option>
              <option value="ajuste">Ajuste</option>
            </select>
          </div>
          <p className="text-xs text-[#6B7280]">
            Mostrando {visibleMovimientos.length} de {filtered.length}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full border-collapse text-sm">
          <thead className="bg-[#FAFAFA] text-left text-xs uppercase tracking-[0.12em] text-[#6B7280]">
            <tr className="border-b border-[#E5E7EB]">
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Medio</th>
              <th className="px-4 py-3 font-medium">Concepto</th>
              <th className="px-4 py-3 font-medium">Referencia</th>
              <th className="px-4 py-3 font-medium">Cuenta</th>
              <th className="px-4 py-3 font-medium">Monto</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {visibleMovimientos.length ? (
              visibleMovimientos.map((movimiento) => {
                const isExpanded = expandedId === movimiento.id;

                return (
                  <Fragment key={movimiento.id}>
                    <tr key={movimiento.id} className="transition hover:bg-[#F9FAFB]">
                      <td className="whitespace-nowrap px-4 py-3 text-[#111827]">{formatDate(movimiento.fecha)}</td>
                      <td className="px-4 py-3">
                        <CajaTipoBadge tipo={movimiento.tipo} />
                      </td>
                      <td className="px-4 py-3 text-[#111827]">{formatMedium(movimiento.medio)}</td>
                      <td className="px-4 py-3">
                        <div className="max-w-[220px] space-y-1">
                          <p className="truncate text-[#111827]">{movimiento.concepto ?? "—"}</p>
                          {movimiento.periodo ? <p className="text-xs text-[#6B7280]">{movimiento.periodo}</p> : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-[260px] space-y-1">
                          <p className="truncate text-[#111827]">{movementReference(movimiento)}</p>
                          {movementReferenceDetail(movimiento) ? (
                            <p className="truncate text-xs text-[#6B7280]">{movementReferenceDetail(movimiento)}</p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="text-[#111827]">{movimiento.cuenta ?? "—"}</p>
                          <p className="text-xs text-[#6B7280]">{movimiento.periodo ?? "—"}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-[#111827]">
                        {formatMoney(
                          movimiento.tipo === "egreso"
                            ? -((movimiento.importe ?? movimiento.monto) ?? 0)
                            : (movimiento.importe ?? movimiento.monto) ?? 0,
                          movimiento.moneda
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : movimiento.id)}
                          className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-1 text-xs font-medium text-[#111827] transition hover:bg-white"
                        >
                          {isExpanded ? "Ocultar" : "Ver detalle"}
                        </button>
                      </td>
                    </tr>
                    {isExpanded ? (
                      <tr key={`${movimiento.id}-detail`} className="bg-[#FAFAFA]">
                        <td colSpan={8} className="px-4 py-4">
                          <div className="grid gap-3 rounded-md border border-[#E5E7EB] bg-white p-4 md:grid-cols-2 xl:grid-cols-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">Referencia</p>
                              <p className="mt-1 text-sm text-[#111827]">{movimiento.detalle_1 ?? "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">Comprobante / nota</p>
                              <p className="mt-1 text-sm text-[#111827]">{movimiento.detalle_2 ?? "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">Proveedor / tercero</p>
                              <p className="mt-1 text-sm text-[#111827]">{movimiento.detalle_3 ?? movimiento.proveedor?.nombre ?? "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">Origen del movimiento</p>
                              <p className="mt-1 text-sm text-[#111827]">{formatOrigin(movimiento.origen)}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">Vínculo</p>
                              <p className="mt-1 text-sm text-[#111827]">{linkedValue(movimiento)}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">Observaciones</p>
                              <p className="mt-1 text-sm text-[#111827]">{movimiento.observaciones ?? "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">Creado</p>
                              <p className="mt-1 text-sm text-[#111827]">{formatDate(movimiento.created_at)}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">Medio</p>
                              <p className="mt-1 text-sm text-[#111827]">{formatMedium(movimiento.medio)}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center text-sm text-[#6B7280]">
                  No hay movimientos cargados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasMoreRows ? (
        <div className="border-t border-[#E5E7EB] px-4 py-3 text-xs text-[#6B7280]">
          Mostrando los primeros {MAX_VISIBLE_ROWS} resultados. Afiná filtros para ver el resto.
        </div>
      ) : null}
    </section>
  );
}
