import Link from "next/link";

function normalizeWhatsapp(value: string | null | undefined) {
  return (value ?? "").replace(/[+\s()-]/g, "");
}

function getPhotoUrl(fotos: string[] | string | null | undefined) {
  if (Array.isArray(fotos)) return fotos[0] ?? null;
  if (typeof fotos === "string") {
    try {
      const parsed = JSON.parse(fotos);
      return Array.isArray(parsed) ? parsed[0] ?? null : fotos;
    } catch {
      return fotos;
    }
  }
  return null;
}

function formatMoney(value: number | null, currency: string | null) {
  if (value == null) return null;
  const isoCurrency = (currency ?? "").toLowerCase() === "usd" ? "USD" : "ARS";
  const symbol = isoCurrency === "USD" ? "US$" : "$";
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: isoCurrency,
    maximumFractionDigits: 0,
  }).format(value);
  return formatted.replace("US$", symbol).replace("$", symbol);
}

export function CatalogoVehicleCard({
  vehicle,
  mostrarPrecios,
  mostrarKm,
  mostrarDominio,
  whatsappContacto,
}: {
  vehicle: {
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
    catalogo_titulo: string | null;
    catalogo_descripcion: string | null;
    catalogo_destacado: boolean | null;
  };
  mostrarPrecios: boolean;
  mostrarKm: boolean;
  mostrarDominio: boolean;
  whatsappContacto: string | null;
}) {
  const image = getPhotoUrl(vehicle.fotos);
  const title = vehicle.catalogo_titulo?.trim() || [vehicle.marca, vehicle.modelo, vehicle.version].filter(Boolean).join(" ");
  const subtitle = [vehicle.anio ? String(vehicle.anio) : null, vehicle.color, mostrarKm && vehicle.km != null ? `${new Intl.NumberFormat("es-AR").format(vehicle.km)} km` : null, mostrarDominio ? vehicle.dominio : null]
    .filter(Boolean)
    .join(" · ");
  const whatsappPhone = normalizeWhatsapp(whatsappContacto);
  const whatsappHref = whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
        `Hola, vi el ${vehicle.marca ?? ""} ${vehicle.modelo ?? ""} ${vehicle.anio ?? ""} en el catálogo de Funes Exclusivos. ¿Sigue disponible?`
      )}`
    : null;
  const price = formatMoney(vehicle.precio_contado ?? vehicle.precio_venta, vehicle.precio_moneda);
  const permutaPrice = formatMoney(vehicle.precio_permuta ?? null, vehicle.precio_moneda);
  const hasPrice = Boolean(price);

  return (
    <article className="group overflow-hidden border-b border-[#E5E7EB] bg-white pb-6 transition duration-300 hover:border-[#8A1538]">
      <Link href={`/catalogo/${vehicle.id}`} className="block">
        <div className="relative aspect-[16/11] overflow-hidden bg-[#F3F4F6]">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
          ) : (
            <div className="flex h-full w-full items-end bg-[linear-gradient(135deg,#F8F5F4_0%,#E6DDDE_50%,#C3B4B7_100%)] p-5">
              <div className="flex flex-col items-center gap-3 text-center">
                <img src="/logo-funes.svg" alt="Funes Exclusivos" className="h-14 w-14 opacity-30" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B7280]">Foto pendiente</p>
              </div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent_0%,rgba(17,24,39,0.18)_100%)]" />
          {vehicle.catalogo_destacado ? (
            <div className="absolute left-4 top-4 flex gap-2">
              <span className="rounded-full bg-[#8A1538] px-3 py-1 text-xs font-medium text-white">Destacado</span>
            </div>
          ) : null}
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
            <span className="border border-white/70 bg-white/90 px-3 py-1 text-[11px] font-medium text-[#111827] backdrop-blur">
              Stock actualizado
            </span>
            {mostrarPrecios && hasPrice ? (
              <span className="bg-[#8A1538]/90 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
                Disponible
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="space-y-4 pt-5">
        <div className="space-y-2">
          <Link href={`/catalogo/${vehicle.id}`} className="block">
            <h3 className="text-lg font-semibold tracking-tight text-[#111827]">{title}</h3>
          </Link>
          <p className="text-sm text-[#6B7280]">{subtitle || "Consultá la ficha de esta unidad"}</p>
          {vehicle.catalogo_descripcion ? (
            <p className="line-clamp-2 text-sm leading-6 text-[#6B7280]">{vehicle.catalogo_descripcion}</p>
          ) : null}
        </div>

        {mostrarPrecios ? (
          <div className="space-y-1">
            {price ? <p className="text-xl font-semibold tracking-tight text-[#8A1538]">{price}</p> : null}
            {permutaPrice ? (
              <p className="text-sm text-[#6B7280]">Precio permuta {permutaPrice}</p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm font-medium text-[#111827]">Consultá precio por WhatsApp</p>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-[#6B7280]">
          {vehicle.anio ? <span className="border border-[#E5E7EB] bg-[#FAFAFA] px-2.5 py-1">{vehicle.anio}</span> : null}
          {mostrarKm && vehicle.km != null ? (
            <span className="border border-[#E5E7EB] bg-[#FAFAFA] px-2.5 py-1">{new Intl.NumberFormat("es-AR").format(vehicle.km)} km</span>
          ) : null}
          {vehicle.color ? <span className="border border-[#E5E7EB] bg-[#FAFAFA] px-2.5 py-1">{vehicle.color}</span> : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/catalogo/${vehicle.id}`}
            className="inline-flex h-10 items-center justify-center border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Ver detalle
          </Link>
          {whatsappHref ? (
            <Link
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center bg-[#8A1538] px-4 text-sm font-medium text-white transition hover:bg-[#6F102D]"
            >
              Consultar por WhatsApp
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
