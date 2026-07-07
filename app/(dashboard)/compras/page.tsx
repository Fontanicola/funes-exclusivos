import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { isDemoMode } from "@/lib/demo-mode";
import { mockComprasVehiculos } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CompraKpis } from "@/components/compras/compra-kpis";
import { ComprasTable } from "@/components/compras/compras-table";

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

export default async function ComprasPage() {
  let compras: Compra[] = mockComprasVehiculos as unknown as Compra[];

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("compras_vehiculos")
      .select(
        "id,vehiculo_id,proveedor_id,fecha,nro_operacion,precio_compra,precio_boleto,moneda,diferencia_b,deuda_pendiente,observaciones,created_at,vehiculo:vehiculos!compras_vehiculos_vehiculo_id_fkey(id,marca,modelo,version,anio,color,km,dominio,estado,costo_adquisicion,costo_moneda,fecha_compra,nro_operacion),proveedor:proveedores!compras_vehiculos_proveedor_id_fkey(id,nombre,categoria,telefono)"
      )
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false });

    compras = ((data ?? []) as RawCompra[]).map((compra) => ({
      ...compra,
      vehiculo: normalizeSingleRelation(compra.vehiculo),
      proveedor: normalizeSingleRelation(compra.proveedor),
    }));
  }

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">Compras</h1>
            <p className="text-sm leading-6 text-[#6B7280]">
              Ingreso de unidades, proveedores y costos de adquisición
            </p>
          </div>

          <Link
            href="/compras/nueva"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A]"
          >
            <Plus className="h-4 w-4" />
            Nueva compra
          </Link>
        </div>
      </header>

      <CompraKpis compras={compras} />
      <ComprasTable compras={compras} />
    </section>
  );
}
