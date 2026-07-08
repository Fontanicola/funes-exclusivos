import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Plus } from "lucide-react";
import { canManageSales } from "@/lib/auth/permissions";
import { isDemoMode } from "@/lib/demo-mode";
import { mockEmpleado, mockVentas } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { VentasTable } from "@/components/ventas/ventas-table";

export const metadata: Metadata = {
  title: "Ventas | Funes Exclusivos",
};

export const dynamic = "force-dynamic";

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
  lead?: {
    id: string;
    nombre: string | null;
    telefono: string | null;
    origen: string | null;
    estado: string | null;
  } | null;
  pagos?: Array<Record<string, any>>;
  entrega?: Record<string, any> | null;
};

type RawVenta = Omit<Venta, "vehiculo" | "vendedor" | "lead"> & {
  vehiculo:
    | Venta["vehiculo"]
    | Venta["vehiculo"][]
    | null;
  vendedor:
    | Venta["vendedor"]
    | Venta["vendedor"][]
    | null;
  lead:
    | Venta["lead"]
    | Venta["lead"][]
    | null;
};

type CurrencyTotal = {
  currency: string;
  total: number;
  count: number;
};

function formatCurrency(value: number, currency: string | null) {
  const isoCurrency = (currency ?? "").toLowerCase() === "usd" ? "USD" : "ARS";
  const symbol = isoCurrency === "USD" ? "US$" : "$";
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: isoCurrency,
    maximumFractionDigits: 0,
  }).format(value);

  return formatted.replace("US$", symbol).replace("$", symbol);
}

function formatCurrencyBreakdown(items: CurrencyTotal[]) {
  if (!items.length) return "—";

  return items
    .map((item) => `${item.currency} ${new Intl.NumberFormat("es-AR", {
      maximumFractionDigits: 0,
    }).format(item.total)}`)
    .join(" · ");
}

function formatAverageBreakdown(items: CurrencyTotal[]) {
  if (!items.length) return "—";

  return items
    .map((item) => `${item.currency} ${new Intl.NumberFormat("es-AR", {
      maximumFractionDigits: 0,
    }).format(item.total / item.count)}`)
    .join(" · ");
}

function formatLargeCurrencySummary(items: CurrencyTotal[]) {
  if (!items.length) return "—";
  if (items.length === 1) {
    const [item] = items;
    return formatCurrency(item.total, item.currency);
  }

  return "Mixto";
}

function formatLargeAverageSummary(items: CurrencyTotal[]) {
  if (!items.length) return "—";
  if (items.length === 1) {
    const [item] = items;
    return formatCurrency(item.total / item.count, item.currency);
  }

  return "Mixto";
}

function groupByCurrency(ventas: Venta[]) {
  const registered = ventas.filter((venta) => venta.estado === "registrada");
  const groups = new Map<string, CurrencyTotal>();

  for (const venta of registered) {
    const currency = (venta.moneda ?? "ARS").toUpperCase();
    const current = groups.get(currency) ?? {
      currency,
      total: 0,
      count: 0,
    };

    current.total += venta.precio_venta ?? 0;
    current.count += 1;
    groups.set(currency, current);
  }

  return Array.from(groups.values()).sort((left, right) =>
    left.currency.localeCompare(right.currency)
  );
}

function normalizeSingleRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function resolveAmount(value: Record<string, any>) {
  const raw = value?.importe ?? value?.monto ?? 0;
  return typeof raw === "number" ? raw : Number(raw) || 0;
}

function formatDeliveryState(estado: string | null | undefined) {
  const normalized = (estado ?? "").toLowerCase();
  if (["entregada", "entregado"].includes(normalized)) return "Entregada";
  if (["observada", "observado"].includes(normalized)) return "Observada";
  return "Pendiente";
}

