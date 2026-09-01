"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PencilLine, Search, X } from "lucide-react";
import { canViewMargins } from "@/lib/auth/permissions";
import { VentaStatusBadge } from "./venta-status-badge";
import { PaginationControls } from "@/components/common/pagination-controls";
import { AdvancedFilters } from "@/components/common/advanced-filters";

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
  lead_id?: string | null;
  lead?: {
    id: string;
    nombre: string | null;
    telefono: string | null;
    origen: string | null;
    estado: string | null;
  } | null;
};

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
  return venta.vendedor?.nombre ?? "Sin vendedor";
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

function getCashPaid(pagos: Array<Record<string, any>> | undefined) {
  return (pagos ?? []).reduce((total, pago) => {
    const type = String(pago?.tipo ?? pago?.medio ?? "").toLowerCase();
    if (["usado", "permuta", "credito", "financiado"].some((value) => type.includes(value))) return total;
    return total + (Number(pago?.importe ?? pago?.monto ?? 0) || 0);
  }, 0);
}

function getPendingBalance(venta: Venta) {
  const explicit = (venta.saldo_preventa ?? 0) + (venta.saldo_efectivo ?? 0);
  if (explicit > 0) return explicit;
  const paid = (venta.pagos ?? []).reduce((total, pago) => total + (Number(pago?.importe ?? pago?.monto ?? 0) || 0), 0);
  return Math.max(0, (venta.precio_venta ?? 0) - paid - (venta.monto_permuta ?? 0));
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

export function VentasTable({
  ventas,
  role = null,
  toolbarAction,
}: {
  ventas: Venta[];
  role?: string | null;
  toolbarAction?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("");
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const showMargins = canViewMargins(role);

  const filteredVentas = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return ventas.filter((venta) => {
      if (statusFilter && venta.estado !== statusFilter) return false;

      if (!normalizedQuery) return true;

      const searchable = [
        venta.cliente_nombre,
        venta.cliente_telefono,
        venta.cliente_email,
        venta.cliente_documento,
        venta.lead?.nombre,
        venta.lead?.telefono,
        venta.lead?.origen,
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
  }, [query, statusFilter, ventas]);

  const totalPages = Math.max(1, Math.ceil(filteredVentas.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleVentas = filteredVentas.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
              placeholder="Buscar venta"
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

          <AdvancedFilters>
          <div className="relative min-w-[170px] flex-1 sm:flex-none">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as (typeof statuses)[number])}
              className="h-10 w-full appearance-none rounded-md border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]"
            >
              <option value="">Todos los estados</option>
              <option value="registrada">Registrada</option>
              <option value="anulada">Anulada</option>
            </select>
          </div>
          </AdvancedFilters>
        </div>
          <p className="text-xs text-[#6B7280]">
            Mostrando {visibleVentas.length} de {filteredVentas.length}
          </p>
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
              <th className="px-4 py-3">Financiación</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Entrega</th>
              <th className="px-4 py-3">Permuta</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {visibleVentas.length ? (
              visibleVentas.map((venta) => {
                const vehicle = getVehicleSummary(venta);
                const cashPaid = getCashPaid(venta.pagos);
                const pendingBalance = getPendingBalance(venta);
                const salePrice = venta.precio_venta ?? 0;
                const paidPercent = salePrice > 0 ? Math.min(100, Math.round(((salePrice - pendingBalance) / salePrice) * 100)) : 0;

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
                        {venta.lead ? (
                          <p className="text-xs text-[#9CA3AF]">
                            CRM · {venta.lead.nombre ?? "Lead"}{" "}
                            {venta.lead.origen ? `· ${venta.lead.origen}` : ""}
                          </p>
                        ) : null}
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
                    <td className="px-4 py-3 align-middle text-sm text-[#111827]">
                      {venta.saldo_preventa != null && venta.saldo_preventa > 0 ? `Sí · ${formatMoney(venta.saldo_preventa, venta.moneda)}` : "No"}
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-[#111827]">
                      <div className="space-y-1">
                        <p className="font-medium text-[#111827]">
                          {formatMoney(venta.precio_venta, venta.moneda)}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {getPaymentsSummary(venta.pagos)}
                        </p>
                        <div className="mt-2 max-w-[210px]">
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#8A1538]" style={{ width: `${paidPercent}%` }} /></div>
                          <div className="mt-1 flex justify-between gap-2 text-[11px] text-[#6B7280]"><span>Cobrado {formatMoney(cashPaid, venta.moneda)}</span><span>Saldo {formatMoney(pendingBalance, venta.moneda)}</span></div>
                        </div>
                        {showMargins ? (
                          <>
                            <p className="text-xs text-[#6B7280]">
                              {getMarginSummary(venta)}
                            </p>
                            {venta.resultado_operativo != null || venta.rotacion_dias != null ? (
                              <p className="text-xs text-[#9CA3AF]">
                                {venta.resultado_operativo != null
                                  ? `Rentabilidad ${formatMoney(venta.resultado_operativo, venta.moneda)}`
                                  : "Rentabilidad sin dato"}
                                {venta.rotacion_dias != null ? ` · ${venta.rotacion_dias} días` : ""}
                              </p>
                            ) : null}
                          </>
                        ) : (
                          <p className="text-xs text-[#9CA3AF]">Datos comerciales visibles para tu rol.</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1"><span
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
                      </span>{venta.entrega?.fecha_entrega ? <p className="text-xs text-[#6B7280]">{formatDate(venta.entrega.fecha_entrega)}</p> : <Link href="/ventas/pendientes-entrega" className="text-xs font-medium text-[#8A1538] hover:underline">Cargar entrega</Link>}</div>
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-[#111827]">
                      {venta.monto_permuta != null
                        ? formatMoney(venta.monto_permuta, venta.moneda)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <VentaStatusBadge status={venta.estado} />
                    </td>
                    <td className="px-4 py-3 align-middle"><Link href={`/ventas/${venta.id}/editar`} className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E7EB] px-2.5 py-2 text-xs font-medium text-[#111827] hover:bg-[#F9FAFB]"><PencilLine className="h-3.5 w-3.5 text-[#8A1538]" />Editar</Link></td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="px-4 py-14 text-center">
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

      <PaginationControls page={currentPage} totalItems={filteredVentas.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </section>
  );
}
