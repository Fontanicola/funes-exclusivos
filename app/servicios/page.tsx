import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CarFront, FileCheck2, Handshake, SearchCheck } from "lucide-react";
import { CatalogoPublicNav } from "@/components/catalogo-publico/catalogo-public-nav";
import { getPublicCatalogConfig } from "@/lib/catalogo/public-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Servicios | Funes Exclusivos", description: "Compra, venta, permuta y gestoría con el acompañamiento de Funes Exclusivos." };

const services = [
  { icon: CarFront, number: "01", title: "Compra y venta", text: "Encontramos la unidad correcta y te acompañamos con información clara desde la primera consulta hasta la entrega." },
  { icon: Handshake, number: "02", title: "Tomamos tu vehículo", text: "Evaluamos tu auto para facilitar el cambio y armar una propuesta acorde a la operación que querés hacer." },
  { icon: FileCheck2, number: "03", title: "Gestoría integral", text: "Ordenamos la documentación y seguimos cada paso para que la transferencia avance de manera simple." },
  { icon: SearchCheck, number: "04", title: "Peritaje y preparación", text: "Revisamos cada unidad y coordinamos la preparación necesaria para que la recibas lista para disfrutar." },
];

export default async function ServiciosPage() {
  const { config } = await getPublicCatalogConfig();
  return <main className="min-h-screen bg-white text-[#111827]"><CatalogoPublicNav config={config}><section className="border-b border-[#E5E7EB] bg-[#F9FAFB]"><div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:px-8"><div><p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8A1538]">Servicios</p><h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">Todo lo que necesitás para disfrutar la operación.</h1></div><img src="/catalogo/galeria/showroom-atencion.png" alt="Atención personalizada en Funes Exclusivos" className="h-56 w-full object-cover lg:h-72" /></div></section><section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"><div className="max-w-xl"><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8A1538]">De punta a punta</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Una operación clara, con un equipo que responde.</h2></div><div className="mt-12 grid border-y border-[#E5E7EB] sm:grid-cols-2">{services.map(({ icon: Icon, number, title, text }, index) => <article key={title} className={`p-6 sm:p-8 ${index % 2 ? "sm:border-l" : ""} ${index > 1 ? "border-t" : ""} border-[#E5E7EB]`}><div className="flex items-center justify-between"><span className="text-xs font-semibold tracking-[0.2em] text-[#8A1538]">{number}</span><Icon className="h-5 w-5 text-[#8A1538]" /></div><h3 className="mt-12 text-xl font-semibold">{title}</h3><p className="mt-3 max-w-md text-sm leading-6 text-[#6B7280]">{text}</p></article>)}</div></section><section className="border-y border-[#E5E7EB] bg-[#111827] px-4 py-14 text-white sm:px-6 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">¿Ya sabés qué buscás?</p><h2 className="mt-3 text-2xl font-semibold">Mirá el stock disponible.</h2></div><Link href="/catalogo" className="inline-flex h-11 items-center gap-2 rounded-md bg-[#8A1538] px-5 text-sm font-semibold hover:bg-[#6F102D]">Ver vehículos <ArrowRight className="h-4 w-4" /></Link></div></section></CatalogoPublicNav></main>;
}
