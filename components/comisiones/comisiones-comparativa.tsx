"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

type Comision = {
  id: string;
  base_comision: number | null;
  porcentaje: number | null;
  monto_comision: number | null;
  moneda: string | null;
  estado: string | null;
  vendedor: {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
  } | null;
  venta: {
    id: string;
    precio_venta: number | null;
    moneda: string | null;
    estado: string | null;
  } | null;
};

type VendorSummary = {
  id: string;
  name: string;
  units: number;
  soldByCurrency: Map<string, number>;
  commissionByCurrency: Map<string, number>;
  totalSoldNominal: number;
  totalCommissionNominal: number;
  potentialLeads: PotentialLead[];
};

type PotentialLead = {
  id: string;
  nombre: string | null;
  estado: string | null;
  origen: string | null;
  vendedor: {
    id: string;
    nombre: string | null;
    comision_default_porcentaje: number | null;
  } | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    version: string | null;
    anio: number | null;
    dominio: string | null;
    precio_venta: number | null;
    precio_moneda: string | null;
  } | null;
};

function formatAmount(value: number) {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
}

function formatMoney(value: number, currency: string | null) {
  const isoCurrency = (currency ?? "").toLowerCase() === "usd" ? "USD" : "ARS";
  const symbol = isoCurrency === "USD" ? "US$" : "$";
  return `${symbol} ${formatAmount(value)}`;
}

function formatCurrencyBreakdown(groups: Map<string, number>) {
  const entries = Array.from(groups.entries()).sort(([left], [right]) =>
    left.localeCompare(right)
  );

  if (!entries.length) return "—";

  return entries
    .map(([currency, total]) => formatMoney(total, currency))
    .join(" · ");
}

function summarizeCurrencyMap(groups: Map<string, number>) {
  const entries = Array.from(groups.entries());

  if (!entries.length) return "—";
  if (entries.length === 1) {
    const [currency, total] = entries[0];
    return formatMoney(total, currency);
  }

  return "Mixto";
}

function getSellerName(comision: Comision) {
  return comision.vendedor?.nombre ?? "Sin vendedor";
}

function getEffectiveRate(summary: VendorSummary) {
  const soldEntries = Array.from(summary.soldByCurrency.entries());
  const commissionEntries = Array.from(summary.commissionByCurrency.entries());
  if (soldEntries.length !== 1 || commissionEntries.length !== 1) return null;
  if (soldEntries[0][0] !== commissionEntries[0][0] || soldEntries[0][1] <= 0) return null;
  return (commissionEntries[0][1] / soldEntries[0][1]) * 100;
}

function getPotentialAmount(lead: PotentialLead) {
  return lead.vehiculo?.precio_venta ?? null;
}

function getPotentialCommission(lead: PotentialLead) {
  const amount = getPotentialAmount(lead);
  if (amount == null) return null;
  const percentage = lead.vendedor?.comision_default_porcentaje ?? 1;
  return amount * (percentage / 100);
}

function getPotentialVehicleName(lead: PotentialLead) {
  const vehicle = lead.vehiculo;
  if (!vehicle) return "Vehículo sin asignar";
  return [vehicle.marca, vehicle.modelo].filter(Boolean).join(" ") || "Vehículo sin nombre";
}

