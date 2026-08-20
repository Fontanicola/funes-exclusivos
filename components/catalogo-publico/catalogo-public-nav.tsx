import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { normalizeWhatsapp, type PublicCatalogConfig } from "@/lib/catalogo/public-data";

export function CatalogoPublicNav({ config, children }: { config: PublicCatalogConfig; children?: ReactNode }) {
  const phone = normalizeWhatsapp(config.whatsapp_contacto);
  const whatsappHref = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent("Hola, quiero conocer más sobre Funes Exclusivos.")}`
    : null;

  return (
    <>
      <div className="border-b border-[#E5E7EB] bg-[#111827] px-4 py-2 text-center text-[11px] font-medium tracking-[0.16em] text-white/80">
        STOCK ACTUALIZADO · ATENCIÓN PERSONALIZADA · FUNES EXCLUSIVOS
      </div>
      <nav className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-5">
          <Link href="/catalogo" className="shrink-0" aria-label="Funes Exclusivos, inicio">
            <img src="/logo-funes.svg" alt="Funes Exclusivos" className="h-9 w-auto" />
          </Link>
          <div className="hidden items-center gap-7 text-[13px] font-medium text-[#4B5563] md:flex">
            <Link href="/catalogo" className="transition hover:text-[#8A1538]">Vehículos</Link>
            <Link href="/servicios" className="transition hover:text-[#8A1538]">Servicios</Link>
            <Link href="/nosotros" className="transition hover:text-[#8A1538]">Nosotros</Link>
            <Link href="/contacto" className="transition hover:text-[#8A1538]">Contacto</Link>
            {config.instagram_url ? <Link href={config.instagram_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition hover:text-[#8A1538]"><Instagram className="h-3.5 w-3.5" /> Instagram</Link> : null}
          </div>
          {whatsappHref ? <Link href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-md bg-[#8A1538] px-4 text-[13px] font-semibold text-white transition hover:bg-[#6F102D]"><MessageCircle className="h-4 w-4" /> Consultar</Link> : null}
        </div>
      </nav>
      {children}
    </>
  );
}
