import { CatalogoSettingsForm } from "./catalogo-settings-form";
import { CatalogoHeroUploadForm } from "./catalogo-hero-upload-form";

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

type VehiculoDestacado = {
  id: string;
  marca: string | null;
  modelo: string | null;
  version: string | null;
  anio: number | null;
  precio_venta: number | null;
  precio_moneda: string | null;
  fotos: string[] | string | null;
  catalogo_titulo: string | null;
  catalogo_orden: number | null;
};

function getPhotoUrl(fotos: VehiculoDestacado["fotos"]) {
  if (Array.isArray(fotos)) return fotos[0] ?? null;
  if (typeof fotos !== "string" || !fotos) return null;

  try {
    const parsed = JSON.parse(fotos);
    return Array.isArray(parsed) ? parsed[0] ?? null : fotos;
  } catch {
    return fotos;
  }
}

function vehicleTitle(vehicle: VehiculoDestacado) {
  return vehicle.catalogo_titulo?.trim() || [vehicle.marca, vehicle.modelo].filter(Boolean).join(" ") || "Vehículo destacado";
}

export function CatalogoVisualEditor({
  config,
  destacados,
  heroImageUrl,
}: {
  config: CatalogoConfig;
  destacados: VehiculoDestacado[];
  heroImageUrl: string | null;
}) {
  const hero = destacados[0] ?? null;
  const heroPhoto = heroImageUrl ?? (hero ? getPhotoUrl(hero.fotos) : null);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-md border border-[#E5E7EB] bg-[#F8FAFC]">
          <div className="border-b border-[#E5E7EB] bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">Vista previa</p>
            <p className="mt-1 text-sm text-[#6B7280]">Así se verá la portada del catálogo público.</p>
          </div>
          <div className="relative aspect-[2.5/1] min-h-[180px] overflow-hidden bg-[#E5E7EB]">
            {heroPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroPhoto} alt="Portada del catálogo" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-[linear-gradient(120deg,#F3F4F6,#E5E7EB)] text-center text-sm text-[#6B7280]">
                Publicá una unidad destacada con foto para usarla como portada.
              </div>
            )}
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-black/10 to-transparent p-5">
              <div className="text-white">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">Funes Exclusivos</p>
                <h3 className="mt-1 text-xl font-semibold">{config.titulo || "Vehículos seleccionados"}</h3>
                <p className="mt-1 max-w-xl text-xs text-white/80">{config.descripcion || "Selección premium sincronizada con el inventario."}</p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-3">
            {destacados.slice(0, 3).map((vehicle) => (
              <div key={vehicle.id} className="rounded-md border border-[#E5E7EB] bg-white p-2">
                <div className="aspect-[4/3] overflow-hidden rounded bg-[#F3F4F6]">
                  {getPhotoUrl(vehicle.fotos) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getPhotoUrl(vehicle.fotos) ?? undefined} alt={vehicleTitle(vehicle)} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <p className="mt-2 truncate text-xs font-medium text-[#111827]">{vehicleTitle(vehicle)}</p>
              </div>
            ))}
            {!destacados.length ? <p className="text-xs text-[#6B7280]">Todavía no hay unidades destacadas.</p> : null}
          </div>
          <div className="px-4 pb-4">
            <CatalogoHeroUploadForm heroImageUrl={heroImageUrl} />
          </div>
        </div>

        <div className="rounded-md border border-[#E5E7EB] bg-white p-4">
          <p className="text-sm font-semibold text-[#111827]">Orden de la vidriera</p>
          <p className="mt-1 text-xs leading-5 text-[#6B7280]">
            La primera unidad destacada con foto se usa como portada. El orden y las destacadas se editan desde la tabla de unidades.
          </p>
          <ol className="mt-4 space-y-2">
            {destacados.slice(0, 5).map((vehicle, index) => (
              <li key={vehicle.id} className="flex items-center gap-3 rounded-md border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F3E1E7] text-xs font-semibold text-[#8A1538]">{index + 1}</span>
                <span className="truncate text-xs font-medium text-[#111827]">{vehicleTitle(vehicle)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <CatalogoSettingsForm config={config} />
    </div>
  );
}
