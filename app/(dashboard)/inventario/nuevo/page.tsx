import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isDemoMode } from "@/lib/demo-mode";
import { mockProveedores } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { VehiculoForm } from "@/components/inventario/vehiculo-form";

export const metadata: Metadata = {
  title: "Nuevo vehículo | Funes Exclusivos",
};

export const dynamic = "force-dynamic";

type Proveedor = {
  id: string;
  nombre: string | null;
  categoria: string | null;
};

export default async function NuevoVehiculoPage() {
  let proveedores: Proveedor[] = mockProveedores as Proveedor[];

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("proveedores")
      .select("id,nombre,categoria")
      .eq("activo", true)
      .order("nombre");

    proveedores = (data ?? []) as Proveedor[];
  }

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <Link
          href="/inventario"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#111827]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inventario
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
            Nuevo vehículo
          </h1>
          <p className="text-sm leading-6 text-[#6B7280]">
            Cargar una unidad al inventario
          </p>
        </div>
        {isDemoMode ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
            Modo demo: este formulario no guardará datos reales hasta conectar Supabase.
          </div>
        ) : null}
      </header>

      <VehiculoForm mode="create" proveedores={proveedores} />
    </section>
  );
}