export default async function VentasPage() {
  let ventas: Venta[] = mockVentas as Venta[];
  let canCreateSale = canManageSales(mockEmpleado.rol);

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const [
      { data },
      {
        data: { user },
      },
    ] = await Promise.all([
      supabase
        .from("ventas")
        .select(
          "id,fecha_venta,cliente_nombre,cliente_telefono,cliente_email,cliente_documento,precio_venta,moneda,metodo_pago,estado,monto_permuta,precio_infoauto,info_historica_compra,costo_reposicion,costo_historico,margen_reposicion,margen_historico,rotacion_dias,saldo_preventa,saldo_efectivo,importe_gestoria,importe_escribania,resultado_operativo,created_at,vehiculo_id,lead_id,vehiculo:vehiculos!ventas_vehiculo_id_fkey(id,marca,modelo,version,anio,dominio,fotos),vendedor:empleados!ventas_vendedor_id_fkey(id,nombre,email,rol),lead:leads!ventas_lead_id_fkey(id,nombre,telefono,origen,estado)"
        )
        .order("fecha_venta", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.auth.getUser(),
    ]);

    const baseVentas = ((data ?? []) as RawVenta[]).map((venta) => ({
      ...venta,
      vehiculo: normalizeSingleRelation(venta.vehiculo),
      vendedor: normalizeSingleRelation(venta.vendedor),
      lead: normalizeSingleRelation(venta.lead),
    }));

    const saleIds = baseVentas.map((venta) => venta.id);
    const [pagosResult, entregasResult] = saleIds.length
      ? await Promise.all([
          supabase.from("ventas_pagos").select("*").in("venta_id", saleIds),
          supabase.from("ventas_entregas").select("*").in("venta_id", saleIds),
        ])
      : [{ data: [] }, { data: [] }];

    const pagosPorVenta = new Map<string, Array<Record<string, any>>>();
    for (const pago of (pagosResult.data ?? []) as Array<Record<string, any>>) {
      const ventaId = String(pago?.venta_id ?? "");
      if (!ventaId) continue;
      const current = pagosPorVenta.get(ventaId) ?? [];
      current.push(pago);
      pagosPorVenta.set(ventaId, current);
    }

    const entregaPorVenta = new Map<string, Record<string, any>>();
    for (const entrega of (entregasResult.data ?? []) as Array<Record<string, any>>) {
      const ventaId = String(entrega?.venta_id ?? "");
      if (!ventaId) continue;
      entregaPorVenta.set(ventaId, entrega);
    }

    if (user) {
      const { data: employee } = await supabase
        .from("empleados")
        .select("id,rol,activo")
        .eq("id", user.id)
        .maybeSingle<{ id: string; rol: string | null; activo: boolean | null }>();

      canCreateSale = canManageSales(employee?.rol ?? null) && employee?.activo === true;
    }

    ventas = baseVentas.map((venta) => ({
      ...venta,
      pagos: pagosPorVenta.get(venta.id) ?? [],
      entrega: entregaPorVenta.get(venta.id) ?? null,
    }));
  }
  const ventasRegistradas = ventas.filter((venta) => venta.estado === "registrada");
  const currencyGroups = groupByCurrency(ventas);
  const totalRegistradas = ventasRegistradas.length;
  const entregasPendientes = ventas.filter((venta) => !venta.entrega || formatDeliveryState(venta.entrega?.estado) === "Pendiente").length;
  const entregasObservadas = ventas.filter((venta) => formatDeliveryState(venta.entrega?.estado) === "Observada").length;
  const entregasCompletadas = ventas.filter((venta) => formatDeliveryState(venta.entrega?.estado) === "Entregada").length;

  const totalPorMoneda = currencyGroups;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
              Ventas
            </h1>
            <p className="text-sm leading-6 text-[#6B7280]">
              Registro de operaciones y renta por vehículo
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/ventas/pendientes-entrega"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              Pendientes de entrega
            </Link>
            <Link
              href="/ventas/renta"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              <BarChart3 className="h-4 w-4" />
              Renta
            </Link>
          {canCreateSale ? (
            <Link
              href="/ventas/nueva"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A]"
            >
              <Plus className="h-4 w-4" />
              Nueva venta
            </Link>
          ) : (
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
              Solo lectura para tu rol.
            </div>
          )}
        </div>
        </div>
        {isDemoMode ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
            Modo demo: los datos son mock y no se guardará nada en Supabase.
          </div>
        ) : null}
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Ventas registradas</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">
            {totalRegistradas}
          </p>
        </article>
        <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Monto total vendido</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">
            {formatLargeCurrencySummary(totalPorMoneda)}
          </p>
          <p className="mt-2 text-xs text-[#6B7280]">
            {formatCurrencyBreakdown(totalPorMoneda)}
          </p>
        </article>
        <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Ticket promedio</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">
            {formatLargeAverageSummary(totalPorMoneda)}
          </p>
          <p className="mt-2 text-xs text-[#6B7280]">
            {formatAverageBreakdown(totalPorMoneda)}
          </p>
        </article>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Pendientes de entrega</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">
            {entregasPendientes}
          </p>
        </article>
        <article className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Entregadas</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">
            {entregasCompletadas}
          </p>
        </article>
        <article className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Observadas</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">
            {entregasObservadas}
          </p>
        </article>
      </div>

      <VentasTable ventas={ventas} />
    </section>
  );
}
