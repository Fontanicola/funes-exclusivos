import type { Metadata } from "next";
import Link from "next/link";
import { isDemoMode } from "@/lib/demo-mode";
import { canManageCommissions } from "@/lib/auth/permissions";
import { mockEmpleado } from "@/lib/mock-data";
import { mockComisiones, mockLeads } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAllSupabaseRows } from "@/lib/supabase/paginated";
import { ComisionesComparativa } from "@/components/comisiones/comisiones-comparativa";
import { ComisionesVendedoresChart, type VendorSeries } from "@/components/comisiones/comisiones-vendedores-chart";
import { ComisionesTable } from "@/components/comisiones/comisiones-table";
import { filterByDateRange, parseDateRange } from "@/lib/date-range";
import { CollapsibleSummary } from "@/components/common/collapsible-summary";

export const metadata: Metadata = {
  title: "Comisiones | Funes Exclusivos",
};

export const dynamic = "force-dynamic";

type Comision = {
  id: string;
  venta_id: string | null;
  vendedor_id: string | null;
  base_comision: number | null;
  porcentaje: number | null;
  monto_comision: number | null;
  moneda: string | null;
  estado: string | null;
  fecha_generada: string | null;
  fecha_pago: string | null;
  observaciones: string | null;
  created_at: string | null;
  vendedor: {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
  } | null;
  venta: {
    id: string;
    fecha_venta: string | null;
    cliente_nombre: string | null;
    precio_venta: number | null;
    moneda: string | null;
    metodo_pago: string | null;
    estado: string | null;
    vehiculo: {
      id: string;
      marca: string | null;
      modelo: string | null;
      version: string | null;
      anio: number | null;
      dominio: string | null;
    } | null;
  } | null;
};

type RawComision = Omit<Comision, "vendedor" | "venta"> & {
  vendedor: Comision["vendedor"] | Comision["vendedor"][] | null;
  venta: Comision["venta"] | Comision["venta"][] | null;
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

type RawPotentialLead = Omit<PotentialLead, "vendedor" | "vehiculo"> & {
  vendedor: PotentialLead["vendedor"] | PotentialLead["vendedor"][] | null;
  vehiculo: PotentialLead["vehiculo"] | PotentialLead["vehiculo"][] | null;
};

type CurrencyTotal = {
  currency: string;
  total: number;
};

const chartColors = ["#8A1538", "#64748B", "#0F766E", "#B45309", "#475569", "#9F1239"];

function buildVendorChart(comisiones: Comision[]) {
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11 + index, 1));
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    return {
      key: `${year}-${month}`,
      label: new Intl.DateTimeFormat("es-AR", { month: "short", year: "2-digit", timeZone: "UTC" })
        .format(date)
        .replace(".", "")
        .toUpperCase(),
    };
  });
  const monthKeys = new Set(months.map((month) => month.key));
  const currencies = new Set<string>();
  const vendors = new Map<string, { name: string; units: Map<string, Set<string>>; sold: Map<string, Map<string, number>>; commission: Map<string, Map<string, number>> }>();

  for (const comision of comisiones) {
    if (comision.estado === "anulada" || comision.venta?.estado === "anulada") continue;
    const rawDate = comision.venta?.fecha_venta ?? comision.fecha_generada ?? comision.created_at;
    const monthKey = rawDate?.slice(0, 7);
    if (!monthKey || !monthKeys.has(monthKey)) continue;
    const vendorId = comision.vendedor?.id ?? comision.vendedor_id ?? "sin-vendedor";
    const vendor = vendors.get(vendorId) ?? {
      name: comision.vendedor?.nombre ?? "Sin vendedor",
      units: new Map(),
      sold: new Map(),
      commission: new Map(),
    };
    const units = vendor.units.get(monthKey) ?? new Set<string>();
    units.add(comision.venta_id ?? comision.venta?.id ?? comision.id);
    vendor.units.set(monthKey, units);
    const saleCurrency = (comision.venta?.moneda ?? comision.moneda ?? "ARS").toUpperCase();
    currencies.add(saleCurrency);
    const sold = vendor.sold.get(monthKey) ?? new Map<string, number>();
    sold.set(saleCurrency, (sold.get(saleCurrency) ?? 0) + (comision.venta?.precio_venta ?? comision.base_comision ?? 0));
    vendor.sold.set(monthKey, sold);
    const commissionCurrency = (comision.moneda ?? "ARS").toUpperCase();
    currencies.add(commissionCurrency);
    const commission = vendor.commission.get(monthKey) ?? new Map<string, number>();
    commission.set(commissionCurrency, (commission.get(commissionCurrency) ?? 0) + (comision.monto_comision ?? 0));
    vendor.commission.set(monthKey, commission);
    vendors.set(vendorId, vendor);
  }

  const series: VendorSeries[] = Array.from(vendors.entries()).map(([id, vendor], index) => ({
    id,
    name: vendor.name,
    color: chartColors[index % chartColors.length],
    points: months.map((month) => ({
      key: month.key,
      label: month.label,
      units: vendor.units.get(month.key)?.size ?? 0,
      soldByCurrency: Object.fromEntries(vendor.sold.get(month.key) ?? []),
      commissionByCurrency: Object.fromEntries(vendor.commission.get(month.key) ?? []),
    })),
  }));

  return { series, currencies: Array.from(currencies).sort() };
}

function normalizeSingleRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function formatMoney(value: number, currency: string | null) {
  const isoCurrency = (currency ?? "").toLowerCase() === "usd" ? "USD" : "ARS";
  const symbol = isoCurrency === "USD" ? "US$" : "$";
  const formatted = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(value);

  return `${symbol} ${formatted}`;
}

function formatBreakdown(groups: CurrencyTotal[]) {
  if (!groups.length) return "—";

  return groups
    .map((group) => formatMoney(group.total, group.currency))
    .join(" · ");
}

function summarize(groups: CurrencyTotal[]) {
  if (!groups.length) return "—";
  if (groups.length === 1) {
    const [group] = groups;
    return formatMoney(group.total, group.currency);
  }

  return "Mixto";
}

function aggregateByCurrency(comisiones: Comision[], field: "base_comision" | "monto_comision") {
  const groups = new Map<string, CurrencyTotal>();

  for (const comision of comisiones) {
    if (comision.estado === "anulada") continue;

    const currency = (comision.moneda ?? "ARS").toUpperCase();
    const current = groups.get(currency) ?? { currency, total: 0 };
    current.total += comision[field] ?? 0;
    groups.set(currency, current);
  }

  return Array.from(groups.values()).sort((left, right) =>
    left.currency.localeCompare(right.currency)
  );
}

function getUniqueSoldUnits(comisiones: Comision[]) {
  const saleIds = new Set<string>();

  for (const comision of comisiones) {
    if (comision.estado === "anulada" || comision.venta?.estado === "anulada") continue;
    if (comision.venta_id) {
      saleIds.add(comision.venta_id);
    } else if (comision.venta?.id) {
      saleIds.add(comision.venta.id);
    }
  }

  return saleIds.size;
}

