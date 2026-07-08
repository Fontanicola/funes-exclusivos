import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isDemoMode } from "@/lib/demo-mode";
import {
  calculateRentaKpis,
  calculateRentaRows,
  type RentaExpense,
  type RentaPayment,
  type RentaDelivery,
  type RentaVenta,
} from "@/lib/renta-metrics";
import {
  mockVentas,
  mockVehiculoGastos,
  mockVentasPagos,
  mockVentasEntregas,
} from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RentaKpis } from "@/components/ventas/renta-kpis";
import { RentaTable } from "@/components/ventas/renta-table";

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

export default async function VentaRentaPage() {
  let ventas = mockVentas as RentaVenta[];
  let gastos = mockVehiculoGastos as RentaExpense[];
  let pagos = mockVentasPagos as RentaPayment[];
  let entregas = mockVentasEntregas as RentaDelivery[];

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();

    const ventasQuery = supabase
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
      .limit(150);

    const gastosQuery = supabase
      .from("vehiculo_gastos")
      .select("id,vehiculo_id,tipo,monto,moneda,fecha,detalle")
      .order("fecha", { ascending: true })
      .limit(150);

    const pagosQuery = supabase
      .from("ventas_pagos")
      .select("id,venta_id,tipo,fecha,importe,moneda,medio,detalle")
      .order("fecha", { ascending: true })
      .limit(150);

    const entregasQuery = supabase
      .from("ventas_entregas")
      .select("id,venta_id,estado,fecha_entrega")
      .limit(150);

    const [ventasResult, gastosResult, pagosResult, entregasResult] = await Promise.all([
      ventasQuery,
      gastosQuery,
      pagosQuery,
      entregasQuery,
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
  }

  const rows = calculateRentaRows(ventas, gastos, pagos, entregas);
  const metrics = calculateRentaKpis(rows);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Link
              href="/ventas"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#111827]"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Ventas
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">Rentabilidad</h1>
            <p className="text-sm leading-6 text-[#6B7280]">
              Análisis de margen, pagos, gastos y resultado por operación.
            </p>
          </div>
        </div>
        {isDemoMode ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
            Modo demo: los cálculos se hacen con datos mock para simular la lectura operativa real.
          </div>
        ) : null}
      </header>

      <RentaKpis metrics={metrics} />
      <RentaTable rows={rows} />
    </section>
  );
}
