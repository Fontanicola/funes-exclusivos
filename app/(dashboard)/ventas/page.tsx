import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Plus } from "lucide-react";
import { canViewMargins } from "@/lib/auth/permissions";
import { isDemoMode } from "@/lib/demo-mode";
import { mockEmpleado, mockVentas } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAllSupabaseRows } from "@/lib/supabase/paginated";
import { VentasTable } from "@/components/ventas/ventas-table";
import { filterByDateRange, parseDateRange } from "@/lib/date-range";
import { CollapsibleSummary } from "@/components/common/collapsible-summary";
import { SectionSubheaderActions } from "@/components/dashboard/section-subheader-actions";
import { SummaryChart } from "@/components/common/summary-chart";

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

export default async function VentasPage({ searchParams }: { searchParams?: { from?: string; to?: string } }) {
  const dateRange = parseDateRange(searchParams);
  let ventas: Venta[] = mockVentas as Venta[];
  let currentRole: string | null = mockEmpleado.rol;

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const [
      ventasResult,
      {
        data: { user },
      },
    ] = await Promise.all([
      fetchAllSupabaseRows((from, to) =>
        supabase
          .from("ventas")
          .select(
            "id,fecha_venta,cliente_nombre,cliente_telefono,cliente_email,cliente_documento,precio_venta,moneda,metodo_pago,estado,monto_permuta,precio_infoauto,info_historica_compra,costo_reposicion,costo_historico,margen_reposicion,margen_historico,rotacion_dias,saldo_preventa,saldo_efectivo,importe_gestoria,importe_escribania,resultado_operativo,created_at,vehiculo_id,lead_id,vehiculo:vehiculos!ventas_vehiculo_id_fkey(id,marca,modelo,version,anio,dominio,fotos),vendedor:empleados!ventas_vendedor_id_fkey(id,nombre,email,rol),lead:leads!ventas_lead_id_fkey(id,nombre,telefono,origen,estado)"
          )
          .order("fecha_venta", { ascending: false })
          .order("created_at", { ascending: false })
          .range(from, to)
      ),
      supabase.auth.getUser(),
    ]);

    if (ventasResult.error) {
      console.error("Ventas query failed", ventasResult.error);
    }

    const baseVentas = ((ventasResult.data ?? []) as RawVenta[]).map((venta) => ({
      ...venta,
      vehiculo: normalizeSingleRelation(venta.vehiculo),
      vendedor: normalizeSingleRelation(venta.vendedor),
      lead: normalizeSingleRelation(venta.lead),
    }));

    const saleIds = baseVentas.map((venta) => venta.id);
    const [pagosResult, entregasResult] = saleIds.length
      ? await Promise.all([
          supabase
            .from("ventas_pagos")
            .select("id,venta_id,tipo,importe,moneda,medio,fecha,detalle")
            .in("venta_id", saleIds)
            .order("fecha", { ascending: true }),
          supabase
            .from("ventas_entregas")
            .select("id,venta_id,estado,fecha_entrega")
            .in("venta_id", saleIds)
            .order("fecha_entrega", { ascending: true, nullsFirst: false }),
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

      currentRole = employee?.rol ?? null;
    }

    ventas = baseVentas.map((venta) => ({
      ...venta,
      pagos: pagosPorVenta.get(venta.id) ?? [],
      entrega: entregaPorVenta.get(venta.id) ?? null,
    }));
  }
  ventas = filterByDateRange(ventas, dateRange, (venta) => venta.fecha_venta ?? venta.created_at);
  const ventasRegistradas = ventas.filter((venta) => venta.estado === "registrada");
  const currencyGroups = groupByCurrency(ventas);
  const totalRegistradas = ventasRegistradas.length;

  const totalPorMoneda = currencyGroups;
  const ventasPorEstado = ["registrada", "entregada", "anulada"].map((estado) => ({
    label: estado === "registrada" ? "Registradas" : estado === "entregada" ? "Entregadas" : "Anuladas",
    value: ventas.filter((venta) => venta.estado === estado).length,
    tone: estado === "anulada" ? "rose" as const : estado === "entregada" ? "emerald" as const : "zinc" as const,
  }));

  return (
    <section className="space-y-6">
      {isDemoMode ? (
        <div className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
          Modo demo: los datos son simulados y no se guardarán cambios reales.
        </div>
      ) : null}

      <SectionSubheaderActions>
        <Link href="/ventas/pendientes-entrega" className="inline-flex h-8 items-center rounded-md border border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#111827] hover:bg-[#F9FAFB]">
          Pendientes de entrega
        </Link>
        {canViewMargins(currentRole) ? (
          <Link href="/ventas/renta" className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#111827] hover:bg-[#F9FAFB]">
            <BarChart3 className="h-3.5 w-3.5" />
            Rentabilidad
          </Link>
        ) : null}
        <Link href="/ventas/nueva" className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-[#8A1538] px-3 text-xs font-medium text-white hover:bg-[#6F102D]">
          <Plus className="h-3.5 w-3.5" />
          Nueva venta
        </Link>
      </SectionSubheaderActions>

      <CollapsibleSummary sectionKey="ventas">
        <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-md border border-[#E5E7EB] bg-white p-4">
          <p className="text-sm font-medium text-[#6B7280]">Ventas registradas</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">
            {totalRegistradas}
          </p>
        </article>
        <article className="rounded-md border border-[#E5E7EB] bg-white p-4">
          <p className="text-sm font-medium text-[#6B7280]">Monto total vendido</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">
            {formatLargeCurrencySummary(totalPorMoneda)}
          </p>
          <p className="mt-2 text-xs text-[#6B7280]">
            {formatCurrencyBreakdown(totalPorMoneda)}
          </p>
        </article>
        <article className="rounded-md border border-[#E5E7EB] bg-white p-4">
          <p className="text-sm font-medium text-[#6B7280]">Ticket promedio</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">
            {formatLargeAverageSummary(totalPorMoneda)}
          </p>
          <p className="mt-2 text-xs text-[#6B7280]">
            {formatAverageBreakdown(totalPorMoneda)}
          </p>
        </article>
        </div>
        <SummaryChart
          title="Ventas por estado"
          description="Distribución de las operaciones cargadas."
          items={ventasPorEstado}
        />
      </CollapsibleSummary>

      <VentasTable
        ventas={ventas}
        role={currentRole}
      />
    </section>
  );
}
