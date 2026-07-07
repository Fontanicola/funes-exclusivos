import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getVehiculoById,
  normalizeFotosArray,
} from "@/app/(dashboard)/inventario/actions";
import { isDemoMode } from "@/lib/demo-mode";
import { mockProveedores } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { VehiculoForm } from "@/components/inventario/vehiculo-form";

type PageProps = {
  params: {
    id: string;
  };
};

export const metadata: Metadata = {
  title: "Editar vehículo | Funes Exclusivos",
};

type Proveedor = {
  id: string;
  nombre: string | null;
  categoria: string | null;
};

export default async function EditarVehiculoPage({ params }: PageProps) {
  const vehiculo = await getVehiculoById(params.id);

  if (!vehiculo) {
    notFound();
  }

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

  const fotos = await normalizeFotosArray(vehiculo.fotos);
  const subtitleParts = [
    [vehiculo.marca, vehiculo.modelo].filter(Boolean).join(" "),
    vehiculo.dominio ? vehiculo.dominio : null,
  ].filter(Boolean);

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
            Editar vehículo
          </h1>
          <p className="text-sm leading-6 text-[#6B7280]">
            {subtitleParts.join(" · ")}
          </p>
        </div>
      </header>

      <VehiculoForm
        mode="edit"
        proveedores={proveedores}
        vehiculo={{
          id: vehiculo.id,
          marca: vehiculo.marca,
          modelo: vehiculo.modelo,
          version: vehiculo.version,
          anio: vehiculo.anio,
          color: vehiculo.color,
          km: vehiculo.km,
          dominio: vehiculo.dominio,
          costo_adquisicion: vehiculo.costo_adquisicion,
          costo_moneda: vehiculo.costo_moneda,
          precio_venta: vehiculo.precio_venta,
          precio_moneda: vehiculo.precio_moneda,
          estado: vehiculo.estado,
          motor: vehiculo.motor,
          ubicacion: vehiculo.ubicacion,
          nro_operacion: vehiculo.nro_operacion,
          proveedor_id: vehiculo.proveedor_id,
          fecha_compra: vehiculo.fecha_compra,
          precio_infoauto_compra: vehiculo.precio_infoauto_compra,
          precio_infoauto_actual: vehiculo.precio_infoauto_actual,
          precio_infoauto_anterior: vehiculo.precio_infoauto_anterior,
          precio_permuta: vehiculo.precio_permuta,
          precio_contado: vehiculo.precio_contado,
          costo_reposicion: vehiculo.costo_reposicion,
          estado_preparacion: vehiculo.estado_preparacion,
          chapero: vehiculo.chapero,
          preparacion_comentarios: vehiculo.preparacion_comentarios,
          publicado_mercadolibre: vehiculo.publicado_mercadolibre,
          publicado_rodados_google: vehiculo.publicado_rodados_google,
          fotos,
          fecha_ingreso: vehiculo.fecha_ingreso,
          descripcion: vehiculo.descripcion ?? null,
          observaciones: vehiculo.observaciones ?? null,
        }}
      />
    </section>
  );
}
