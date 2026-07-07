"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { LeadStatusBadge } from "@/components/crm/lead-status-badge";
import { LeadConvertSaleForm } from "@/components/crm/lead-convert-sale-form";

type Lead = {
  id: string;
  nombre: string | null;
  telefono?: string | null;
  email?: string | null;
  documento?: string | null;
  estado: string | null;
  origen: string | null;
  vehiculo_interes_id?: string | null;
  vendedor_id?: string | null;
  venta_id: string | null;
  fecha_ganado: string | null;
};

type Sale = {
  id: string;
  fecha_venta: string | null;
  precio_venta: number | null;
  moneda: string | null;
  estado: string | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    dominio: string | null;
  } | null;
} | null;

type Vehicle = {
  id: string;
  marca: string | null;
  modelo: string | null;
  version: string | null;
  anio: number | null;
  dominio: string | null;
  precio_venta: number | null;
  precio_moneda: string | null;
  estado: string | null;
};

type Seller = {
  id: string;
  nombre: string | null;
  email: string | null;
  rol: string | null;
  activo: boolean | null;
};

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

function getVehicleLabel(vehicle: NonNullable<Sale>["vehiculo"]) {
  if (!vehicle) return "—";
  return [vehicle.marca, vehicle.modelo, vehicle.dominio].filter(Boolean).join(" · ");
}

function getLeadWarning(estado: string | null) {
  return (estado ?? "").toLowerCase() === "perdido"
    ? "Este lead está marcado como perdido. Cambiá el estado antes de convertirlo."
    : null;
}

export function LeadDetail({
  lead,
  sale,
  vehicles,
  sellers,
}: {
  lead: Lead;
  sale: Sale;
  vehicles: Vehicle[];
  sellers: Seller[];
}) {
  const [showConversionForm, setShowConversionForm] = useState(false);
  const warning = useMemo(() => getLeadWarning(lead.estado), [lead.estado]);
  const hasSale = Boolean(sale);

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
              Conversión comercial
            </p>
            <LeadStatusBadge status={lead.estado} />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-[#111827]">
              {hasSale ? "Lead convertido en venta" : "Convertí este lead en una venta"}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-[#6B7280]">
              {hasSale
                ? "La oportunidad ya quedó asociada a una operación de venta y continúa disponible en el módulo Ventas."
                : "Revisá el vehículo, vendedor y datos del cliente antes de registrar la operación."
              }
            </p>
          </div>
          {warning ? (
            <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-sm text-[#111827]">
              {warning}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {hasSale ? (
            <Link
              href="/ventas"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              Ver ventas
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setShowConversionForm((value) => !value)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A]"
            >
              {showConversionForm ? (
                <>
                  Ocultar conversión
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Convertir en venta
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {hasSale ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-emerald-900">Lead convertido en venta</p>
              <p className="text-sm text-emerald-900/80">
                Venta registrada el {formatDate(sale?.fecha_venta ?? null)} · {getVehicleLabel(sale?.vehiculo ?? null)}
              </p>
              {lead.fecha_ganado ? (
                <p className="text-sm text-emerald-900/80">
                  Lead ganado el {formatDate(lead.fecha_ganado)}
                </p>
              ) : null}
              <p className="text-sm text-emerald-900/80">
                Precio {formatMoney(sale?.precio_venta ?? null, sale?.moneda ?? null)}
              </p>
            </div>
            <Link
              href="/ventas"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 text-sm font-medium text-emerald-900 transition hover:bg-emerald-50"
            >
              Ir a ventas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : showConversionForm ? (
        <div className="mt-5">
          <LeadConvertSaleForm lead={lead} vehicles={vehicles} sellers={sellers} />
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-4 py-6 text-sm text-[#6B7280]">
          Tocá “Convertir en venta” para cargar la operación y disparar automáticamente Caja, Comisión y Entrega.
        </div>
      )}
    </section>
  );
}
