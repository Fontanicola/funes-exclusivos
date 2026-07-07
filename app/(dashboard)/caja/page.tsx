import type { Metadata } from "next";
import { isDemoMode } from "@/lib/demo-mode";
import {
  mockActivos,
  mockCajaMovimientos,
  mockProveedores,
} from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CajaMovimientoForm } from "@/components/caja/caja-movimiento-form";
import { CajaMovimientosTable } from "@/components/caja/caja-movimientos-table";

export const metadata: Metadata = {
  title: "Caja | Funes Exclusivos",
};

export const dynamic = "force-dynamic";

type Proveedor = {
  id: string;
  nombre: string | null;
  categoria: string | null;
};

type Activo = {
  id: string;
  tipo: string | null;
  nombre: string | null;
};

type Movimiento = {
  id: string;
  tipo: string | null;
  origen?: string | null;
  compra_id?: string | null;
  venta_id?: string | null;
  venta_pago_id?: string | null;
  comision_liquidacion_id?: string | null;
  monto: number | null;
  importe?: number | null;
  moneda: string | null;
  fecha: string | null;
  medio?: string | null;
  concepto?: string | null;
  detalle_1: string | null;
  detalle_2: string | null;
  detalle_3: string | null;
  periodo?: string | null;
  cuenta?: string | null;
  observaciones: string | null;
  created_at: string | null;
  proveedor: Proveedor | null;
  activo: Activo | null;
  compra?: {
    id: string;
    nro_operacion: string | null;
    fecha: string | null;
    vehiculo: {
      id: string;
      marca: string | null;
      modelo: string | null;
      dominio: string | null;
    } | null;
    proveedor: {
      id: string;
      nombre: string | null;
    } | null;
  } | null;
  venta?: {
    id: string;
    cliente_nombre: string | null;
    vehiculo: {
      id: string;
      marca: string | null;
      modelo: string | null;
      version: string | null;
      anio: number | null;
      dominio: string | null;
    } | null;
  } | null;
  liquidacion?: {
    id: string;
    periodo: string | null;
    neto_a_cobrar: number | null;
    vendedor: {
      id: string;
      nombre: string | null;
      email: string | null;
    } | null;
  } | null;
};

type RawMovimiento = Omit<Movimiento, "proveedor" | "activo" | "venta" | "compra" | "liquidacion"> & {
  proveedor: Proveedor | Proveedor[] | null;
  activo: Activo | Activo[] | null;
  compra?: Movimiento["compra"] | Movimiento["compra"][] | null;
  venta?: Movimiento["venta"] | Movimiento["venta"][] | null;
  liquidacion?: Movimiento["liquidacion"] | Movimiento["liquidacion"][] | null;
};

function normalizeSingleRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function sameMonth(dateValue: string | null, reference: Date) {
  if (!dateValue) return false;
  const [year, month] = dateValue.split("-").map(Number);

  return (
    year === reference.getFullYear() &&
    month === reference.getMonth() + 1
  );
}

function resolveAmount(movimiento: Movimiento) {
  return movimiento.importe ?? movimiento.monto ?? 0;
}

function resolveMedium(movimiento: Movimiento) {
  return movimiento.medio ?? movimiento.cuenta ?? movimiento.concepto ?? "otro";
}

type CurrencyTotal = {
  currency: string;
  total: number;
};

function formatAmountOnly(value: number) {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
}

function formatMoney(value: number, currency: string | null) {
  const normalizedCurrency = (currency ?? "").toUpperCase() === "USD" ? "USD" : "ARS";
  const symbol = normalizedCurrency === "USD" ? "US$" : "$";
  const amount = formatAmountOnly(value);
  return `${value < 0 ? "-" : ""}${symbol} ${amount}`;
}

function summarizeGroups(groups: CurrencyTotal[]) {
  if (!groups.length) return "—";
  if (groups.length === 1) {
    const [group] = groups;
    return formatMoney(group.total, group.currency);
  }

  return "Mixto";
}

function formatBreakdown(groups: CurrencyTotal[]) {
  if (!groups.length) return "—";

  return groups
    .map((group) => `${group.currency} ${formatMoney(group.total, group.currency)}`)
    .join(" · ");
}

function aggregateByCurrency(movimientos: Movimiento[], tipo?: "ingreso" | "egreso") {
  const reference = new Date();
  const groups = new Map<string, CurrencyTotal>();

  for (const movimiento of movimientos) {
    if (!sameMonth(movimiento.fecha, reference)) continue;
    if (tipo && movimiento.tipo !== tipo) continue;

    const currency = (movimiento.moneda ?? "ARS").toUpperCase();
    const current = groups.get(currency) ?? { currency, total: 0 };
    const signedAmount =
      movimiento.tipo === "egreso"
        ? -resolveAmount(movimiento)
        : resolveAmount(movimiento);

    current.total += signedAmount;
    groups.set(currency, current);
  }

  return Array.from(groups.values()).sort((left, right) =>
    left.currency.localeCompare(right.currency)
  );
}

function aggregateByMedium(movimientos: Movimiento[]) {
  const reference = new Date();
  const groups = new Map<string, { medium: string; count: number; ingresos: number; egresos: number }>();

  for (const movimiento of movimientos) {
    if (!sameMonth(movimiento.fecha, reference)) continue;
    const medium = resolveMedium(movimiento);
    const current = groups.get(medium) ?? { medium, count: 0, ingresos: 0, egresos: 0 };
    const amount = resolveAmount(movimiento);
    current.count += 1;
    if (movimiento.tipo === "egreso") current.egresos += amount;
    else current.ingresos += amount;
    groups.set(medium, current);
  }

  return Array.from(groups.values()).sort((left, right) => right.count - left.count).slice(0, 6);
}

