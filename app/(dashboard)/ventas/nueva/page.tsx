import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isDemoMode } from "@/lib/demo-mode";
import { mockVehiculos } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { VentaForm } from "@/components/ventas/venta-form";

export const metadata: Metadata = {
  title: "Nueva venta | Funes Exclusivos",
};

export const dynamic = "force-dynamic";

type VehiculoDisponible = {
  id: string;
  marca: string | null;
  modelo: string | null;
  version: string | null;
  anio: number | null;
  dominio: string | null;
  precio_venta: number | null;
  precio_moneda: string | null;
  precio_contado?: number | null;
  precio_permuta?: number | null;
  precio_infoauto_actual?: number | null;
  costo_reposicion?: number | null;
  fotos: string[] | string | null;
};

export default async function NuevaVentaPage() {
  const vehiculos = isDemoMode
    ? (mockVehiculos.filter((vehiculo) => vehiculo.estado === "en_stock") as VehiculoDisponible[])
    : await (async () => {
        const supabase = createSupabaseServerClient();
        const { data } = await supabase
          .from("vehiculos")
          .select("id,marca,modelo,version,anio,dominio,precio_venta,precio_moneda,precio_contado,precio_permuta,precio_infoauto_actual,costo_reposicion,fotos")
          .eq("estado", "en_stock")
          .order("marca", { ascending: true })
          .order("modelo", { ascending: true });

        return (data ?? []) as VehiculoDisponible[];
      })();

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <Link
          href="/ventas"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#111827]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a ventas
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
            Nueva venta
          </h1>
          <p className="text-sm leading-6 text-[#6B7280]">
            Registrar una operación y actualizar inventario
          </p>
        </div>
        {isDemoMode ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
            Modo demo: esta venta no se registrará hasta conectar Supabase.
          </div>
        ) : null}
      </header>

      <VentaForm vehiculos={vehiculos} />
    </section>
  );
}
