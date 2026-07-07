"use client";

import { Fragment, useMemo, useState } from "react";
import { Edit3, Search, SlidersHorizontal, X } from "lucide-react";
import { EntregaStatusBadge } from "./entrega-status-badge";
import { EntregaEditForm } from "./entrega-edit-form";

type Pagos = Array<Record<string, any>>;

type Entrega = {
  id: string;
  venta_id: string;
  estado: string | null;
  fecha_entrega: string | null;
  status_informe_vu: string | null;
  usado_credito: string | null;
  usado_informe_dominio: string | null;
  usado_multas: string | null;
  usado_patentes: string | null;
  usado_observaciones: string | null;
  observaciones: string | null;
  created_at: string | null;
  updated_at: string | null;
  venta: {
    id: string;
    fecha_venta: string | null;
    cliente_nombre: string | null;
    cliente_telefono: string | null;
    cliente_email: string | null;
    cliente_documento: string | null;
    precio_venta: number | null;
    moneda: string | null;
    metodo_pago: string | null;
    monto_permuta: number | null;
    saldo_preventa: number | null;
    saldo_efectivo: number | null;
    importe_gestoria: number | null;
    importe_escribania: number | null;
    resultado_operativo: number | null;
    vehiculo: {
      id: string;
      marca: string | null;
      modelo: string | null;
      version: string | null;
      anio: number | null;
      dominio: string | null;
    } | null;
    vehiculo_recibido: {
      id: string;
      marca: string | null;
      modelo: string | null;
      version: string | null;
      anio: number | null;
      dominio: string | null;
    } | null;
    vendedor: {
      id: string;
      nombre: string | null;
      email: string | null;
    } | null;
  } | null;
  pagos?: Pagos;
};

const statusFilters = ["", "pendiente", "en_proceso", "lista_para_entregar", "entregada", "observada", "cancelada"] as const;

function formatDate(value: string | null) {
  if (!value) return "Sin fecha";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-AR").format(parsed);
}

function formatMoney(value: number | null, currency: string | null) {
  if (value == null) return "—";
  const isoCurrency = (currency ?? "").toLowerCase() === "usd" ? "USD" : "ARS";
  const symbol = isoCurrency === "USD" ? "US$" : "$";
  return `${symbol} ${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(value)}`;
}

function formatAmount(value: number | null, currency: string | null) {
  if (value == null) return "—";
  const isoCurrency = (currency ?? "").toLowerCase() === "usd" ? "USD" : "ARS";
  const symbol = isoCurrency === "USD" ? "US$" : "$";
  return `${symbol} ${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(value)}`;
}

function getSellerName(entrega: Entrega) {
  return entrega.venta?.vendedor?.nombre ?? entrega.venta?.vendedor?.email ?? "—";
}

