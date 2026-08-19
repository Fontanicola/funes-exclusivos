import Link from "next/link";
import { ArrowDown, ArrowRight, BadgeCheck, CarFront, FileCheck2, Instagram, MessageCircle, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

type PublicConfig = {
  titulo: string | null;
  descripcion: string | null;
  whatsapp_contacto: string | null;
  instagram_url: string | null;
};

type HeroVehicle = {
  marca: string | null;
  modelo: string | null;
  fotos: string[] | string | null;
};

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
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(
    "Hola, quiero conocer más sobre Funes Exclusivos y sus vehículos disponibles."
  )}`;

  return (
    <Link href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </Link>
  );
}

export function CatalogoPublicSite({
  config,
  vehicleCount,
  heroVehicle,
  heroImageUrl,
}: {
  config: PublicConfig;
  vehicleCount: number;
  heroVehicle: HeroVehicle | null;
  heroImageUrl: string | null;
}) {
  const phone = normalizeWhatsapp(config.whatsapp_contacto);
  const image = heroImageUrl ?? getPhotoUrl(heroVehicle?.fotos);

  return (
    <>
      <nav className="sticky top-0 z-30 -mx-4 border-b border-[#E5E7EB]/90 bg-white/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-5">
          <Link href="/catalogo" className="flex items-center gap-3" aria-label="Funes Exclusivos, inicio">
            <img src="/logo-funes.svg" alt="Funes Exclusivos" className="h-9 w-auto" />
            <span className="hidden border-l border-[#E5E7EB] pl-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6B7280] sm:block">
              Automóviles seleccionados
            </span>
          </Link>
          <div className="hidden items-center gap-6 text-sm text-[#4B5563] md:flex">
            <Link href="#inicio" className="transition hover:text-[#8A1538]">Inicio</Link>
            <Link href="#vehiculos" className="transition hover:text-[#8A1538]">Vehículos</Link>
            <Link href="#servicios" className="transition hover:text-[#8A1538]">Servicios</Link>
            <Link href="#nosotros" className="transition hover:text-[#8A1538]">Funes Exclusivos</Link>
          </div>
          {phone ? (
            <WhatsAppLink
              phone={phone}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#8A1538] px-4 text-sm font-medium text-white transition hover:bg-[#6F102D]"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Consultar</span>
            </WhatsAppLink>
          ) : null}
        </div>
      </nav>

      <section id="inicio" className="relative overflow-hidden rounded-b-2xl border-x border-b border-[#E5E7EB] bg-[#FCF7F8]">
        <div className="grid min-h-[500px] lg:grid-cols-[0.88fr_1.12fr]">
          <div className="relative z-10 flex flex-col justify-center px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8A1538]">Funes Exclusivos</p>
            <h1 className="max-w-xl text-4xl font-semibold leading-[1.04] tracking-[-0.04em] text-[#111827] sm:text-5xl lg:text-6xl">
              Tu próximo auto empieza con una buena decisión.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#6B7280] sm:text-lg">
              {config.descripcion ?? "Vehículos seleccionados, asesoramiento cercano y una experiencia de compra clara."}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="#vehiculos" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#8A1538] px-6 text-sm font-medium text-white transition hover:bg-[#6F102D]">
                Ver vehículos
                <ArrowRight className="h-4 w-4" />
              </Link>
              {phone ? (
                <WhatsAppLink phone={phone} className="inline-flex h-12 items-center gap-2 rounded-full border border-[#D9A8B8] bg-white px-5 text-sm font-medium text-[#8A1538] transition hover:bg-[#FFF7F8]">
                  <MessageCircle className="h-4 w-4" />
                  Hablar con el equipo
                </WhatsAppLink>
              ) : null}
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#4B5563]">
              <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-[#8A1538]" />Stock actualizado</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#8A1538]" />Atención personalizada</span>
              <span className="inline-flex items-center gap-2"><CarFront className="h-4 w-4 text-[#8A1538]" />{vehicleCount} unidades disponibles</span>
            </div>
          </div>
          <div className="relative min-h-[320px] overflow-hidden bg-[#E9E3E4] lg:min-h-0">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="Vehículo destacado de Funes Exclusivos" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center bg-[linear-gradient(135deg,#F7EFF1_0%,#E9E3E4_48%,#C9B9BD_100%)] px-8 text-center">
                <img src="/logo-funes.svg" alt="" aria-hidden="true" className="h-16 w-auto opacity-40" />
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-[#6B7280]">Espacio para imagen principal</p>
                <p className="mt-2 max-w-xs text-sm leading-6 text-[#6B7280]">Una foto panorámica del showroom, el equipo o una unidad destacada.</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FCF7F8]/10 via-transparent to-[#111827]/10" />
            <div className="absolute bottom-5 left-5 rounded-full border border-white/70 bg-white/90 px-4 py-2 text-xs font-medium text-[#111827] backdrop-blur">
              {heroVehicle ? `${heroVehicle.marca ?? "Vehículo"} ${heroVehicle.modelo ?? "seleccionado"}` : "Vehículos seleccionados"}
            </div>
          </div>
        </div>
        <Link href="#vehiculos" className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs font-medium text-[#6B7280] transition hover:text-[#8A1538] lg:inline-flex">
          Conocé nuestro stock <ArrowDown className="h-4 w-4" />
        </Link>
      </section>

      <section id="servicios" className="py-16 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8A1538]">Una experiencia simple</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#111827] sm:text-4xl">Todo lo que necesitás para cambiar de auto.</h2>
          <p className="mt-4 text-base leading-7 text-[#6B7280]">Te acompañamos antes, durante y después de la operación, con información clara en cada paso.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { icon: CarFront, title: "Compra y venta", text: "Un stock curado para que encuentres una unidad que realmente encaje con vos." },
            { icon: FileCheck2, title: "Gestoría y documentación", text: "Seguimiento ordenado de la documentación para avanzar con tranquilidad." },
            { icon: ShieldCheck, title: "Atención personalizada", text: "Un equipo disponible para responder tus preguntas y ayudarte a decidir." },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-xl border border-[#E5E7EB] bg-white p-6 transition hover:border-[#D9A8B8]">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F8E9ED] text-[#8A1538]"><Icon className="h-5 w-5" /></span>
              <h3 className="mt-5 text-lg font-semibold text-[#111827]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="nosotros" className="grid gap-6 border-y border-[#E5E7EB] py-16 sm:py-20 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div className="order-2 lg:order-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8A1538]">Funes Exclusivos</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#111827] sm:text-4xl">Una forma más clara de elegir.</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#6B7280]">Conocé cada unidad, compará opciones y contactá al equipo cuando estés listo. La información del catálogo se actualiza con el stock disponible.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="#vehiculos" className="inline-flex h-11 items-center rounded-full bg-[#111827] px-5 text-sm font-medium text-white transition hover:bg-[#27303D]">Explorar stock</Link>
            {config.instagram_url ? <Link href={config.instagram_url} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full border border-[#E5E7EB] px-5 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"><Instagram className="h-4 w-4" />Instagram</Link> : null}
          </div>
        </div>
        <div className="order-1 flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-8 text-center lg:order-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9CA3AF]">Espacio para imagen</p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-[#6B7280]">Foto del equipo, showroom o experiencia de entrega.</p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-xl bg-[#8A1538] px-6 py-10 text-white sm:px-10 sm:py-12">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#F3DCE3]">¿Estás buscando tu próximo auto?</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">Hablemos de lo que necesitás.</h2>
          </div>
          {phone ? <WhatsAppLink phone={phone} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-[#8A1538] transition hover:bg-[#FFF7F8]"><MessageCircle className="h-4 w-4" />Consultar por WhatsApp</WhatsAppLink> : null}
        </div>
      </section>

      <footer className="flex flex-col gap-3 border-t border-[#E5E7EB] py-8 text-sm text-[#6B7280] sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} Funes Exclusivos</span>
        <div className="flex items-center gap-4">
          <Link href="#inicio" className="transition hover:text-[#8A1538]">Volver arriba</Link>
          {config.instagram_url ? <Link href={config.instagram_url} target="_blank" rel="noreferrer" className="transition hover:text-[#8A1538]">Instagram</Link> : null}
        </div>
      </footer>
    </>
  );
}
