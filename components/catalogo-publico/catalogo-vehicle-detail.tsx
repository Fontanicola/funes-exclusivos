"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function normalizeWhatsapp(value: string | null | undefined) {
  return (value ?? "").replace(/[+\s()-]/g, "");
}

function getPhotos(fotos: string[] | string | null | undefined) {
  if (Array.isArray(fotos)) return fotos.filter(Boolean);
  if (typeof fotos === "string") {
    try {
      const parsed = JSON.parse(fotos);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : fotos ? [fotos] : [];
    } catch {
      return fotos ? [fotos] : [];
    }
  }
  return [];
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
    titulo: string | null;
    descripcion: string | null;
    whatsapp_contacto: string | null;
    instagram_url: string | null;
    mostrar_precios: boolean | null;
    mostrar_km: boolean | null;
    mostrar_dominio: boolean | null;
  };
}) {
  const photos = useMemo(() => getPhotos(vehicle.fotos), [vehicle.fotos]);
  const [currentPhoto, setCurrentPhoto] = useState(photos[0] ?? null);

  useEffect(() => {
    setCurrentPhoto(photos[0] ?? null);
  }, [photos]);

  const whatsappPhone = normalizeWhatsapp(config.whatsapp_contacto);
  const whatsappHref = whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
        `Hola, vi el ${vehicle.marca ?? ""} ${vehicle.modelo ?? ""} ${vehicle.anio ?? ""} en el catálogo de Funes Exclusivos. ¿Sigue disponible?`
      )}`
    : null;
  const title = vehicle.catalogo_titulo?.trim() || [vehicle.marca, vehicle.modelo, vehicle.version].filter(Boolean).join(" ");
  const subtitle = [vehicle.anio ? String(vehicle.anio) : null, vehicle.color, config.mostrar_km ? (vehicle.km != null ? `${new Intl.NumberFormat("es-AR").format(vehicle.km)} km` : null) : null, config.mostrar_dominio ? vehicle.dominio : null]
    .filter(Boolean)
    .join(" · ");
  const mainPrice = formatMoney(vehicle.precio_contado ?? vehicle.precio_venta, vehicle.precio_moneda);
  const permutaPrice = formatMoney(vehicle.precio_permuta ?? null, vehicle.precio_moneda);

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <div className="space-y-4">
        <div className="overflow-hidden rounded-[2rem] border border-[#E5E7EB] bg-white shadow-sm">
          <div className="aspect-[16/11] bg-[#F9FAFB]">
            {currentPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentPhoto} alt={title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,#FFFFFF_0%,#F3F4F6_100%)]">
                <img src="/logo-funes.svg" alt="Funes Exclusivos" className="h-16 w-16 opacity-20" />
              </div>
            )}
          </div>

          {photos.length > 1 ? (
            <div className="flex gap-3 overflow-x-auto border-t border-[#E5E7EB] p-4">
              {photos.map((photo) => (
                <button
                  key={photo}
                  type="button"
                  onClick={() => setCurrentPhoto(photo)}
                  className={[
                    "h-20 w-28 flex-none overflow-hidden rounded-2xl border transition",
                    currentPhoto === photo ? "border-[#18181B]" : "border-[#E5E7EB]",
                  ].join(" ")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt={title} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-[2rem] border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Ficha técnica</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">{subtitle || "Ficha técnica disponible"}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoItem label="Marca" value={vehicle.marca} />
            <InfoItem label="Modelo" value={vehicle.modelo} />
            <InfoItem label="Versión" value={vehicle.version} />
            <InfoItem label="Año" value={vehicle.anio ? String(vehicle.anio) : null} />
            <InfoItem label="Color" value={vehicle.color} />
            {config.mostrar_km ? <InfoItem label="KM" value={vehicle.km != null ? new Intl.NumberFormat("es-AR").format(vehicle.km) : null} /> : null}
            {config.mostrar_dominio ? <InfoItem label="Dominio" value={vehicle.dominio} /> : null}
          </div>
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-[2rem] border border-[#E5E7EB] bg-white p-6 shadow-sm">
          {vehicle.catalogo_destacado ? (
            <span className="inline-flex rounded-full bg-[#18181B] px-3 py-1 text-xs font-medium text-white">
              Destacado
            </span>
          ) : null}
          {config.mostrar_precios ? (
            <div className="mt-4 space-y-3">
              {mainPrice ? <p className="text-3xl font-semibold tracking-tight text-[#111827]">{mainPrice}</p> : null}
              {permutaPrice ? <p className="text-sm text-[#6B7280]">Precio permuta {permutaPrice}</p> : null}
            </div>
          ) : (
            <p className="mt-4 text-lg font-medium text-[#111827]">Consultá precio por WhatsApp</p>
          )}

          <div className="mt-5 space-y-3">
            {whatsappHref ? (
              <Link
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#18181B] px-5 text-sm font-medium text-white transition hover:bg-[#27272A]"
              >
                Consultar por WhatsApp
              </Link>
            ) : null}
            <Link
              href="/catalogo"
              className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#E5E7EB] bg-white px-5 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              Volver al catálogo
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Descripción</p>
          <p className="mt-3 text-sm leading-6 text-[#111827]">
            {vehicle.catalogo_descripcion ?? vehicle.descripcion ?? "Sin descripción disponible."}
          </p>
        </div>
      </aside>
    </section>
  );
}

function InfoItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">{label}</p>
      <p className="mt-1 text-sm font-medium text-[#111827]">{value ?? "—"}</p>
    </div>
  );
}