function getVehicleSummary(entrega: Entrega) {
  const vehicle = entrega.venta?.vehiculo;
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

function getUsedSummary(entrega: Entrega) {
  const vehicle = entrega.venta?.vehiculo_recibido;
  if (!vehicle) {
    return {
      title: "—",
      subtitle: "",
    };
  }

  const pieces = [
    `${vehicle.marca ?? "-"} ${vehicle.modelo ?? ""}`.trim(),
    vehicle.version,
    vehicle.dominio,
  ].filter(Boolean);

  return {
    title: pieces[0] ?? "—",
    subtitle: pieces.slice(1).join(" · "),
  };
}

function formatPayments(pagos: Pagos | undefined, moneda: string | null) {
  if (!pagos?.length) return "Sin pagos cargados";

  const byCurrency = new Map<string, number>();
  const byType = new Map<string, number>();

  for (const pago of pagos) {
    const amount = Number(pago?.importe ?? pago?.monto ?? 0) || 0;
    if (!amount) continue;
    const currency = String(pago?.moneda ?? moneda ?? "ARS").toUpperCase();
    byCurrency.set(currency, (byCurrency.get(currency) ?? 0) + amount);
    const type = String(pago?.tipo ?? pago?.medio ?? "pago").trim();
    byType.set(type, (byType.get(type) ?? 0) + amount);
  }

  const currencySummary = Array.from(byCurrency.entries())
    .map(([currency, amount]) => formatAmount(amount, currency))
    .join(" · ");
  const typeSummary = Array.from(byType.entries())
    .slice(0, 4)
    .map(([type, amount]) => `${type}: ${formatAmount(amount, moneda)}`)
    .join(" · ");

  return [currencySummary || "—", typeSummary || "—"].filter(Boolean).join(" · ");
}

function getDocumentState(value: string | null) {
  if (!value) return "—";
  return value;
}

export function PendientesEntregaTable({ entregas }: { entregas: Entrega[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>("");
  const [withUsedFilter, setWithUsedFilter] = useState(false);
  const [withPendingBalanceFilter, setWithPendingBalanceFilter] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const filteredEntregas = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return entregas.filter((entrega) => {
      const estado = (entrega.estado ?? "pendiente").toLowerCase();
      if (statusFilter && estado !== statusFilter) return false;

      const hasUsed = Boolean(entrega.venta?.vehiculo_recibido);
      if (withUsedFilter && !hasUsed) return false;

      const hasPendingBalance =
        (entrega.venta?.saldo_preventa ?? 0) > 0 || (entrega.venta?.saldo_efectivo ?? 0) > 0;
      if (withPendingBalanceFilter && !hasPendingBalance) return false;

      if (!normalizedQuery) return true;

      const searchable = [
        entrega.venta?.cliente_nombre,
        entrega.venta?.cliente_telefono,
        entrega.venta?.cliente_email,
        entrega.venta?.cliente_documento,
        entrega.venta?.vehiculo?.marca,
        entrega.venta?.vehiculo?.modelo,
        entrega.venta?.vehiculo?.dominio,
        entrega.venta?.vehiculo_recibido?.marca,
        entrega.venta?.vehiculo_recibido?.modelo,
        entrega.venta?.vehiculo_recibido?.dominio,
        getSellerName(entrega),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [query, statusFilter, withPendingBalanceFilter, withUsedFilter, entregas]);

  return (
    <section className="rounded-[28px] border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#E5E7EB] p-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">Operaciones en seguimiento</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Controlá pagos, usado recibido, gestoría y entrega física.
          </p>
        </div>

        <div className="grid gap-2 xl:grid-cols-[320px_190px_180px_180px]">
          <div className="relative">
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

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as (typeof statusFilters)[number])}
              className="h-10 w-full appearance-none rounded-xl border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En proceso</option>
              <option value="lista_para_entregar">Lista para entregar</option>
              <option value="entregada">Entregada</option>
              <option value="observada">Observada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setWithUsedFilter((value) => !value)}
            className={[
              "inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition",
              withUsedFilter
                ? "border-[#111827] bg-[#111827] text-white"
                : "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]",
            ].join(" ")}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Con usado recibido
          </button>

          <button
            type="button"
            onClick={() => setWithPendingBalanceFilter((value) => !value)}
            className={[
              "inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition",
              withPendingBalanceFilter
                ? "border-[#111827] bg-[#111827] text-white"
                : "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]",
            ].join(" ")}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Con saldo pendiente
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#E5E7EB]">
          <thead className="bg-[#FAFAFA]">
            <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
              <th className="px-4 py-3">Operación</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Vehículo vendido</th>
              <th className="px-4 py-3">Pagos / saldo</th>
              <th className="px-4 py-3">Usado recibido</th>
              <th className="px-4 py-3">Gestoría / escribanía</th>
              <th className="px-4 py-3">Fecha entrega</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {filteredEntregas.length ? (
              filteredEntregas.map((entrega) => {
                const operationDate = formatDate(entrega.venta?.fecha_venta ?? null);
                const seller = getSellerName(entrega);
                const vehicle = getVehicleSummary(entrega);
                const usedVehicle = getUsedSummary(entrega);
                const hasUsed = Boolean(entrega.venta?.vehiculo_recibido);
                const isOpen = openId === entrega.id;

                return (
                  <Fragment key={entrega.id}>
                    <tr className="transition hover:bg-[#F9FAFB]">
                      <td className="px-4 py-3 align-top">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-[#111827]">{operationDate}</p>
                          <p className="text-sm text-[#6B7280]">{seller}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-[#111827]">
                            {entrega.venta?.cliente_nombre ?? "—"}
                          </p>
                          <p className="text-sm text-[#6B7280]">
                            {[
                              entrega.venta?.cliente_telefono,
                              entrega.venta?.cliente_email,
                              entrega.venta?.cliente_documento,
                            ]
                              .filter(Boolean)
                              .join(" · ") || "—"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-[#111827]">{vehicle.title}</p>
                          {vehicle.subtitle ? (
                            <p className="text-sm text-[#6B7280]">{vehicle.subtitle}</p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-[#111827]">
                            {formatPayments(entrega.pagos, entrega.venta?.moneda ?? null)}
                          </p>
                          <p className="text-xs text-[#6B7280]">
                            {entrega.venta?.saldo_preventa != null
                              ? `Saldo preventa: ${formatMoney(entrega.venta.saldo_preventa, entrega.venta.moneda)}`
                              : " "}
                          </p>
                          <p className="text-xs text-[#6B7280]">
                            {entrega.venta?.saldo_efectivo != null
                              ? `Saldo efectivo: ${formatMoney(entrega.venta.saldo_efectivo, entrega.venta.moneda)}`
                              : " "}
                          </p>
                          <p className="text-xs text-[#6B7280]">
                            {entrega.venta?.monto_permuta != null
                              ? `Permuta: ${formatMoney(entrega.venta.monto_permuta, entrega.venta.moneda)}`
                              : " "}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        {hasUsed ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-[#111827]">
                              {usedVehicle.title}
                            </p>
                            {usedVehicle.subtitle ? (
                              <p className="text-sm text-[#6B7280]">{usedVehicle.subtitle}</p>
                            ) : null}
                            <div className="space-y-0.5 text-xs text-[#6B7280]">
                              <p>Crédito: {getDocumentState(entrega.usado_credito)}</p>
                              <p>Informe dominio: {getDocumentState(entrega.usado_informe_dominio)}</p>
                              <p>Multas: {getDocumentState(entrega.usado_multas)}</p>
                              <p>Patentes: {getDocumentState(entrega.usado_patentes)}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-[#6B7280]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="space-y-1 text-sm text-[#111827]">
                          <p>
                            Gestoría: {formatMoney(entrega.venta?.importe_gestoria ?? null, entrega.venta?.moneda ?? null)}
                          </p>
                          <p>
                            Escribanía: {formatMoney(entrega.venta?.importe_escribania ?? null, entrega.venta?.moneda ?? null)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-sm text-[#111827]">
                        {formatDate(entrega.fecha_entrega)}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <EntregaStatusBadge status={entrega.estado} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <button
                          type="button"
                          onClick={() => setOpenId(isOpen ? null : entrega.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
                        >
                          <Edit3 className="h-4 w-4" />
                          {isOpen ? "Cerrar" : "Editar"}
                        </button>
                      </td>
                    </tr>
                    {isOpen ? (
                      <tr className="bg-[#FAFAFA]">
                        <td colSpan={9} className="px-4 py-4">
                          <EntregaEditForm entrega={entrega} onCancel={() => setOpenId(null)} onSaved={() => setOpenId(null)} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-14 text-center">
                  <div className="mx-auto max-w-sm space-y-2">
                    <p className="text-sm font-medium text-[#111827]">
                      No hay resultados para mostrar
                    </p>
                    <p className="text-sm text-[#6B7280]">
                      Probá limpiando filtros o cargando nuevas operaciones.
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
