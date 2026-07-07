"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { PaymentMethodBadge } from "./payment-method-badge";
import { VentaStatusBadge } from "./venta-status-badge";

type Venta = {
  id: string;
  fecha_venta: string | null;
  cliente_nombre: string | null;
  cliente_telefono: string | null;
  cliente_email: string | null;
  cliente_documento: string | null;
  precio_venta: number | null;
  moneda: string | null;
  metodo_pago: string | null;
  estado: string | null;
  monto_permuta: number | null;
  created_at: string | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    version: string | null;
    anio: number | null;
    dominio: string | null;
    fotos: string[] | string | null;
  } | null;
  vendedor: {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
  } | null;
  pagos?: Array<Record<string, any>>;
  entrega?: Record<string, any> | null;
  precio_infoauto?: number | null;
  info_historica_compra?: number | null;
  costo_reposicion?: number | null;
  costo_historico?: number | null;
  margen_reposicion?: number | null;
  margen_historico?: number | null;
  rotacion_dias?: number | null;
  saldo_preventa?: number | null;
  saldo_efectivo?: number | null;
  importe_gestoria?: number | null;
  importe_escribania?: number | null;
  resultado_operativo?: number | null;
};

const paymentMethods = ["", "transferencia", "efectivo", "dolares", "pesos", "permuta"] as const;
const statuses = ["", "registrada", "anulada"] as const;

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

function getVehicleSummary(venta: Venta) {
  const pieces = [
    venta.vehiculo ? `${venta.vehiculo.marca ?? "-"} ${venta.vehiculo.modelo ?? ""}`.trim() : "—",
    venta.vehiculo?.version,
    venta.vehiculo?.anio ? String(venta.vehiculo.anio) : null,
    venta.vehiculo?.dominio,
  ].filter(Boolean);

  return {
    title: pieces[0] ?? "—",
    subtitle: pieces.slice(1).join(" · "),
  };
}

function getClientSubtitle(venta: Venta) {
  return venta.cliente_telefono ?? venta.cliente_email ?? venta.cliente_documento ?? "—";
}

function getSellerName(venta: Venta) {
  return venta.vendedor?.nombre ?? venta.vendedor?.email ?? "—";
}

function getPaymentsSummary(pagos: Array<Record<string, any>> | undefined) {
  if (!pagos?.length) return "Sin pagos cargados";

  return pagos
    .slice(0, 4)
    .map((pago) => {
      const medio = String(pago?.medio ?? pago?.tipo ?? "pago").trim();
      const amount = formatMoney(
        typeof pago?.importe === "number" ? pago.importe : Number(pago?.importe ?? pago?.monto ?? 0),
        pago?.moneda
      );
      return `${medio}: ${amount}`;
    })
    .join(" · ");
}

function getMarginSummary(venta: Venta) {
  const values = [
    venta.margen_reposicion != null ? `Reposición ${formatMoney(venta.margen_reposicion, venta.moneda)}` : null,
    venta.margen_historico != null ? `Histórico ${formatMoney(venta.margen_historico, venta.moneda)}` : null,
    venta.resultado_operativo != null ? `Operativo ${formatMoney(venta.resultado_operativo, venta.moneda)}` : null,
  ].filter(Boolean);

  return values.length ? values.join(" · ") : "Sin margen calculado";
}

function getDeliverySummary(estado: string | null | undefined) {
  const normalized = (estado ?? "").toLowerCase();
  if (["entregada", "entregado"].includes(normalized)) return "Entregada";
  if (["observada", "observado"].includes(normalized)) return "Observada";
  return "Pendiente";
}

