import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { CatalogoGallery } from "@/components/catalogo-publico/catalogo-gallery";
import { CatalogoPublicNav } from "@/components/catalogo-publico/catalogo-public-nav";
import { getPublicCatalogConfig } from "@/lib/catalogo/public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nosotros | Funes Exclusivos",
  description: "Conocé la historia, el showroom y la forma de trabajar de Funes Exclusivos.",
};

export default async function NosotrosPage() {
  const { config } = await getPublicCatalogConfig();

  return (
    <main className="min-h-screen bg-white text-[#111827]">
      <CatalogoPublicNav config={config}>
        <section className="border-b border-[#E5E7EB] bg-[#111827] text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_0.8fr] lg:items-end lg:px-8">
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#E7B8C7]">Nosotros</p><h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">Una forma distinta de vivir los autos.</h1></div>
            <p className="max-w-md text-base leading-7 text-white/70">Funes Exclusivos nació para unir vehículos con historia, atención cercana y una experiencia de compra a la altura de cada unidad.</p>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
          <div className="overflow-hidden"><img src="/catalogo/galeria/fachada-dia.png" alt="Fachada de Funes Exclusivos" className="h-full min-h-[360px] w-full object-cover" /></div>
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8A1538]">Nuestra identidad</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Más que una concesionaria.</h2><p className="mt-6 text-base leading-7 text-[#6B7280]">Nos mueve la pasión por encontrar unidades especiales y presentarlas como merecen. Cada auto tiene algo para contar: una época, una carrera, una restauración o simplemente el recuerdo de haber sido el auto soñado.</p><p className="mt-5 text-base leading-7 text-[#6B7280]">Por eso cuidamos cada detalle: la selección, la preparación, la información y el acompañamiento durante toda la operación.</p><div className="mt-8 grid gap-4 sm:grid-cols-3">{[[Heart, "Pasión"], [ShieldCheck, "Confianza"], [Sparkles, "Detalle"]].map(([Icon, label]) => <div key={label as string} className="border-t border-[#E5E7EB] pt-4"><Icon className="h-5 w-5 text-[#8A1538]" /><p className="mt-3 text-sm font-semibold">{label as string}</p></div>)}</div></div>
        </section>

        <section className="border-y border-[#E5E7EB] bg-[#F9FAFB] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"><div className="mx-auto max-w-7xl"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8A1538]">El lugar</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Conocé nuestro mundo.</h2></div><p className="max-w-sm text-sm leading-6 text-[#6B7280]">Un showroom pensado para mirar con tiempo, conversar y descubrir unidades que no aparecen todos los días.</p></div><div className="mt-10"><CatalogoGallery /></div></div></section>

        <section className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-16 sm:px-6 sm:py-20 lg:flex-row lg:items-center lg:justify-between lg:px-8"><div><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8A1538]">¿Querés conocernos?</p><h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">Pasá por el showroom o escribinos.</h2></div><div className="flex flex-wrap gap-3"><Link href="/catalogo" className="inline-flex h-11 items-center gap-2 rounded-md bg-[#8A1538] px-5 text-sm font-semibold text-white hover:bg-[#6F102D]">Ver vehículos <ArrowRight className="h-4 w-4" /></Link><Link href="/contacto" className="inline-flex h-11 items-center rounded-md border border-[#E5E7EB] px-5 text-sm font-semibold hover:bg-[#F9FAFB]">Contacto</Link></div></section>
      </CatalogoPublicNav>
    </main>
  );
}
