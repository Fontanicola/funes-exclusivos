"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function normalizeWhatsapp(value: string | null | undefined) {
  return (value ?? "").replace(/[+\s()-]/g, "");
}

function getPhotos(value: string[] | string | null | undefined) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [value];
  } catch {
    return [value];
  }
}

function money(value: number | null | undefined, currency: string | null) {
  if (value == null) return null;
  const iso = (currency ?? "").toLowerCase() === "usd" ? "USD" : "ARS";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: iso,
    maximumFractionDigits: 0,
  }).format(value);
}

export function CatalogoVehicleDetail({
  vehicle,
  config,
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
    descripcion?: string | null;
    catalogo_titulo: string | null;
    catalogo_descripcion: string | null;
    catalogo_destacado: boolean | null;
  };
  config: {
    whatsapp_contacto: string | null;
    mostrar_precios: boolean | null;
    mostrar_km: boolean | null;
    mostrar_dominio: boolean | null;
  };
}) {
  const photos = useMemo(() => getPhotos(vehicle.fotos), [vehicle.fotos]);
  const [selectedPhoto, setSelectedPhoto] = useState(photos[0] ?? null);
  useEffect(() => setSelectedPhoto(photos[0] ?? null), [photos]);

  const title = vehicle.catalogo_titulo?.trim() || [vehicle.marca, vehicle.modelo, vehicle.version].filter(Boolean).join(" ");
  const details = [
    vehicle.anio ? String(vehicle.anio) : null,
    vehicle.color,
    config.mostrar_km && vehicle.km != null ? `${new Intl.NumberFormat("es-AR").format(vehicle.km)} km` : null,
    config.mostrar_dominio ? vehicle.dominio : null,
  ].filter(Boolean).join(" · ");
  const phone = normalizeWhatsapp(config.whatsapp_contacto);
  const whatsappHref = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(
        `Hola, vi el ${vehicle.marca ?? ""} ${vehicle.modelo ?? ""} ${vehicle.anio ?? ""} en el catálogo de Funes Exclusivos. ¿Sigue disponible?`
      )}`
    : null;
  const price = money(vehicle.precio_contado ?? vehicle.precio_venta, vehicle.precio_moneda);
  const permuta = money(vehicle.precio_permuta, vehicle.precio_moneda);

  return (
    <section className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] lg:items-start">
      <div>
        <div className="overflow-hidden border-y border-[#E5E7EB] bg-white">
          <div className="aspect-[16/10] bg-[#F3F4F6]">
            {selectedPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedPhoto} alt={title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#F8F5F4_0%,#DDD3D4_52%,#B8A9AC_100%)]">
                <div className="text-center"><img src="/logo-funes.svg" alt="Funes Exclusivos" className="mx-auto h-16 w-auto opacity-30" /><p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#6B7280]">Foto pendiente</p></div>
              </div>
            )}
          </div>
          {photos.length > 1 ? <div className="flex gap-3 overflow-x-auto border-t border-[#E5E7EB] py-4">{photos.map((photo) => <button key={photo} type="button" onClick={() => setSelectedPhoto(photo)} className={`h-16 w-24 flex-none overflow-hidden border ${selectedPhoto === photo ? "border-[#8A1538]" : "border-[#E5E7EB]"}`}><img src={photo} alt="" className="h-full w-full object-cover" /></button>)}</div> : null}
        </div>
        <div className="border-b border-[#E5E7EB] py-8">
          <div className="flex flex-wrap items-center gap-3"><span className="bg-[#8A1538] px-3 py-1 text-xs font-medium text-white">{vehicle.catalogo_destacado ? "Destacado" : "Stock publicado"}</span><span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#6B7280]">Ficha comercial</span></div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#111827] sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-[#6B7280]">{details || "Información comercial disponible"}</p>
          <div className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2"><InfoItem label="Marca" value={vehicle.marca} /><InfoItem label="Modelo" value={vehicle.modelo} /><InfoItem label="Versión" value={vehicle.version} /><InfoItem label="Año" value={vehicle.anio ? String(vehicle.anio) : null} /><InfoItem label="Color" value={vehicle.color} />{config.mostrar_km ? <InfoItem label="Kilómetros" value={vehicle.km != null ? new Intl.NumberFormat("es-AR").format(vehicle.km) : null} /> : null}{config.mostrar_dominio ? <InfoItem label="Dominio" value={vehicle.dominio} /> : null}</div>
        </div>
      </div>
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="border-y border-[#E5E7EB] py-8 lg:border-t-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8A1538]">Tu próxima unidad</p>
          {config.mostrar_precios ? <div className="mt-4">{price ? <p className="text-4xl font-semibold tracking-[-0.05em] text-[#8A1538]">{price}</p> : <p className="text-lg font-medium text-[#111827]">Consultar precio</p>}{permuta ? <p className="mt-2 text-sm text-[#6B7280]">Precio permuta {permuta}</p> : null}</div> : <p className="mt-4 text-lg font-medium text-[#111827]">Consultá precio por WhatsApp</p>}
          <p className="mt-6 border-t border-[#E5E7EB] pt-5 text-sm text-[#6B7280]">Atención personalizada · Stock actualizado</p>
          <div className="mt-7 space-y-3">{whatsappHref ? <Link href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex h-12 w-full items-center justify-center rounded-md bg-[#8A1538] px-5 text-sm font-semibold text-white transition hover:bg-[#6F102D]">Consultar por WhatsApp</Link> : null}<Link href="/catalogo" className="inline-flex h-12 w-full items-center justify-center rounded-md border border-[#E5E7EB] px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]">Volver al catálogo</Link></div>
        </div>
        {vehicle.catalogo_descripcion || vehicle.descripcion ? <div className="border-b border-[#E5E7EB] py-8"><p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#6B7280]">Sobre esta unidad</p><p className="mt-4 text-sm leading-7 text-[#4B5563]">{vehicle.catalogo_descripcion ?? vehicle.descripcion}</p></div> : null}
      </aside>
    </section>
  );
}

function InfoItem({ label, value }: { label: string; value: string | null }) {
  return <div className="border-t border-[#E5E7EB] pt-3"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">{label}</p><p className="mt-1 text-sm font-medium text-[#111827]">{value ?? "—"}</p></div>;
}
