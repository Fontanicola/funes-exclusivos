import type { Metadata } from "next";
import Link from "next/link";
import { isDemoMode } from "@/lib/demo-mode";
import { mockCatalogoConfig, mockVehiculos } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CatalogoSettingsForm } from "@/components/catalogo/catalogo-settings-form";
import { CatalogoVehiculosTable } from "@/components/catalogo/catalogo-vehiculos-table";

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
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-[#6B7280]">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">{value}</p>
      {detail ? <p className="mt-2 text-xs text-[#6B7280]">{detail}</p> : null}
    </article>
  );
}

export default async function CatalogoPage() {
  let config: CatalogoConfig = mockCatalogoConfig as CatalogoConfig;
  let vehiculos: Vehiculo[] = mockVehiculos as Vehiculo[];

  if (!isDemoMode) {
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
          "id,marca,modelo,version,anio,color,km,dominio,precio_venta,precio_moneda,estado,fotos,catalogo_publicado,catalogo_destacado,catalogo_titulo,catalogo_descripcion,catalogo_orden,created_at"
        )
        .order("catalogo_destacado", { ascending: false, nullsFirst: false })
        .order("catalogo_orden", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    config = configResult.data ?? config;
    vehiculos = (vehiculosResult.data ?? []) as Vehiculo[];
  }

  const publishedCount = vehiculos.filter((vehicle) => vehicle.catalogo_publicado).length;
  const featuredCount = vehiculos.filter((vehicle) => vehicle.catalogo_destacado).length;
  const stockWithoutPublication = vehiculos.filter(
    (vehicle) => vehicle.estado === "en_stock" && !vehicle.catalogo_publicado
  ).length;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
              Catálogo
            </h1>
            <p className="text-sm leading-6 text-[#6B7280]">
              Configuración de publicación online
            </p>
          </div>
          <Link
            href="/catalogo"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Ver catálogo público
          </Link>
        </div>
        {isDemoMode ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
            Modo demo: el catálogo y las publicaciones son mock y no se guardará nada en Supabase.
          </div>
        ) : null}
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          label="Catálogo"
          value={config.activo ? "Activo" : "Inactivo"}
          detail={config.titulo ?? undefined}
        />
        <KpiCard label="Vehículos publicados" value={publishedCount} />
        <KpiCard label="Vehículos destacados" value={featuredCount} />
        <KpiCard label="En stock sin publicar" value={stockWithoutPublication} />
      </div>

      <div className="space-y-6">
        <CatalogoSettingsForm config={config} />
        <CatalogoVehiculosTable vehiculos={vehiculos} />
      </div>
    </section>
  );
}