export function VentasTable({ ventas }: { ventas: Venta[] }) {
  const [query, setQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<(typeof paymentMethods)[number]>("");
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("");

  const filteredVentas = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return ventas.filter((venta) => {
      if (methodFilter && venta.metodo_pago !== methodFilter) return false;
      if (statusFilter && venta.estado !== statusFilter) return false;

      if (!normalizedQuery) return true;

      const searchable = [
        venta.cliente_nombre,
        venta.cliente_telefono,
        venta.cliente_email,
        venta.cliente_documento,
        venta.vehiculo?.marca,
        venta.vehiculo?.modelo,
        venta.vehiculo?.dominio,
        venta.vendedor?.nombre,
        venta.vendedor?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [methodFilter, query, statusFilter, ventas]);

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#E5E7EB] p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">Ventas registradas</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Buscá por cliente, contacto, documento, vehículo o vendedor.
          </p>
        </div>

        <div className="grid gap-2 md:grid-cols-[320px_180px_160px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar venta"
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
              value={methodFilter}
              onChange={(event) => setMethodFilter(event.target.value as (typeof paymentMethods)[number])}
              className="h-10 w-full appearance-none rounded-xl border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
            >
              <option value="">Todos los métodos</option>
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
              <option value="dolares">Dólares</option>
              <option value="pesos">Pesos</option>
              <option value="permuta">Permuta</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as (typeof statuses)[number])}
              className="h-10 w-full appearance-none rounded-xl border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
            >
              <option value="">Todos los estados</option>
              <option value="registrada">Registrada</option>
              <option value="anulada">Anulada</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#E5E7EB]">
          <thead className="bg-[#FAFAFA]">
            <tr className="text-left text-xs font-medium uppercase tracking-[0.08em] text-[#6B7280]">
              <th className="px-4 py-3">Vehículo</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Vendedor</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Entrega</th>
              <th className="px-4 py-3">Permuta</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {filteredVentas.length ? (
              filteredVentas.map((venta) => {
                const vehicle = getVehicleSummary(venta);

                return (
                  <tr key={venta.id} className="transition hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">
                          {vehicle.title}
                        </p>
                        {vehicle.subtitle ? (
                          <p className="text-sm text-[#6B7280]">{vehicle.subtitle}</p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">
                          {venta.cliente_nombre ?? "—"}
                        </p>
                        <p className="text-sm text-[#6B7280]">
                          {getClientSubtitle(venta)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <p className="text-sm font-medium text-[#111827]">
                        {getSellerName(venta)}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-[#111827]">
                      {formatDate(venta.fecha_venta)}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <PaymentMethodBadge method={venta.metodo_pago} />
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-[#111827]">
                      <div className="space-y-1">
                        <p className="font-medium text-[#111827]">
                          {formatMoney(venta.precio_venta, venta.moneda)}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {getPaymentsSummary(venta.pagos)}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {getMarginSummary(venta)}
                        </p>
                        {venta.resultado_operativo != null || venta.rotacion_dias != null ? (
                          <p className="text-xs text-[#9CA3AF]">
                            {venta.resultado_operativo != null
                              ? `Renta ${formatMoney(venta.resultado_operativo, venta.moneda)}`
                              : "Renta sin dato"}
                            {venta.rotacion_dias != null ? ` · ${venta.rotacion_dias} días` : ""}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                          getDeliverySummary(venta.entrega?.estado) === "Entregada"
                            ? "border-[#D1FAE5] bg-[#ECFDF5] text-[#065F46]"
                            : getDeliverySummary(venta.entrega?.estado) === "Observada"
                              ? "border-[#FEF3C7] bg-[#FFFBEB] text-[#92400E]"
                              : "border-[#E5E7EB] bg-[#FAFAFA] text-[#6B7280]",
                        ].join(" ")}
                      >
                        {getDeliverySummary(venta.entrega?.estado)}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-[#111827]">
                      {venta.monto_permuta != null
                        ? formatMoney(venta.monto_permuta, venta.moneda)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <VentaStatusBadge status={venta.estado} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-14 text-center">
                  <div className="mx-auto max-w-sm space-y-2">
                    <p className="text-sm font-medium text-[#111827]">
                      No hay resultados para mostrar
                    </p>
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
    </section>
  );
}