function aggregateExpensesByCurrency(movimientos: Movimiento[]) {
  return aggregateByCurrency(movimientos, "egreso");
}

function aggregateIncomeByCurrency(movimientos: Movimiento[]) {
  return aggregateByCurrency(movimientos, "ingreso");
}

export default async function CajaPage() {
  let movimientos: Movimiento[] = mockCajaMovimientos as Movimiento[];
  let proveedores: Proveedor[] = mockProveedores as Proveedor[];
  let activos: Activo[] = mockActivos as Activo[];

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();

    const [movimientosResult, proveedoresResult, activosResult] = await Promise.all([
      supabase
        .from("caja_movimientos")
        .select("*,proveedor:proveedores(id,nombre,categoria),activo:activos(id,tipo,nombre),compra:compras_vehiculos!caja_movimientos_compra_id_fkey(id,nro_operacion,fecha,vehiculo:vehiculos!compras_vehiculos_vehiculo_id_fkey(id,marca,modelo,dominio),proveedor:proveedores!compras_vehiculos_proveedor_id_fkey(id,nombre)),venta:ventas!caja_movimientos_venta_id_fkey(id,cliente_nombre,vehiculo:vehiculos!ventas_vehiculo_id_fkey(id,marca,modelo,version,anio,dominio)),liquidacion:comision_liquidaciones!caja_movimientos_comision_liquidacion_id_fkey(id,periodo,neto_a_cobrar,vendedor:empleados!comision_liquidaciones_vendedor_id_fkey(id,nombre,email))")
        .order("fecha", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("proveedores")
        .select("id,nombre,categoria")
        .eq("activo", true)
        .order("nombre"),
      supabase
        .from("activos")
        .select("id,tipo,nombre")
        .eq("activo", true)
        .order("tipo")
        .order("nombre"),
    ]);

    movimientos = ((movimientosResult.data ?? []) as RawMovimiento[]).map((movimiento) => ({
      ...movimiento,
      proveedor: normalizeSingleRelation(movimiento.proveedor),
      activo: normalizeSingleRelation(movimiento.activo),
      compra: normalizeSingleRelation(movimiento.compra ?? null),
      venta: normalizeSingleRelation(movimiento.venta ?? null),
      liquidacion: normalizeSingleRelation(movimiento.liquidacion ?? null),
    }));
    proveedores = (proveedoresResult.data ?? []) as Proveedor[];
    activos = (activosResult.data ?? []) as Activo[];
  }

  const ingresos = aggregateIncomeByCurrency(movimientos);
  const egresos = aggregateExpensesByCurrency(movimientos);
  const saldo = aggregateByCurrency(movimientos);
  const medios = aggregateByMedium(movimientos);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
            Caja
          </h1>
          <p className="text-sm leading-6 text-[#6B7280]">
            Movimientos rápidos de ingresos y egresos
          </p>
        </div>
        {isDemoMode ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
            Modo demo: los movimientos son mock y no se guardará nada en Supabase.
          </div>
        ) : null}
      </header>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-6 xl:self-start">
          <CajaMovimientoForm proveedores={proveedores} activos={activos} />
        </aside>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-[#6B7280]">Ingresos del mes</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">
                {summarizeGroups(ingresos)}
              </p>
              <p className="mt-2 text-xs text-[#6B7280]">{formatBreakdown(ingresos)}</p>
            </article>
            <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-[#6B7280]">Egresos del mes</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">
                {summarizeGroups(
                  egresos.map((group) => ({
                    ...group,
                    total: Math.abs(group.total),
                  }))
                )}
              </p>
              <p className="mt-2 text-xs text-[#6B7280]">
                {formatBreakdown(
                  egresos.map((group) => ({
                    ...group,
                    total: Math.abs(group.total),
                  }))
                )}
              </p>
            </article>
            <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-[#6B7280]">Saldo del mes</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">
                {summarizeGroups(saldo)}
              </p>
              <p className="mt-2 text-xs text-[#6B7280]">{formatBreakdown(saldo)}</p>
            </article>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#111827]">Caja por medio</p>
                <p className="mt-1 text-xs text-[#6B7280]">Agrupado por medio operativo del mes.</p>
              </div>
              <span className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                Medios
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {medios.length ? (
                medios.map((medio) => {
                  const total = medio.ingresos + medio.egresos;
                  const max = Math.max(...medios.map((item) => item.ingresos + item.egresos), 1);
                  const width = Math.max(8, (total / max) * 100);

                  return (
                    <div key={medio.medium} className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-[#111827]">{medio.medium}</p>
                          <p className="text-xs text-[#6B7280]">{medio.count} movimientos</p>
                        </div>
                        <p className="text-sm font-semibold text-[#111827]">
                          {summarizeGroups(
                            aggregateByCurrency(
                              movimientos.filter((item) => resolveMedium(item) === medio.medium)
                            )
                          )}
                        </p>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white">
                        <div className="h-2 rounded-full bg-[#111827]" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-4 py-6 text-sm text-[#6B7280] md:col-span-2 xl:col-span-3">
                  Sin movimientos por medio todavía.
                </div>
              )}
            </div>
          </div>

          <CajaMovimientosTable movimientos={movimientos} />
        </div>
      </div>
    </section>
  );
}
