import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { isDemoMode } from "@/lib/demo-mode";
import { mockComprasVehiculos } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAllSupabaseRows } from "@/lib/supabase/paginated";
import { CompraKpis } from "@/components/compras/compra-kpis";
import { ComprasTable } from "@/components/compras/compras-table";
import { filterByDateRange, parseDateRange } from "@/lib/date-range";
import { SectionSubheaderActions } from "@/components/dashboard/section-subheader-actions";
import { CollapsibleSummary } from "@/components/common/collapsible-summary";
import { SummaryChart } from "@/components/common/summary-chart";

export const metadata: Metadata = {
  title: "Compras | Funes Exclusivos",
};

export const dynamic = "force-dynamic";

type Compra = {
  id: string;
  vehiculo_id: string | null;
  proveedor_id: string | null;
  fecha: string | null;
  nro_operacion: string | null;
  precio_compra: number | null;
  precio_boleto: number | null;
  moneda: string | null;
  diferencia_b: number | null;
  deuda_pendiente: number | null;
  observaciones: string | null;
  created_at: string | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    version: string | null;
    anio: number | null;
    color: string | null;
    km: number | null;
    dominio: string | null;
    estado: string | null;
    costo_adquisicion: number | null;
    costo_moneda: string | null;
    fecha_compra: string | null;
    nro_operacion: string | null;
  } | null;
  proveedor: {
    id: string;
    nombre: string | null;
    categoria: string | null;
    telefono: string | null;
  } | null;
};

type RawCompra = Omit<Compra, "vehiculo" | "proveedor"> & {
  vehiculo: Compra["vehiculo"] | Compra["vehiculo"][] | null;
  proveedor: Compra["proveedor"] | Compra["proveedor"][] | null;
};

function normalizeSingleRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function ComprasPage({ searchParams }: { searchParams?: { from?: string; to?: string } }) {
  const dateRange = parseDateRange(searchParams);
  let compras: Compra[] = mockComprasVehiculos as unknown as Compra[];

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const comprasResult = await fetchAllSupabaseRows((from, to) =>
      supabase
        .from("compras_vehiculos")
        .select(
          "id,vehiculo_id,proveedor_id,fecha,nro_operacion,precio_compra,precio_boleto,moneda,diferencia_b,deuda_pendiente,observaciones,created_at,vehiculo:vehiculos!compras_vehiculos_vehiculo_id_fkey(id,marca,modelo,version,anio,color,km,dominio,estado,costo_adquisicion,costo_moneda,fecha_compra,nro_operacion),proveedor:proveedores!compras_vehiculos_proveedor_id_fkey(id,nombre,categoria,telefono)"
        )
        .order("fecha", { ascending: false })
        .order("created_at", { ascending: false })
        .range(from, to)
    );

    compras = ((comprasResult.data ?? []) as RawCompra[]).map((compra) => ({
      ...compra,
      vehiculo: normalizeSingleRelation(compra.vehiculo),
      proveedor: normalizeSingleRelation(compra.proveedor),
    }));
  }

  compras = filterByDateRange(compras, dateRange, (compra) => compra.fecha);
  const comprasPorEstado = [
    { label: "En stock", value: compras.filter((compra) => compra.vehiculo?.estado === "en_stock").length, tone: "emerald" as const },
    { label: "Vendidas", value: compras.filter((compra) => compra.vehiculo?.estado === "vendido").length, tone: "slate" as const },
    { label: "Consignación", value: compras.filter((compra) => compra.vehiculo?.estado === "en_consignacion").length, tone: "amber" as const },
  ];

  return (
    <section className="space-y-6">
      <SectionSubheaderActions>
        <Link href="/compras/nueva" className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-[#8A1538] px-3 text-xs font-medium text-white transition hover:bg-[#6F102D]">
          <Plus className="h-3.5 w-3.5" />
          Nueva compra
        </Link>
      </SectionSubheaderActions>
      <CollapsibleSummary sectionKey="compras">
        <div className="grid gap-4 md:grid-cols-2">
          <CompraKpis compras={compras} />
          <SummaryChart title="Compras por situación" description="Estado actual de las unidades incorporadas." items={comprasPorEstado} />
        </div>
      </CollapsibleSummary>
      <ComprasTable compras={compras} />
    </section>
  );
}
