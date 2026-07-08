import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import { mockCatalogoConfig, mockVehiculos } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CatalogoVehicleDetail } from "@/components/catalogo-publico/catalogo-vehicle-detail";
import { CatalogoEmptyState } from "@/components/catalogo-publico/catalogo-empty-state";

export const dynamic = "force-dynamic";

type CatalogoConfig = {
  id: boolean;
  activo: boolean | null;
  titulo: string | null;
  descripcion: string | null;
  whatsapp_contacto: string | null;
  instagram_url: string | null;
  mostrar_precios: boolean | null;
  mostrar_km: boolean | null;
  mostrar_dominio: boolean | null;
};

type Vehiculo = {
  id: string;
  marca: string | null;
  modelo: string | null;
  version: string | null;
  anio: number | null;
  color: string | null;
  km: number | null;
  dominio: string | null;
  precio_venta: number | null;
  precio_contado?: number | null;
  precio_permuta?: number | null;
  precio_moneda: string | null;
  fotos: string[] | string | null;
  descripcion?: string | null;
  catalogo_titulo: string | null;
  catalogo_descripcion: string | null;
  catalogo_destacado: boolean | null;
  catalogo_publicado: boolean | null;
  estado: string | null;
};

async function loadCatalogoPublicoVehicle(id: string) {
  if (isDemoMode) {
    return {
      config: mockCatalogoConfig as CatalogoConfig,
      vehicle:
        ((mockVehiculos as unknown as Vehiculo[]).find(
          (item) => item.id === id && item.catalogo_publicado && item.estado === "en_stock"
        ) as Vehiculo | undefined) ?? null,
    };
  }

  const supabase = createSupabaseServerClient();
  const [configResult, vehicleResult] = await Promise.all([
    supabase
      .from("catalogo_config")
      .select(
        "id,activo,titulo,descripcion,whatsapp_contacto,instagram_url,mostrar_precios,mostrar_km,mostrar_dominio"
      )
      .eq("id", true)
      .maybeSingle<CatalogoConfig>(),
    supabase
      .from("vehiculos")
      .select(
        "id,marca,modelo,version,anio,color,km,dominio,precio_venta,precio_contado,precio_permuta,precio_moneda,fotos,descripcion,catalogo_titulo,catalogo_descripcion,catalogo_destacado,catalogo_publicado,estado"
      )
      .eq("id", id)
      .eq("estado", "en_stock")
      .eq("catalogo_publicado", true)
      .maybeSingle<Vehiculo>(),
  ]);

  return {
    config: configResult.data ?? (mockCatalogoConfig as CatalogoConfig),
    vehicle: vehicleResult.data ?? null,
  };
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { vehicle } = await loadCatalogoPublicoVehicle(params.id);

  return {
    title: vehicle
      ? `${vehicle.marca ?? "Vehículo"} ${vehicle.modelo ?? ""} | Funes Exclusivos`
      : "Catálogo | Funes Exclusivos",
    description:
      vehicle?.catalogo_descripcion ??
      vehicle?.descripcion ??
      "Selección premium sincronizada con el inventario.",
  };
}

export default async function PublicCatalogVehiclePage({
  params,
}: {
  params: { id: string };
}) {
  const { config, vehicle } = await loadCatalogoPublicoVehicle(params.id);

  if (!config.activo) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#FFFFFF_0%,#F9FAFB_100%)] px-4 py-10 text-[#111827] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <CatalogoEmptyState
            title="Catálogo no disponible"
            description="El catálogo online de Funes Exclusivos se encuentra temporalmente desactivado."
          />
        </div>
      </main>
    );
  }

  if (!vehicle) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#FFFFFF_0%,#F9FAFB_100%)] px-4 py-8 text-[#111827] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/catalogo" className="text-sm font-medium text-[#111827] underline-offset-4 hover:underline">
            Volver al catálogo
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Funes Exclusivos
          </Link>
        </div>

        <CatalogoVehicleDetail vehicle={vehicle} config={config} />
      </div>
    </main>
  );
}
