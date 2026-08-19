import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isDemoMode } from "@/lib/demo-mode";
import { canViewMargins } from "@/lib/auth/permissions";
import {
  calculateRentaKpis,
  calculateRentaRows,
  type RentaExpense,
  type RentaPayment,
  type RentaDelivery,
  type RentaVenta,
} from "@/lib/renta-metrics";
import {
  mockEmpleado,
  mockVentas,
  mockVehiculoGastos,
  mockVentasPagos,
  mockVentasEntregas,
} from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAllSupabaseRows } from "@/lib/supabase/paginated";
import { RentaKpis } from "@/components/ventas/renta-kpis";
import { RentaTable } from "@/components/ventas/renta-table";
import { filterByDateRange, parseDateRange } from "@/lib/date-range";
import { CollapsibleSummary } from "@/components/common/collapsible-summary";
import { SummaryChart } from "@/components/common/summary-chart";

export const metadata: Metadata = {
  title: "Rentabilidad | Funes Exclusivos",
};

export const dynamic = "force-dynamic";

type RawVenta = RentaVenta & {
  vehiculo: RentaVenta["vehiculo"];
  vehiculo_recibido: RentaVenta["vehiculo_recibido"];
  vendedor: RentaVenta["vendedor"];
};

function normalizeSingleRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default async function VentaRentaPage({ searchParams }: { searchParams?: { from?: string; to?: string } }) {
  const dateRange = parseDateRange(searchParams);
  let ventas = mockVentas as RentaVenta[];
  let gastos = mockVehiculoGastos as RentaExpense[];
  let pagos = mockVentasPagos as RentaPayment[];
  let entregas = mockVentasEntregas as RentaDelivery[];
  let currentRole: string | null = mockEmpleado.rol;

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();

    const ventasQuery = fetchAllSupabaseRows((from, to) =>
      supabase
        .from("ventas")
        .select(
          [
          "id",
          "fecha_venta",
          "cliente_nombre",
          "precio_venta",
          "moneda",
          "metodo_pago",
          "estado",
          "monto_permuta",
          "precio_infoauto",
          "info_historica_compra",
          "costo_reposicion",
          "costo_historico",
          "margen_reposicion",
          "margen_historico",
          "rotacion_dias",
          "saldo_preventa",
          "saldo_efectivo",
          "importe_gestoria",
          "importe_escribania",
          "resultado_operativo",
          "created_at",
          "vehiculo:vehiculos!ventas_vehiculo_id_fkey(id,marca,modelo,version,anio,dominio,fecha_compra,costo_adquisicion,costo_moneda,costo_reposicion,precio_infoauto_compra,precio_infoauto_actual)",
          "vehiculo_recibido:vehiculos!ventas_vehiculo_recibido_id_fkey(id,marca,modelo,version,anio,dominio,costo_adquisicion,costo_moneda)",
          "vendedor:empleados!ventas_vendedor_id_fkey(id,nombre,email)",
          ].join(",")
        )
        .order("fecha_venta", { ascending: false })
        .order("created_at", { ascending: false })
        .range(from, to)
    );

    const gastosQuery = fetchAllSupabaseRows((from, to) =>
      supabase
        .from("vehiculo_gastos")
        .select("id,vehiculo_id,tipo,monto,moneda,fecha,detalle")
        .order("fecha", { ascending: true })
        .range(from, to)
    );

    const pagosQuery = fetchAllSupabaseRows((from, to) =>
      supabase
        .from("ventas_pagos")
        .select("id,venta_id,tipo,fecha,importe,moneda,medio,detalle")
        .order("fecha", { ascending: true })
        .range(from, to)
    );

    const entregasQuery = fetchAllSupabaseRows((from, to) =>
      supabase
        .from("ventas_entregas")
        .select("id,venta_id,estado,fecha_entrega")
        .range(from, to)
    );

    const [
      ventasResult,
      gastosResult,
      pagosResult,
      entregasResult,
      {
        data: { user },
      },
    ] = await Promise.all([
      ventasQuery,
      gastosQuery,
      pagosQuery,
      entregasQuery,
      supabase.auth.getUser(),
    ]);

    ventas = ((ventasResult.data ?? []) as unknown as RawVenta[]).map((venta) => ({
      ...venta,
      vehiculo: normalizeSingleRelation(venta.vehiculo),
      vehiculo_recibido: normalizeSingleRelation(venta.vehiculo_recibido),
      vendedor: normalizeSingleRelation(venta.vendedor),
    }));
    gastos = (gastosResult.data ?? []) as RentaExpense[];
    pagos = (pagosResult.data ?? []) as RentaPayment[];
    entregas = (entregasResult.data ?? []) as RentaDelivery[];

    if (user) {
      const { data: employee } = await supabase
        .from("empleados")
        .select("id,rol,activo")
        .eq("id", user.id)
        .maybeSingle<{ id: string; rol: string | null; activo: boolean | null }>();

      currentRole = employee?.rol ?? null;
    }
  }

  ventas = filterByDateRange(ventas, dateRange, (venta) => venta.fecha_venta ?? venta.created_at);
  gastos = filterByDateRange(gastos, dateRange, (gasto) => gasto.fecha);
  pagos = filterByDateRange(pagos, dateRange, (pago) => pago.fecha);
  entregas = filterByDateRange(entregas, dateRange, (entrega) => entrega.fecha_entrega);
  const rows = calculateRentaRows(ventas, gastos, pagos, entregas);
  const metrics = calculateRentaKpis(rows);
  const canSeeFinancials = canViewMargins(currentRole);
  const rentabilidadPorResultado = [
    {
      label: "Resultado positivo",
      value: rows.filter((row) => (row.resultadoOperativo ?? 0) > 0).length,
      tone: "emerald" as const,
    },
    {
      label: "Resultado neutral o negativo",
      value: rows.filter((row) => (row.resultadoOperativo ?? 0) <= 0).length,
      tone: "amber" as const,
    },
  ];

  return (
    <section className="space-y-6">
      <Link
        href="/ventas"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#111827]"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Ventas
      </Link>
      {isDemoMode ? (
        <div className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
          Modo demo: los cálculos usan datos simulados para mostrar una lectura operativa.
        </div>
      ) : null}

      <CollapsibleSummary sectionKey="ventas-rentabilidad">
        <div className="grid gap-4 md:grid-cols-2">
          <RentaKpis metrics={metrics} canViewFinancials={canSeeFinancials} />
          <SummaryChart
            title="Resultado por operación"
            description="Lectura rápida de las operaciones cargadas."
            items={rentabilidadPorResultado}
          />
        </div>
      </CollapsibleSummary>
      <RentaTable rows={rows} canViewFinancials={canSeeFinancials} />
    </section>
  );
}
