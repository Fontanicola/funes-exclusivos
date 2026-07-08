import type { Metadata } from "next";
import Link from "next/link";
import { isDemoMode } from "@/lib/demo-mode";
import { mockComisiones } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ComisionesComparativa } from "@/components/comisiones/comisiones-comparativa";
import { ComisionesTable } from "@/components/comisiones/comisiones-table";

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

type CurrencyTotal = {
  currency: string;
  total: number;
};

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

export default async function ComisionesPage() {
  let comisiones: Comision[] = mockComisiones as Comision[];

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("comisiones")
      .select(
        "id,venta_id,vendedor_id,base_comision,porcentaje,monto_comision,moneda,estado,fecha_generada,fecha_pago,observaciones,created_at,vendedor:empleados!comisiones_vendedor_id_fkey(id,nombre,email,rol),venta:ventas!comisiones_venta_id_fkey(id,fecha_venta,cliente_nombre,precio_venta,moneda,metodo_pago,estado,vehiculo:vehiculos!ventas_vehiculo_id_fkey(id,marca,modelo,version,anio,dominio))"
      )
      .order("fecha_generada", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(150);

    comisiones = ((data ?? []) as unknown as RawComision[]).map((comision) => ({
      ...comision,
      vendedor: normalizeSingleRelation(comision.vendedor),
      venta: normalizeSingleRelation(comision.venta),
    }));
  }

  const comisionesValidas = comisiones.filter(
    (comision) => comision.estado !== "anulada" && comision.venta?.estado !== "anulada"
  );
  const unidadesVendidas = getUniqueSoldUnits(comisionesValidas);
  const montoTotalVendido = aggregateByCurrency(comisionesValidas, "base_comision");
  const comisionGenerada = aggregateByCurrency(comisionesValidas, "monto_comision");

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
            Comisiones
          </h1>
          <p className="text-sm leading-6 text-[#6B7280]">
            KPIs y comparativa comercial por vendedor
          </p>
          </div>

          <Link
            href="/comisiones/liquidaciones"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Liquidaciones
          </Link>
        </div>
        {isDemoMode ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
            Modo demo: las comisiones son mock y no se consultará Supabase.
          </div>
        ) : null}
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Unidades vendidas</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">
            {unidadesVendidas}
          </p>
        </article>
        <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Monto total vendido</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">
            {summarize(montoTotalVendido)}
          </p>
          <p className="mt-2 text-xs text-[#6B7280]">
            {formatBreakdown(montoTotalVendido)}
          </p>
        </article>
        <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Comisión generada</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">
            {summarize(comisionGenerada)}
          </p>
          <p className="mt-2 text-xs text-[#6B7280]">
            {formatBreakdown(comisionGenerada)}
          </p>
        </article>
      </div>

      <ComisionesComparativa comisiones={comisiones} />
      <ComisionesTable comisiones={comisiones} />
    </section>
  );
}
