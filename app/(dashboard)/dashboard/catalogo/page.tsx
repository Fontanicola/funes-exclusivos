import type { Metadata } from "next";
import Link from "next/link";
import { isDemoMode } from "@/lib/demo-mode";
import { mockCatalogoConfig, mockVehiculos } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAllSupabaseRows } from "@/lib/supabase/paginated";
import { getCatalogoHeroUrl } from "@/lib/catalogo/hero";
import { CatalogoVehiculosTable } from "@/components/catalogo/catalogo-vehiculos-table";
import { CatalogoVisualEditor } from "@/components/catalogo/catalogo-visual-editor";
import { DataEntryModal } from "@/components/common/data-entry-modal";
import { filterByDateRange, parseDateRange } from "@/lib/date-range";
import { CollapsibleSummary } from "@/components/common/collapsible-summary";

export const metadata: Metadata = {
  title: "Catálogo | Funes Exclusivos",
};

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
  precio_moneda: string | null;
  estado: string | null;
  fotos: string[] | string | null;
  catalogo_publicado: boolean | null;
  catalogo_destacado: boolean | null;
  catalogo_titulo: string | null;
  catalogo_descripcion: string | null;
  catalogo_orden: number | null;
  estado_preparacion?: string | null;
  created_at: string | null;
};

function formatMoney(value: number, currency: string | null) {
  const isoCurrency = (currency ?? "").toLowerCase() === "usd" ? "USD" : "ARS";
  const symbol = isoCurrency === "USD" ? "US$" : "$";
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: isoCurrency,
    maximumFractionDigits: 0,
  }).format(value);

  return formatted.replace("US$", symbol).replace("$", symbol);
}

function KpiCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <article className="rounded-md border border-[#E5E7EB] bg-white p-4">
      <p className="text-sm font-medium text-[#6B7280]">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">{value}</p>
      {detail ? <p className="mt-2 text-xs text-[#6B7280]">{detail}</p> : null}
    </article>
  );
}

export default async function CatalogoPage({ searchParams }: { searchParams?: { from?: string; to?: string } }) {
  const dateRange = parseDateRange(searchParams);
  let config: CatalogoConfig = mockCatalogoConfig as CatalogoConfig;
  let vehiculos: Vehiculo[] = mockVehiculos as Vehiculo[];
  let heroImageUrl: string | null = null;

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const [configResult, vehiculosResult, heroResult] = await Promise.all([
      supabase
        .from("catalogo_config")
        .select(
          "id,activo,titulo,descripcion,whatsapp_contacto,instagram_url,mostrar_precios,mostrar_km,mostrar_dominio"
        )
        .eq("id", true)
        .maybeSingle<CatalogoConfig>(),
      fetchAllSupabaseRows((from, to) =>
        supabase
          .from("vehiculos")
          .select(
            "id,marca,modelo,version,anio,color,km,dominio,precio_venta,precio_moneda,estado,estado_preparacion,fotos,catalogo_publicado,catalogo_destacado,catalogo_titulo,catalogo_descripcion,catalogo_orden,created_at"
          )
          .order("catalogo_destacado", { ascending: false, nullsFirst: false })
          .order("catalogo_orden", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: false })
          .range(from, to)
      ),
      getCatalogoHeroUrl(supabase),
    ]);

    config = configResult.data ?? config;
    vehiculos = (vehiculosResult.data ?? []) as Vehiculo[];
    heroImageUrl = heroResult;
  }

  vehiculos = filterByDateRange(vehiculos, dateRange, (vehicle) => vehicle.created_at);
  const publishedCount = vehiculos.filter((vehicle) => vehicle.catalogo_publicado).length;
  const featuredCount = vehiculos.filter((vehicle) => vehicle.catalogo_destacado).length;
  const stockWithoutPublication = vehiculos.filter(
    (vehicle) => vehicle.estado === "en_stock" && !vehicle.catalogo_publicado
  ).length;
  const destacados = vehiculos
    .filter((vehicle) => vehicle.estado === "en_stock" && vehicle.catalogo_publicado && vehicle.catalogo_destacado)
    .sort((a, b) => (a.catalogo_orden ?? Number.MAX_SAFE_INTEGER) - (b.catalogo_orden ?? Number.MAX_SAFE_INTEGER));

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        {isDemoMode ? (
          <div className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
            Modo demo: el catálogo y las publicaciones usan datos simulados y no se guardarán cambios reales.
          </div>
        ) : null}
      </div>

      <CollapsibleSummary sectionKey="catalogo">
        <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          label="Catálogo"
          value={config.activo ? "Activo" : "Inactivo"}
          detail={config.activo ? "Visible públicamente" : "El catálogo público está oculto"}
        />
        <KpiCard label="Vehículos publicados" value={publishedCount} />
        <KpiCard label="Vehículos destacados" value={featuredCount} />
        <KpiCard label="En stock sin publicar" value={stockWithoutPublication} />
        </div>
      </CollapsibleSummary>

      <div className="space-y-6">
        <CatalogoVehiculosTable
          vehiculos={vehiculos}
          toolbarAction={
            <div className="flex flex-wrap gap-2">
              <DataEntryModal
                triggerLabel="Editar vidriera"
                title="Editor visual del catálogo"
                description="Configurá la portada, los destacados y la información pública de la vidriera."
                size="wide"
              >
                <CatalogoVisualEditor config={config} destacados={destacados} heroImageUrl={heroImageUrl} />
              </DataEntryModal>
              <Link
                href="/catalogo"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
              >
                Abrir catálogo público
              </Link>
            </div>
          }
        />
      </div>
    </section>
  );
}
