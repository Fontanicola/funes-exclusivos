import type { Metadata } from "next";
import { isDemoMode } from "@/lib/demo-mode";
import { canManageCaja } from "@/lib/auth/permissions";
import {
  mockEmpleado,
  mockActivos,
  mockCajaMovimientos,
  mockProveedores,
} from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAllSupabaseRows } from "@/lib/supabase/paginated";
import { CajaMovimientoForm } from "@/components/caja/caja-movimiento-form";
import { CajaMovimientosTable } from "@/components/caja/caja-movimientos-table";
import { DataEntryModal } from "@/components/common/data-entry-modal";
import { CajaSummary } from "@/components/caja/caja-summary";
import { filterByDateRange, parseDateRange } from "@/lib/date-range";

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

type BalanceSummary = {
  key: string;
  label: string;
  totals: CurrencyTotal[];
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

function normalizeAccount(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function resolveBalanceBucket(movimiento: Movimiento) {
  const account = normalizeAccount(movimiento.cuenta);
  const medium = normalizeAccount(movimiento.medio);
  const source = `${account} ${medium}`;

  if (source.includes("cta_hab_sol") || source.includes("gestor") || source.includes("gestoria")) {
    return { key: "gestoria", label: "Cta. cte. Gestoría" };
  }

  if (source.includes("banco_santander") || source.includes("santander")) {
    return { key: "banco", label: "Banco Santander" };
  }

  if (source.includes("efectivo") || source.includes("caja")) {
    return { key: "efectivo", label: "Efectivo" };
  }

  return { key: "otros", label: "Otros medios" };
}

function aggregateBalances(movimientos: Movimiento[]): BalanceSummary[] {
  const groups = new Map<string, BalanceSummary>();

  for (const movimiento of movimientos) {
    if (!["ingreso", "egreso"].includes(movimiento.tipo ?? "")) continue;

    const bucket = resolveBalanceBucket(movimiento);
    const currency = (movimiento.moneda ?? "ARS").toUpperCase();
    const group = groups.get(bucket.key) ?? { key: bucket.key, label: bucket.label, totals: [] };
    const total = group.totals.find((item) => item.currency === currency);
    const signedAmount = movimiento.tipo === "egreso" ? -resolveAmount(movimiento) : resolveAmount(movimiento);

    if (total) {
      total.total += signedAmount;
    } else {
      group.totals.push({ currency, total: signedAmount });
    }

    groups.set(bucket.key, group);
  }

  const order = ["efectivo", "banco", "gestoria", "otros"];
  return Array.from(groups.values()).sort((left, right) => order.indexOf(left.key) - order.indexOf(right.key));
}

export default async function CajaPage({ searchParams }: { searchParams?: { from?: string; to?: string } }) {
  const dateRange = parseDateRange(searchParams);
  let movimientos: Movimiento[] = mockCajaMovimientos as Movimiento[];
  let proveedores: Proveedor[] = mockProveedores as Proveedor[];
  let activos: Activo[] = mockActivos as Activo[];
  let currentRole: string | null = mockEmpleado.rol;

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();

    const [
      movimientosResult,
      proveedoresResult,
      activosResult,
      {
        data: { user },
      },
    ] = await Promise.all([
      fetchAllSupabaseRows((from, to) =>
        supabase
          .from("caja_movimientos")
          .select("id,tipo,origen,compra_id,venta_id,venta_pago_id,comision_liquidacion_id,monto,moneda,fecha,medio,concepto,detalle_1,detalle_2,detalle_3,periodo,cuenta,observaciones,created_at,proveedor:proveedores(id,nombre,categoria),activo:activos(id,tipo,nombre),compra:compras_vehiculos!caja_movimientos_compra_id_fkey(id,nro_operacion,fecha,vehiculo:vehiculos!compras_vehiculos_vehiculo_id_fkey(id,marca,modelo,dominio),proveedor:proveedores!compras_vehiculos_proveedor_id_fkey(id,nombre)),venta:ventas!caja_movimientos_venta_id_fkey(id,cliente_nombre,vehiculo:vehiculos!ventas_vehiculo_id_fkey(id,marca,modelo,version,anio,dominio)),liquidacion:comision_liquidaciones!caja_movimientos_comision_liquidacion_id_fkey(id,periodo,neto_a_cobrar,vendedor:empleados!comision_liquidaciones_vendedor_id_fkey(id,nombre,email))")
          .order("fecha", { ascending: false })
          .order("created_at", { ascending: false })
          .range(from, to)
      ),
      supabase
        .from("proveedores")
        .select("id,nombre,categoria")
        .eq("activo", true)
        .order("nombre")
        .limit(100),
      supabase
        .from("activos")
        .select("id,tipo,nombre")
        .eq("activo", true)
        .order("tipo")
        .order("nombre")
        .limit(100),
      supabase.auth.getUser(),
    ]);

    movimientos = ((movimientosResult.data ?? []) as unknown as RawMovimiento[]).map((movimiento) => ({
      ...movimiento,
      proveedor: normalizeSingleRelation(movimiento.proveedor),
      activo: normalizeSingleRelation(movimiento.activo),
      compra: normalizeSingleRelation(movimiento.compra ?? null),
      venta: normalizeSingleRelation(movimiento.venta ?? null),
      liquidacion: normalizeSingleRelation(movimiento.liquidacion ?? null),
    }));
    proveedores = (proveedoresResult.data ?? []) as Proveedor[];
    activos = (activosResult.data ?? []) as Activo[];

    if (user) {
      const { data: employee } = await supabase
        .from("empleados")
        .select("id,rol,activo")
        .eq("id", user.id)
        .maybeSingle<{ id: string; rol: string | null; activo: boolean | null }>();

      currentRole = employee?.rol ?? null;
    }
  }

  movimientos = filterByDateRange(movimientos, dateRange, (movimiento) => movimiento.fecha ?? movimiento.created_at);
  const ingresos = aggregateIncomeByCurrency(movimientos);
  const egresos = aggregateExpensesByCurrency(movimientos);
  const saldo = aggregateByCurrency(movimientos);
  const medios = aggregateByMedium(movimientos);
  const saldos = aggregateBalances(movimientos);

  return (
    <section className="space-y-6">
      {isDemoMode ? (
        <div className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
          Modo demo: los movimientos usan datos simulados y no se guardarán cambios reales.
        </div>
      ) : null}

      <CajaSummary
        ingresos={ingresos}
        egresos={egresos}
        saldo={saldo}
        movimientosCount={movimientos.length}
        medios={medios}
        saldos={saldos}
      />

      <div className="space-y-6">
        <div>
          {canManageCaja(currentRole) ? (
            <DataEntryModal
              triggerLabel="Cargar movimiento"
              title="Nuevo movimiento de caja"
              description="Registrá un ingreso o egreso manual."
            >
              <CajaMovimientoForm proveedores={proveedores} activos={activos} role={currentRole} />
            </DataEntryModal>
          ) : (
            <section className="rounded-md border border-[#E5E7EB] bg-white p-4">
              <div className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-5 text-sm text-[#6B7280]">
                No tenés permisos para cargar movimientos manuales.
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <CajaMovimientosTable movimientos={movimientos} />
        </div>
      </div>
    </section>
  );
}
