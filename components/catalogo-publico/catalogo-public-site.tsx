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

function getPhotoUrl(fotos: HeroVehicle["fotos"] | undefined) {
  if (Array.isArray(fotos)) return fotos[0] ?? null;
  if (typeof fotos !== "string" || !fotos) return null;
  try {
    const parsed = JSON.parse(fotos);
    return Array.isArray(parsed) ? parsed[0] ?? null : fotos;
  } catch {
    return fotos;
  }
}

function WhatsAppLink({ phone, children, className }: { phone: string; children: ReactNode; className: string }) {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent("Hola, quiero conocer más sobre Funes Exclusivos y sus vehículos disponibles.")}`;
  return <Link href={href} target="_blank" rel="noreferrer" className={className}>{children}</Link>;
}

export function CatalogoPublicSite({ config, vehicleCount, heroVehicle, heroImageUrl }: { config: PublicConfig; vehicleCount: number; heroVehicle: HeroVehicle | null; heroImageUrl: string | null }) {
  const phone = normalizeWhatsapp(config.whatsapp_contacto);
  const image = heroImageUrl ?? getPhotoUrl(heroVehicle?.fotos);
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

      <section id="inicio" className="relative overflow-hidden border-b border-[#E5E7EB] bg-[#F8F5F4]"><div className="grid lg:min-h-[570px] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative z-10 flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16 lg:py-24"><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8A1538]">Concesionaria · Buenos Aires</p><h1 className="mt-6 max-w-xl text-[2.8rem] font-semibold leading-[0.98] tracking-[-0.055em] text-[#111827] sm:text-6xl lg:text-[4.8rem]">Encontrá un auto que se sienta propio.</h1><p className="mt-7 max-w-md text-base leading-7 text-[#5B6472] sm:text-lg">{config.descripcion ?? "Vehículos seleccionados, asesoramiento cercano y una experiencia de compra clara."}</p><div className="mt-9 flex flex-wrap gap-3"><Link href="#vehiculos" className="inline-flex h-12 items-center gap-2 rounded-md bg-[#8A1538] px-6 text-sm font-semibold text-white transition hover:bg-[#6F102D]">Ver vehículos <ArrowRight className="h-4 w-4" /></Link>{phone ? <WhatsAppLink phone={phone} className="inline-flex h-12 items-center gap-2 rounded-md border border-[#CFA0AE] bg-transparent px-5 text-sm font-semibold text-[#8A1538] transition hover:bg-white"><MessageCircle className="h-4 w-4" /> Hablar con el equipo</WhatsAppLink> : null}</div><div className="mt-12 grid max-w-lg grid-cols-3 border-t border-[#D8CBCD] pt-5"><div><p className="text-2xl font-semibold tracking-tight text-[#111827]">{vehicleCount}</p><p className="mt-1 text-xs text-[#6B7280]">unidades disponibles</p></div><div className="border-l border-[#D8CBCD] pl-4"><BadgeCheck className="h-5 w-5 text-[#8A1538]" /><p className="mt-1 text-xs text-[#6B7280]">stock actualizado</p></div><div className="border-l border-[#D8CBCD] pl-4"><ShieldCheck className="h-5 w-5 text-[#8A1538]" /><p className="mt-1 text-xs text-[#6B7280]">atención cercana</p></div></div></div>
        <div className="relative min-h-[360px] overflow-hidden bg-[#D8D2D2] lg:min-h-0">{image ? <img src={image} alt="Vehículo destacado de Funes Exclusivos" className="h-full w-full object-cover" /> : <div className="flex h-full min-h-[360px] items-end bg-[linear-gradient(135deg,#ECE6E5_0%,#C9BDBD_48%,#4A3D42_100%)] p-8 sm:p-12"><div className="max-w-sm text-white"><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">Imagen principal</p><p className="mt-3 text-2xl font-medium tracking-tight">Una portada que represente la experiencia Funes.</p><p className="mt-3 text-sm leading-6 text-white/70">Podés cargar una foto panorámica desde la configuración del catálogo.</p></div></div>}<div className="absolute inset-0 bg-gradient-to-t from-[#111827]/35 via-transparent to-transparent" /><div className="absolute bottom-6 left-6 border-l-2 border-white pl-4 text-sm font-medium text-white">{vehicleLabel}</div></div>
      </div></section>

      <section id="servicios" className="border-b border-[#E5E7EB] py-20 sm:py-24"><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8A1538]">Más que un auto</p><h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-[#111827] sm:text-4xl">Una operación acompañada de principio a fin.</h2></div><p className="max-w-sm text-sm leading-6 text-[#6B7280]">Elegí con información, avanzá con claridad y contá con un equipo que conoce cada parte del proceso.</p></div><div className="mt-12 grid border-y border-[#E5E7EB] md:grid-cols-3">{[{ number: "01", icon: CarFront, title: "Compra y venta", text: "Un stock curado para encontrar una unidad que realmente encaje con vos." }, { number: "02", icon: FileCheck2, title: "Gestoría y documentación", text: "Seguimiento ordenado para que cada trámite avance sin sorpresas." }, { number: "03", icon: ShieldCheck, title: "Atención personalizada", text: "Una respuesta clara para cada consulta, antes y después de la operación." }].map(({ number, icon: Icon, title, text }, index) => <article key={title} className={`py-7 md:px-7 ${index > 0 ? "border-t border-[#E5E7EB] md:border-l md:border-t-0" : ""}`}><div className="flex items-center justify-between"><span className="text-xs font-semibold tracking-[0.2em] text-[#8A1538]">{number}</span><Icon className="h-5 w-5 text-[#8A1538]" /></div><h3 className="mt-8 text-lg font-semibold text-[#111827]">{title}</h3><p className="mt-3 max-w-xs text-sm leading-6 text-[#6B7280]">{text}</p></article>)}</div></section>

      <section id="nosotros" className="grid gap-10 border-b border-[#E5E7EB] py-20 sm:py-24 lg:grid-cols-[0.85fr_1.15fr] lg:items-center"><div className="flex min-h-[300px] items-end bg-[#111827] p-8 sm:p-10"><div className="text-white"><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/55">Funes Exclusivos</p><p className="mt-4 max-w-sm text-2xl font-medium leading-tight tracking-tight">Espacio para una imagen del showroom, el equipo o una entrega.</p></div></div><div className="lg:pl-8"><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8A1538]">Nuestra forma de trabajar</p><h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.04em] text-[#111827] sm:text-4xl">Elegir un auto también debería sentirse simple.</h2><p className="mt-6 max-w-xl text-base leading-7 text-[#6B7280]">Conocé cada unidad, compará opciones y contactá al equipo cuando estés listo. La información del catálogo se actualiza con el stock publicado.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="#vehiculos" className="inline-flex h-11 items-center rounded-md bg-[#111827] px-5 text-sm font-semibold text-white transition hover:bg-[#27303D]">Explorar stock</Link>{config.instagram_url ? <Link href={config.instagram_url} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-md border border-[#E5E7EB] px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"><Instagram className="h-4 w-4" /> Instagram</Link> : null}</div></div></section>

      <section className="flex flex-col gap-6 bg-[#8A1538] px-6 py-12 text-white sm:flex-row sm:items-center sm:justify-between sm:px-10"><div><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/65">¿Estás buscando tu próximo auto?</p><h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">Hablemos de lo que necesitás.</h2></div>{phone ? <WhatsAppLink phone={phone} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-white px-6 text-sm font-semibold text-[#8A1538] transition hover:bg-[#FFF7F8]"><MessageCircle className="h-4 w-4" /> Consultar por WhatsApp</WhatsAppLink> : null}</section>

      <footer className="flex flex-col gap-3 border-t border-[#E5E7EB] py-8 text-sm text-[#6B7280] sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} Funes Exclusivos</span><div className="flex items-center gap-5"><Link href="#inicio" className="transition hover:text-[#8A1538]">Volver arriba</Link>{config.instagram_url ? <Link href={config.instagram_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition hover:text-[#8A1538]"><Instagram className="h-4 w-4" /> Instagram</Link> : null}</div></footer>
    </>
  );
}