export function ComisionesComparativa({
  comisiones,
  potenciales = [],
}: {
  comisiones: Comision[];
  potenciales?: PotentialLead[];
}) {
  const [expandedVendors, setExpandedVendors] = useState<Set<string>>(new Set());
  const summaries = useMemo(() => {
    const groups = new Map<string, VendorSummary>();

    for (const comision of comisiones) {
      if (comision.estado === "anulada") continue;

      const sellerName = getSellerName(comision);
      const key = comision.vendedor?.id ?? sellerName;
      const current =
        groups.get(key) ??
        ({
          id: key,
          name: sellerName,
          units: 0,
          soldByCurrency: new Map<string, number>(),
          commissionByCurrency: new Map<string, number>(),
          totalSoldNominal: 0,
          totalCommissionNominal: 0,
          potentialLeads: [],
        } as VendorSummary);

      current.units += 1;

      const saleCurrency = (comision.venta?.moneda ?? comision.moneda ?? "ARS").toUpperCase();
      const saleAmount = comision.venta?.precio_venta ?? 0;
      current.soldByCurrency.set(
        saleCurrency,
        (current.soldByCurrency.get(saleCurrency) ?? 0) + saleAmount
      );

      const commissionCurrency = (comision.moneda ?? "ARS").toUpperCase();
      const commissionAmount = comision.monto_comision ?? 0;
      current.commissionByCurrency.set(
        commissionCurrency,
        (current.commissionByCurrency.get(commissionCurrency) ?? 0) + commissionAmount
      );

      current.totalSoldNominal += saleAmount;
      current.totalCommissionNominal += commissionAmount;

      groups.set(key, current);
    }

    for (const lead of potenciales) {
      const sellerName = lead.vendedor?.nombre ?? "Sin vendedor";
      const key = lead.vendedor?.id ?? sellerName;
      const current =
        groups.get(key) ??
        ({
          id: key,
          name: sellerName,
          units: 0,
          soldByCurrency: new Map<string, number>(),
          commissionByCurrency: new Map<string, number>(),
          totalSoldNominal: 0,
          totalCommissionNominal: 0,
          potentialLeads: [],
        } as VendorSummary);
      current.potentialLeads.push(lead);
      groups.set(key, current);
    }

    return Array.from(groups.values()).sort(
      (left, right) => right.totalCommissionNominal - left.totalCommissionNominal
    );
  }, [comisiones, potenciales]);

  const maxSold = Math.max(...summaries.map((summary) => summary.totalSoldNominal), 0);
  const maxCommission = Math.max(...summaries.map((summary) => summary.totalCommissionNominal), 0);

  if (!summaries.length) {
    return (
      <section className="rounded-md border border-[#E5E7EB] bg-white p-4">
        <div className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-6 text-sm text-[#6B7280]">
          No hay comisiones para comparar todavía.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-[#E5E7EB] bg-white p-4">
      <div className="space-y-1 border-b border-[#E5E7EB] pb-4">
        <h2 className="text-base font-semibold text-[#111827]">Comparativa comercial</h2>
        <p className="text-sm text-[#6B7280]">
          Volumen vendido y comisión generada por vendedor.
        </p>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {summaries.map((summary) => {
          const soldBarWidth = maxSold > 0 ? Math.max((summary.totalSoldNominal / maxSold) * 100, 5) : 0;
          const commissionBarWidth = maxCommission > 0 ? Math.max((summary.totalCommissionNominal / maxCommission) * 100, 5) : 0;
          const effectiveRate = getEffectiveRate(summary);
          const isExpanded = expandedVendors.has(summary.id);
          const potentialSold = new Map<string, number>();
          const potentialCommission = new Map<string, number>();
          for (const lead of summary.potentialLeads) {
            const currency = (lead.vehiculo?.precio_moneda ?? "ARS").toUpperCase();
            const amount = getPotentialAmount(lead);
            const commission = getPotentialCommission(lead);
            if (amount != null) potentialSold.set(currency, (potentialSold.get(currency) ?? 0) + amount);
            if (commission != null) potentialCommission.set(currency, (potentialCommission.get(currency) ?? 0) + commission);
          }

          return (
            <article key={summary.id} className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-4 transition hover:border-[#D8A1B2]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#111827]">{summary.name}</p>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    {summary.units} {summary.units === 1 ? "unidad vendida" : "unidades vendidas"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {effectiveRate != null ? (
                    <span className="rounded-full border border-[#D8A1B2] bg-[#FDF2F5] px-2.5 py-1 text-xs font-medium text-[#8A1538]">
                      {effectiveRate.toLocaleString("es-AR", { maximumFractionDigits: 2 })}% sobre ventas
                    </span>
                  ) : null}
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-label={`${isExpanded ? "Ocultar" : "Ver"} oportunidades de ${summary.name}`}
                    onClick={() => setExpandedVendors((current) => {
                      const next = new Set(current);
                      if (next.has(summary.id)) next.delete(summary.id);
                      else next.add(summary.id);
                      return next;
                    })}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] transition hover:border-[#D8A1B2] hover:text-[#8A1538]"
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <MetricBlock
                  label="Vendido"
                  value={summarizeCurrencyMap(summary.soldByCurrency)}
                  detail={formatCurrencyBreakdown(summary.soldByCurrency)}
                  barWidth={soldBarWidth}
                  barClassName="bg-slate-500"
                />
                <MetricBlock
                  label="Comisión"
                  value={summarizeCurrencyMap(summary.commissionByCurrency)}
                  detail={formatCurrencyBreakdown(summary.commissionByCurrency)}
                  barWidth={commissionBarWidth}
                  barClassName="bg-[#8A1538]"
                />
              </div>

              {isExpanded ? (
                <div className="mt-4 border-t border-[#E5E7EB] pt-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">Oportunidades activas</p>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        Leads con vehículo de interés asignado. Son proyecciones, no comisiones generadas.
                      </p>
                    </div>
                    <div className="text-right text-xs text-[#6B7280]">
                      <p>{summary.potentialLeads.length} {summary.potentialLeads.length === 1 ? "lead" : "leads"}</p>
                      <p className="font-medium text-[#8A1538]">Potencial: {formatCurrencyBreakdown(potentialCommission)}</p>
                    </div>
                  </div>

                  {summary.potentialLeads.length ? (
                    <div className="mt-3 space-y-2">
                      {summary.potentialLeads.map((lead) => {
                        const vehicle = lead.vehiculo;
                        const amount = getPotentialAmount(lead);
                        const commission = getPotentialCommission(lead);
                        const currency = vehicle?.precio_moneda ?? "ARS";
                        return (
                          <div key={lead.id} className="grid gap-2 rounded-md border border-[#E5E7EB] bg-white px-3 py-3 text-sm md:grid-cols-[1.1fr_1.4fr_auto_auto] md:items-center">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-[#111827]">{lead.nombre ?? "Lead sin nombre"}</p>
                              <p className="text-xs text-[#6B7280]">{lead.origen === "whatsapp" ? "WhatsApp" : "Lead activo"} · {lead.estado ?? "nuevo"}</p>
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-[#166534]">Interés: {getPotentialVehicleName(lead)}</p>
                              <p className="truncate text-xs text-[#6B7280]">{[vehicle?.version, vehicle?.anio, vehicle?.dominio].filter(Boolean).join(" · ") || "Datos pendientes"}</p>
                            </div>
                            <div className="md:text-right">
                              <p className="text-xs text-[#6B7280]">Venta estimada</p>
                              <p className="font-semibold text-[#111827]">{amount == null ? "A confirmar" : formatMoney(amount, currency)}</p>
                            </div>
                            <div className="md:text-right">
                              <p className="text-xs text-[#6B7280]">Comisión estimada</p>
                              <p className="font-semibold text-[#8A1538]">{commission == null ? "A confirmar" : formatMoney(commission, currency)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-3 rounded-md border border-dashed border-[#E5E7EB] bg-white px-3 py-4 text-sm text-[#6B7280]">
                      No hay oportunidades con vehículo de interés asignado.
                    </p>
                  )}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MetricBlock({
  label,
  value,
  detail,
  barWidth,
  barClassName,
}: {
  label: string;
  value: string;
  detail: string;
  barWidth: number;
  barClassName: string;
}) {
  return (
    <div className="min-w-0 rounded-md border border-[#E5E7EB] bg-white p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-medium text-[#6B7280]">{label}</p>
        <p className="truncate text-sm font-semibold text-[#111827]">{value}</p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
        <div className={`h-full rounded-full transition-all ${barClassName}`} style={{ width: `${barWidth}%` }} />
      </div>
      <p className="mt-2 truncate text-xs text-[#6B7280]">{detail}</p>
    </div>
  );
}
