"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import {
  formatCurrencyByCurrency,
  type RentaRow,
} from "@/lib/renta-metrics";
import { PaymentMethodBadge } from "./payment-method-badge";
import { RentaMarginBadge } from "./renta-margin-badge";

const paymentMethods = ["", "transferencia", "efectivo", "dolares", "pesos", "permuta"] as const;
const deliveryFilters = ["", "pendiente", "en_proceso", "observada", "entregada"] as const;
const resultFilters = ["", "positive", "negative", "neutral", "mixed", "sin_datos"] as const;

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
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

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function formatLabel(value: string) {
  const normalized = value.replace(/_/g, " ").trim();
  if (!normalized) return "Otros";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function getVehicleSummary(row: RentaRow) {
  const title = [row.vehiculo?.marca, row.vehiculo?.modelo].filter(Boolean).join(" ") || "—";
  const subtitle = [row.vehiculo?.version, row.vehiculo?.anio ? String(row.vehiculo.anio) : null, row.vehiculo?.dominio]
    .filter(Boolean)
    .join(" · ");

  return { title, subtitle };
}

function getSellerLabel(row: RentaRow) {
  return row.vendedor?.nombre ?? row.vendedor?.email ?? "—";
}

function getDeliveryLabel(value: string | null | undefined) {
  const normalized = normalizeText(value);
  if (["entregada", "entregado"].includes(normalized)) return "Entregada";
  if (normalized === "en_proceso") return "En proceso";
  if (normalized === "observada") return "Observada";
  if (normalized === "lista_para_entregar") return "Lista";
  return "Pendiente";
}

function getDeliveryClasses(value: string | null | undefined) {
  const normalized = normalizeText(value);
  if (["entregada", "entregado"].includes(normalized)) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (normalized === "observada") return "border-amber-200 bg-amber-50 text-amber-800";
  if (normalized === "en_proceso" || normalized === "lista_para_entregar")
    return "border-slate-200 bg-slate-50 text-slate-700";
  return "border-[#E5E7EB] bg-[#FAFAFA] text-[#6B7280]";
}

function getResultLabel(value: RentaRow["resultStatus"]) {
  switch (value) {
    case "positive":
      return "Positivo";
    case "negative":
      return "Negativo";
    case "neutral":
      return "Neutro";
    case "mixed":
      return "Moneda mixta";
    default:
      return "Sin datos";
  }
}

function getResultClasses(value: RentaRow["resultStatus"]) {
  switch (value) {
    case "positive":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "negative":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "neutral":
      return "border-slate-200 bg-slate-50 text-slate-700";
    case "mixed":
      return "border-amber-200 bg-amber-50 text-amber-800";
    default:
      return "border-[#E5E7EB] bg-[#FAFAFA] text-[#6B7280]";
  }
}

function summarizePayments(row: RentaRow) {
  if (!row.pagosPorTipo.length) {
    return <p className="text-xs text-[#6B7280]">Sin pagos cargados</p>;
  }

  return (
    <div className="space-y-1">
      {row.pagosPorTipo.slice(0, 3).map((item) => (
        <p key={item.type} className="text-xs text-[#6B7280]">
          {formatLabel(item.type)}: {formatCurrencyByCurrency(item.totals)}
        </p>
      ))}
      {row.pagosPorTipo.length > 3 ? (
        <p className="text-[11px] text-[#9CA3AF]">+{row.pagosPorTipo.length - 3} más</p>
      ) : null}
    </div>
  );
}

function summarizeCosts(row: RentaRow) {
  const lines = [
    row.costoHistorico != null ? `Histórico ${formatMoney(row.costoHistorico, row.moneda)}` : null,
    row.costoReposicion != null ? `Reposición ${formatMoney(row.costoReposicion, row.moneda)}` : null,
    row.gastosTotales.length ? `Gastos ${formatCurrencyByCurrency(row.gastosTotales)}` : null,
  ].filter(Boolean);

  return lines.length ? (
    <div className="space-y-1">
      {lines.map((line) => (
        <p key={line} className="text-xs text-[#6B7280]">
          {line}
        </p>
      ))}
    </div>
  ) : (
    <p className="text-xs text-[#6B7280]">Sin costos informados</p>
  );
}

function summarizeMargin(row: RentaRow) {
  if (row.resultStatus === "mixed") {
    return (
      <div className="space-y-1">
        <RentaMarginBadge status={row.resultStatus} />
        <p className="text-xs text-[#6B7280]">No comparable</p>
      </div>
    );
  }

  if (row.resultStatus === "sin_datos") {
    return (
      <div className="space-y-1">
        <RentaMarginBadge status={row.resultStatus} />
        <p className="text-xs text-[#6B7280]">Sin cálculo suficiente</p>
      </div>
    );
  }

  const value = row.resultadoOperativo;
  return (
    <div className="space-y-1">
      <RentaMarginBadge status={row.resultStatus} />
      <p className="text-sm font-medium text-[#111827]">
        {value != null ? formatMoney(value, row.moneda) : "—"}
      </p>
      <p className="text-xs text-[#6B7280]">
        {row.margenHistorico != null ? `Histórico ${formatMoney(row.margenHistorico, row.moneda)}` : "Histórico —"}
      </p>
      <p className="text-xs text-[#6B7280]">
        {row.margenReposicion != null ? `Reposición ${formatMoney(row.margenReposicion, row.moneda)}` : "Reposición —"}
      </p>
    </div>
  );
}

export function RentaTable({ rows }: { rows: RentaRow[] }) {
  const [query, setQuery] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<(typeof paymentMethods)[number]>("");
  const [deliveryFilter, setDeliveryFilter] = useState<(typeof deliveryFilters)[number]>("");
  const [resultFilter, setResultFilter] = useState<(typeof resultFilters)[number]>("");
  const MAX_VISIBLE_ROWS = 200;

  const sellerOptions = useMemo(() => {
    const options = new Map<string, string>();

    for (const row of rows) {
      if (!row.vendedor?.id) continue;
      options.set(row.vendedor.id, getSellerLabel(row));
    }

    return Array.from(options.entries()).sort((left, right) => left[1].localeCompare(right[1]));
  }, [rows]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      if (sellerFilter && row.vendedor?.id !== sellerFilter) return false;
      if (paymentFilter && normalizeText(row.metodoPago) !== paymentFilter) return false;
      if (deliveryFilter && normalizeText(row.deliveryEstado) !== deliveryFilter) return false;
      if (resultFilter && row.resultStatus !== resultFilter) return false;

      if (!normalizedQuery) return true;

      const searchable = [
        row.vehiculo?.marca,
        row.vehiculo?.modelo,
        row.vehiculo?.version,
        row.vehiculo?.dominio,
        row.clienteNombre,
        row.vendedor?.nombre,
        row.vendedor?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [deliveryFilter, paymentFilter, query, resultFilter, rows, sellerFilter]);

  const visibleRows = filteredRows.slice(0, MAX_VISIBLE_ROWS);
  const hasMoreRows = filteredRows.length > MAX_VISIBLE_ROWS;

  return (
    <section className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="space-y-4 border-b border-[#E5E7EB] p-4">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-[#111827]">Operaciones de rentabilidad</h2>
          <p className="text-sm leading-6 text-[#6B7280]">
            Análisis de margen, pagos, gastos y resultado por operación.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[260px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar operación"
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

          <div className="relative min-w-[180px] flex-1 sm:flex-none">
            <select
              value={sellerFilter}
              onChange={(event) => setSellerFilter(event.target.value)}
              className="h-10 w-full appearance-none rounded-xl border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6] sm:w-auto"
            >
              <option value="">Todos los vendedores</option>
              {sellerOptions.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative min-w-[170px] flex-1 sm:flex-none">
            <select
              value={paymentFilter}
              onChange={(event) => setPaymentFilter(event.target.value as (typeof paymentMethods)[number])}
              className="h-10 w-full appearance-none rounded-xl border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6] sm:w-auto"
            >
              <option value="">Todos los pagos</option>
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
              <option value="dolares">Dólares</option>
              <option value="pesos">Pesos</option>
              <option value="permuta">Permuta</option>
            </select>
          </div>

          <div className="relative min-w-[170px] flex-1 sm:flex-none">
            <select
              value={deliveryFilter}
              onChange={(event) => setDeliveryFilter(event.target.value as (typeof deliveryFilters)[number])}
              className="h-10 w-full appearance-none rounded-xl border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6] sm:w-auto"
            >
              <option value="">Todas las entregas</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En proceso</option>
              <option value="observada">Observada</option>
              <option value="entregada">Entregada</option>
            </select>
          </div>

          <div className="relative min-w-[170px] flex-1 sm:flex-none">
            <select
              value={resultFilter}
              onChange={(event) => setResultFilter(event.target.value as (typeof resultFilters)[number])}
              className="h-10 w-full appearance-none rounded-xl border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6] sm:w-auto"
            >
              <option value="">Todos los resultados</option>
              <option value="positive">Positivo</option>
              <option value="negative">Negativo</option>
              <option value="neutral">Neutro</option>
              <option value="mixed">Moneda mixta</option>
              <option value="sin_datos">Sin datos</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#E5E7EB]">
          <thead className="bg-[#FAFAFA]">
            <tr className="text-left text-xs font-medium uppercase tracking-[0.08em] text-[#6B7280]">
              <th className="px-4 py-3">Operación</th>
              <th className="px-4 py-3">Vehículo</th>
              <th className="px-4 py-3">Venta</th>
              <th className="px-4 py-3">Costos</th>
              <th className="px-4 py-3">Pagos</th>
              <th className="px-4 py-3">Margen</th>
              <th className="px-4 py-3">Rotación</th>
              <th className="px-4 py-3">Entrega</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {visibleRows.length ? (
              visibleRows.map((row) => {
                const vehicle = getVehicleSummary(row);

                return (
                  <tr key={row.id} className="transition hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3 align-top">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">{formatDate(row.fechaVenta)}</p>
                        <p className="text-sm text-[#6B7280]">{row.clienteNombre ?? "—"}</p>
                        <p className="text-xs text-[#9CA3AF]">{getSellerLabel(row)}</p>
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">{vehicle.title}</p>
                        {vehicle.subtitle ? <p className="text-sm text-[#6B7280]">{vehicle.subtitle}</p> : null}
                        {row.vehiculoRecibido ? (
                          <p className="text-xs text-[#9CA3AF]">
                            Usado recibido · {[row.vehiculoRecibido.marca, row.vehiculoRecibido.modelo].filter(Boolean).join(" ") || "—"}
                          </p>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">
                          {formatMoney(row.precioVenta, row.moneda)}
                        </p>
                        <PaymentMethodBadge method={row.metodoPago} />
                        {row.precioInfoauto != null ? (
                          <p className="text-xs text-[#6B7280]">
                            Infoauto {formatMoney(row.precioInfoauto, row.moneda)}
                          </p>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">{summarizeCosts(row)}</td>

                    <td className="px-4 py-3 align-top">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-[#111827]">
                          {row.pagosTotales.length ? formatCurrencyByCurrency(row.pagosTotales) : "—"}
                        </p>
                        {summarizePayments(row)}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">{summarizeMargin(row)}</td>

                    <td className="px-4 py-3 align-top">
                      <p className="text-sm font-medium text-[#111827]">
                        {row.rotacionDias != null ? `${row.rotacionDias} días` : "—"}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {row.resultStatus === "mixed"
                          ? "Moneda mixta"
                          : row.rotacionDias != null
                            ? "Trazabilidad operativa"
                            : "Sin rotación calculada"}
                      </p>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="space-y-1">
                        <span
                          className={[
                            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                            getDeliveryClasses(row.deliveryEstado),
                          ].join(" ")}
                        >
                          {getDeliveryLabel(row.deliveryEstado)}
                        </span>
                        {row.deliveryFecha ? (
                          <p className="text-xs text-[#6B7280]">{formatDate(row.deliveryFecha)}</p>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center">
                  <div className="mx-auto max-w-sm space-y-2">
                    <p className="text-sm font-medium text-[#111827]">No hay resultados para mostrar</p>
                    <p className="text-sm leading-6 text-[#6B7280]">
                      Probá ajustar los filtros o buscá otra operación.
                    </p>
                  </div>
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
