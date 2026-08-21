import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PeriodFilter } from "@/components/dashboard/period-filter";

export function DashboardIntro({ hasAlerts }: { hasAlerts: boolean }) {
  const today = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <header className="rounded-md border border-[#E5E7EB] bg-white">
      <div className="flex flex-col gap-5 px-5 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A1538]">
            <span>Control ejecutivo</span>
            <span className="h-1 w-1 rounded-full bg-[#D8A1B2]" />
            <span className="font-medium normal-case tracking-normal text-[#9CA3AF]">{today}</span>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[#111827] sm:text-3xl">Una lectura clara del negocio.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">Ventas, caja, stock y oportunidades comerciales en un mismo lugar para decidir qué mover hoy.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-0.5 text-xs text-[#6B7280]">
            <PeriodFilter />
          </div>
          <Link href={hasAlerts ? "/recordatorios" : "/inventario"} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#374151] transition hover:border-[#D8A1B2] hover:text-[#8A1538]">
            {hasAlerts ? "Revisar pendientes" : "Ver inventario"}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
      <div className="grid border-t border-[#E5E7EB] sm:grid-cols-3">
        <div className="px-5 py-3 sm:px-6"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">Prioridad</p><p className="mt-1 text-sm font-medium text-[#111827]">Atención antes que volumen</p></div>
        <div className="border-t border-[#E5E7EB] px-5 py-3 sm:border-l sm:border-t-0 sm:px-6"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">Monedas</p><p className="mt-1 text-sm font-medium text-[#111827]">ARS y USD separados</p></div>
        <div className="border-t border-[#E5E7EB] px-5 py-3 sm:border-l sm:border-t-0 sm:px-6"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">Lectura</p><p className="mt-1 text-sm font-medium text-[#111827]">Datos del período seleccionado</p></div>
      </div>
    </header>
  );
}