export default async function ComisionesPage({ searchParams }: { searchParams?: { from?: string; to?: string } }) {
  const dateRange = parseDateRange(searchParams);
  let comisiones: Comision[] = mockComisiones as Comision[];
  let potenciales: PotentialLead[] = (mockLeads as unknown as RawPotentialLead[])
    .filter((lead) => !["ganado", "perdido"].includes(lead.estado ?? "") && lead.vehiculo)
    .map((lead) => ({
      ...lead,
      vendedor: normalizeSingleRelation(lead.vendedor),
      vehiculo: normalizeSingleRelation(lead.vehiculo),
    }));
  let currentRole: string | null = mockEmpleado.rol;

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const [
      { data: comisionesData },
      {
        data: { user },
      },
      { data: potentialData },
    ] = await Promise.all([
      fetchAllSupabaseRows((from, to) =>
        supabase
          .from("comisiones")
          .select(
            "id,venta_id,vendedor_id,base_comision,porcentaje,monto_comision,moneda,estado,fecha_generada,fecha_pago,observaciones,created_at,vendedor:empleados!comisiones_vendedor_id_fkey(id,nombre,email,rol),venta:ventas!comisiones_venta_id_fkey(id,fecha_venta,cliente_nombre,precio_venta,moneda,metodo_pago,estado,vehiculo:vehiculos!ventas_vehiculo_id_fkey(id,marca,modelo,version,anio,dominio))"
          )
          .order("fecha_generada", { ascending: false })
          .order("created_at", { ascending: false })
          .range(from, to)
      ),
      supabase.auth.getUser(),
      fetchAllSupabaseRows((from, to) =>
        supabase
          .from("leads")
          .select(
            "id,nombre,estado,origen,vendedor:empleados!leads_vendedor_id_fkey(id,nombre,comision_default_porcentaje),vehiculo:vehiculos!leads_vehiculo_interes_id_fkey(id,marca,modelo,version,anio,dominio,precio_venta,precio_moneda)"
          )
          .in("estado", ["nuevo", "contactado", "interesado", "negociacion", "reservado"])
          .not("vehiculo_interes_id", "is", null)
          .order("created_at", { ascending: false })
          .range(from, to)
      ),
    ]);

    comisiones = ((comisionesData ?? []) as unknown as RawComision[]).map((comision) => ({
      ...comision,
      vendedor: normalizeSingleRelation(comision.vendedor),
      venta: normalizeSingleRelation(comision.venta),
    }));

    potenciales = ((potentialData ?? []) as unknown as RawPotentialLead[]).map((lead) => ({
      ...lead,
      vendedor: normalizeSingleRelation(lead.vendedor),
      vehiculo: normalizeSingleRelation(lead.vehiculo),
    }));

    if (user) {
      const { data: employee } = await supabase
        .from("empleados")
        .select("id,rol,activo")
        .eq("id", user.id)
        .maybeSingle<{ id: string; rol: string | null; activo: boolean | null }>();

      currentRole = employee?.rol ?? null;
    }
  }

  const chartData = buildVendorChart(comisiones);
  comisiones = filterByDateRange(comisiones, dateRange, (comision) => comision.fecha_generada ?? comision.created_at);
  const comisionesValidas = comisiones.filter(
    (comision) => comision.estado !== "anulada" && comision.venta?.estado !== "anulada"
  );
  const unidadesVendidas = getUniqueSoldUnits(comisionesValidas);
  const montoTotalVendido = aggregateByCurrency(comisionesValidas, "base_comision");
  const comisionGenerada = aggregateByCurrency(comisionesValidas, "monto_comision");

  return (
    <section className="space-y-6">
      {isDemoMode ? (
        <div className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
          Modo demo: las comisiones usan datos simulados y no consultarán datos reales.
        </div>
      ) : null}

      <CollapsibleSummary sectionKey="comisiones">
        <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-md border border-[#E5E7EB] bg-white p-4">
          <p className="text-sm font-medium text-[#6B7280]">Unidades vendidas</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">
            {unidadesVendidas}
          </p>
        </article>
        <article className="rounded-md border border-[#E5E7EB] bg-white p-4">
          <p className="text-sm font-medium text-[#6B7280]">Monto total vendido</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">
            {summarize(montoTotalVendido)}
          </p>
          <p className="mt-2 text-xs text-[#6B7280]">
            {formatBreakdown(montoTotalVendido)}
          </p>
        </article>
        <article className="rounded-md border border-[#E5E7EB] bg-white p-4">
          <p className="text-sm font-medium text-[#6B7280]">Comisión generada</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">
            {summarize(comisionGenerada)}
          </p>
          <p className="mt-2 text-xs text-[#6B7280]">
            {formatBreakdown(comisionGenerada)}
          </p>
        </article>
        </div>
      </CollapsibleSummary>

      <ComisionesVendedoresChart {...chartData} />
      <ComisionesComparativa comisiones={comisiones} potenciales={potenciales} />
      <ComisionesTable
        comisiones={comisiones}
        toolbarAction={
          canManageCommissions(currentRole) ? (
            <Link
              href="/comisiones/liquidaciones"
              className="inline-flex h-10 items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              Liquidaciones
            </Link>
          ) : null
        }
      />
    </section>
  );
}
