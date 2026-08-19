import Link from "next/link";
import { ArrowRight, BadgeCheck, CarFront, FileCheck2, Instagram, MessageCircle, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

type PublicConfig = {
  titulo: string | null;
  descripcion: string | null;
  whatsapp_contacto: string | null;
  instagram_url: string | null;
};

type HeroVehicle = { marca: string | null; modelo: string | null; fotos: string[] | string | null };

function normalizeWhatsapp(value: string | null | undefined) {
  return (value ?? "").replace(/[+\s()-]/g, "");
}

function WhatsAppLink({ phone, children, className }: { phone: string; children: ReactNode; className: string }) {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent("Hola, quiero conocer más sobre Funes Exclusivos y sus vehículos disponibles.")}`;
  return <Link href={href} target="_blank" rel="noreferrer" className={className}>{children}</Link>;
}

export function CatalogoPublicSite({ config, vehicleCount, heroVehicle, heroImageUrl }: { config: PublicConfig; vehicleCount: number; heroVehicle: HeroVehicle | null; heroImageUrl: string | null }) {
  const phone = normalizeWhatsapp(config.whatsapp_contacto);
  const image = heroImageUrl ?? "/catalogo/funes-fachada.jpg";
  const vehicleLabel = heroVehicle ? `${heroVehicle.marca ?? "Vehículo"} ${heroVehicle.modelo ?? "seleccionado"}` : "Selección Funes";

  return (
    <>
      <div className="border-b border-[#E5E7EB] bg-[#111827] px-4 py-2 text-center text-[11px] font-medium tracking-[0.16em] text-white/80 sm:px-6 lg:px-8">STOCK ACTUALIZADO · ATENCIÓN PERSONALIZADA · FUNES EXCLUSIVOS</div>
      <nav className="sticky top-0 z-30 -mx-4 border-b border-[#E5E7EB] bg-white/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-6">
          <Link href="/catalogo" className="shrink-0" aria-label="Funes Exclusivos, inicio"><img src="/logo-funes.svg" alt="Funes Exclusivos" className="h-9 w-auto" /></Link>
          <div className="hidden items-center gap-8 text-[13px] font-medium text-[#4B5563] lg:flex"><Link href="#vehiculos" className="transition hover:text-[#8A1538]">Vehículos</Link><Link href="#servicios" className="transition hover:text-[#8A1538]">Servicios</Link><Link href="#nosotros" className="transition hover:text-[#8A1538]">Nosotros</Link>{config.instagram_url ? <Link href={config.instagram_url} target="_blank" rel="noreferrer" className="transition hover:text-[#8A1538]">Instagram</Link> : null}</div>
          {phone ? <WhatsAppLink phone={phone} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#8A1538] px-4 text-[13px] font-semibold text-white transition hover:bg-[#6F102D]"><MessageCircle className="h-4 w-4" /><span>Consultar</span></WhatsAppLink> : null}
        </div>
      </nav>

      <section id="inicio" className="relative overflow-hidden border-b border-[#E5E7EB] bg-[#111827]">
        <div className="relative min-h-[520px] sm:min-h-[590px]">
          <img src={image} alt="Funes Exclusivos" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,14,20,0.9)_0%,rgba(10,14,20,0.68)_42%,rgba(10,14,20,0.16)_100%)]" />
          <div className="relative z-10 flex min-h-[520px] max-w-3xl flex-col justify-end px-6 py-14 sm:min-h-[590px] sm:px-12 sm:py-20 lg:px-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70">Funes Exclusivos · Concesionaria premium</p>
            <h1 className="mt-5 max-w-2xl text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-[4.7rem]">Encontrá un auto que se sienta propio.</h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/78 sm:text-lg">{config.descripcion ?? "Vehículos seleccionados, asesoramiento cercano y una experiencia de compra clara."}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#vehiculos" className="inline-flex h-12 items-center gap-2 rounded-md bg-[#8A1538] px-6 text-sm font-semibold text-white transition hover:bg-[#6F102D]">Ver vehículos <ArrowRight className="h-4 w-4" /></Link>
              {phone ? <WhatsAppLink phone={phone} className="inline-flex h-12 items-center gap-2 rounded-md border border-white/35 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"><MessageCircle className="h-4 w-4" /> Hablar con el equipo</WhatsAppLink> : null}
            </div>
            <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/25 pt-5 text-sm text-white/75">
              <span><strong className="mr-2 text-xl font-semibold text-white">{vehicleCount}</strong>unidades disponibles</span>
              <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-[#E7B8C7]" /> Stock actualizado</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#E7B8C7]" /> Atención cercana</span>
            </div>
          </div>
          <div className="absolute bottom-7 right-7 hidden border-l border-white/50 pl-4 text-sm font-medium text-white/90 md:block">{vehicleLabel}</div>
        </div>
      </section>

      <section id="servicios" className="border-b border-[#E5E7EB] py-20 sm:py-24"><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8A1538]">Más que un auto</p><h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-[#111827] sm:text-4xl">Una operación acompañada de principio a fin.</h2></div><p className="max-w-sm text-sm leading-6 text-[#6B7280]">Elegí con información, avanzá con claridad y contá con un equipo que conoce cada parte del proceso.</p></div><div className="mt-12 grid border-y border-[#E5E7EB] md:grid-cols-3">{[{ number: "01", icon: CarFront, title: "Compra y venta", text: "Un stock curado para encontrar una unidad que realmente encaje con vos." }, { number: "02", icon: FileCheck2, title: "Gestoría y documentación", text: "Seguimiento ordenado para que cada trámite avance sin sorpresas." }, { number: "03", icon: ShieldCheck, title: "Atención personalizada", text: "Una respuesta clara para cada consulta, antes y después de la operación." }].map(({ number, icon: Icon, title, text }, index) => <article key={title} className={`py-7 md:px-7 ${index > 0 ? "border-t border-[#E5E7EB] md:border-l md:border-t-0" : ""}`}><div className="flex items-center justify-between"><span className="text-xs font-semibold tracking-[0.2em] text-[#8A1538]">{number}</span><Icon className="h-5 w-5 text-[#8A1538]" /></div><h3 className="mt-8 text-lg font-semibold text-[#111827]">{title}</h3><p className="mt-3 max-w-xs text-sm leading-6 text-[#6B7280]">{text}</p></article>)}</div></section>

      <section id="nosotros" className="grid gap-10 border-b border-[#E5E7EB] py-20 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
        <div className="relative min-h-[360px] overflow-hidden bg-[#E5E7EB]"><img src="/catalogo/funes-showroom.png" alt="Showroom de Funes Exclusivos" loading="lazy" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#111827]/45 via-transparent to-transparent" /><span className="absolute bottom-6 left-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-white">Nuestro showroom</span></div>
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8A1538]">Nuestra forma de trabajar</p><h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.04em] text-[#111827] sm:text-4xl">Elegir un auto también debería sentirse simple.</h2><p className="mt-6 max-w-xl text-base leading-7 text-[#6B7280]">Conocé cada unidad, compará opciones y contactá al equipo cuando estés listo. La información del catálogo se actualiza con el stock publicado.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="#vehiculos" className="inline-flex h-11 items-center rounded-md bg-[#111827] px-5 text-sm font-semibold text-white transition hover:bg-[#27303D]">Explorar stock</Link>{config.instagram_url ? <Link href={config.instagram_url} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-md border border-[#E5E7EB] px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"><Instagram className="h-4 w-4" /> Instagram</Link> : null}</div></div>
      </section>

      <section className="grid gap-10 border-b border-[#E5E7EB] py-20 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div className="order-2 lg:order-1"><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8A1538]">Una experiencia completa</p><h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.04em] text-[#111827] sm:text-4xl">Compra, venta y acompañamiento en un mismo lugar.</h2><p className="mt-6 max-w-xl text-base leading-7 text-[#6B7280]">Desde la primera consulta hasta la documentación, nuestro equipo está para ayudarte a tomar una decisión con tranquilidad.</p><div className="mt-8 grid gap-4 sm:grid-cols-2"><div className="border-l-2 border-[#8A1538] pl-4"><p className="font-semibold text-[#111827]">Información clara</p><p className="mt-1 text-sm leading-6 text-[#6B7280]">Fichas comerciales y stock actualizado.</p></div><div className="border-l-2 border-[#8A1538] pl-4"><p className="font-semibold text-[#111827]">Atención humana</p><p className="mt-1 text-sm leading-6 text-[#6B7280]">Un vendedor para acompañar tu búsqueda.</p></div></div></div>
        <div className="relative order-1 min-h-[360px] overflow-hidden bg-[#111827] lg:order-2"><img src="/catalogo/funes-espacio.png" alt="Espacio de atención de Funes Exclusivos" loading="lazy" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#111827]/55 via-transparent to-transparent" /><span className="absolute bottom-6 left-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-white">Una marca con identidad</span></div>
      </section>

      <section className="flex flex-col gap-6 bg-[#8A1538] px-6 py-12 text-white sm:flex-row sm:items-center sm:justify-between sm:px-10"><div><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/65">¿Estás buscando tu próximo auto?</p><h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">Hablemos de lo que necesitás.</h2></div>{phone ? <WhatsAppLink phone={phone} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-white px-6 text-sm font-semibold text-[#8A1538] transition hover:bg-[#FFF7F8]"><MessageCircle className="h-4 w-4" /> Consultar por WhatsApp</WhatsAppLink> : null}</section>

      <footer className="flex flex-col gap-3 border-t border-[#E5E7EB] py-8 text-sm text-[#6B7280] sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} Funes Exclusivos</span><div className="flex items-center gap-5"><Link href="#inicio" className="transition hover:text-[#8A1538]">Volver arriba</Link>{config.instagram_url ? <Link href={config.instagram_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition hover:text-[#8A1538]"><Instagram className="h-4 w-4" /> Instagram</Link> : null}</div></footer>
    </>
  );
}
