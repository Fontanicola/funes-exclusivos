import type { Metadata } from "next";
import { isDemoMode } from "@/lib/demo-mode";
import { mockCatalogoConfig, mockVehiculos } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CatalogoHeader } from "@/components/catalogo-publico/catalogo-header";
import { CatalogoVehicleGrid } from "@/components/catalogo-publico/catalogo-vehicle-grid";
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
  precio_contado: number | null;
  precio_permuta: number | null;
  precio_moneda: string | null;
  precio_infoauto_actual: number | null;
  estado: string | null;
  fotos: string[] | string | null;
  descripcion: string | null;
  catalogo_titulo: string | null;
  catalogo_descripcion: string | null;
  catalogo_destacado: boolean | null;
  catalogo_orden: number | null;
  catalogo_publicado?: boolean | null;
  created_at: string | null;
};

async function loadCatalogoPublico() {
  if (isDemoMode) {
    return {
      config: mockCatalogoConfig as CatalogoConfig,
      vehiculos: (mockVehiculos as unknown as Vehiculo[]).filter(
        (vehicle) => vehicle.estado === "en_stock" && vehicle.catalogo_publicado
      ),
    };
  }

  const supabase = createSupabaseServerClient();
  const [configResult, vehiculosResult] = await Promise.all([
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
        "id,marca,modelo,version,anio,color,km,dominio,precio_venta,precio_contado,precio_permuta,precio_moneda,precio_infoauto_actual,estado,fotos,descripcion,catalogo_titulo,catalogo_descripcion,catalogo_destacado,catalogo_orden,created_at"
      )
      .eq("estado", "en_stock")
      .eq("catalogo_publicado", true)
      .order("catalogo_destacado", { ascending: false, nullsFirst: false })
      .order("catalogo_orden", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false }),
  ]);

  return {
    config: configResult.data ?? (mockCatalogoConfig as CatalogoConfig),
    vehiculos: (vehiculosResult.data ?? []) as Vehiculo[],
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { config } = await loadCatalogoPublico();

  return {
    title: "Catálogo | Funes Exclusivos",
    description: config.descripcion ?? "Selección premium sincronizada con el inventario.",
  };
}

export default async function PublicCatalogPage() {
  const { config, vehiculos } = await loadCatalogoPublico();

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

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#FFFFFF_0%,#F9FAFB_100%)] px-4 py-8 text-[#111827] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <CatalogoHeader
          title={config.titulo}
          description={config.descripcion}
          vehicleCount={vehiculos.length}
          whatsappContacto={config.whatsapp_contacto}
          instagramUrl={config.instagram_url}
        />

        <CatalogoVehicleGrid vehiculos={vehiculos} config={config} />
      </div>
    </main>
  );
}
