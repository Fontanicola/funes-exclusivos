import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { isDemoMode } from "@/lib/demo-mode";
import { mockLeads, mockPipelineEstados } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CrmPipeline } from "@/components/crm/crm-pipeline";
import { LeadsTable } from "@/components/crm/leads-table";

export const metadata: Metadata = {
  title: "CRM | Funes Exclusivos",
};

export const dynamic = "force-dynamic";

type Lead = {
  id: string;
  nombre: string | null;
  telefono: string | null;
  email: string | null;
  documento: string | null;
  origen: string | null;
  estado: string | null;
  presupuesto_min: number | null;
  presupuesto_max: number | null;
  presupuesto_moneda: string | null;
  nivel_interes: number | null;
  proximo_contacto: string | null;
  created_at: string | null;
  notas: string | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    version: string | null;
    anio: number | null;
    dominio: string | null;
  } | null;
  vendedor: {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
  } | null;
};

type PipelineEstado = {
  id: string;
  slug: string;
  nombre: string;
  orden: number;
  activo: boolean | null;
};

type RawLead = Omit<Lead, "vehiculo" | "vendedor"> & {
  vehiculo: Lead["vehiculo"] | Lead["vehiculo"][] | null;
  vendedor: Lead["vendedor"] | Lead["vendedor"][] | null;
};

function normalizeSingleRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function formatMoney(value: number, currency: string | null) {
  const isoCurrency = (currency ?? "").toLowerCase() === "usd" ? "USD" : "ARS";
  const symbol = isoCurrency === "USD" ? "US$" : "$";
  const formatted = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(value);

  return `${symbol} ${formatted}`;
}

function formatCurrencyBreakdown(groups: { currency: string; total: number }[]) {
  if (!groups.length) return "—";

  return groups
    .map((group) => formatMoney(group.total, group.currency))
    .join(" · ");
}

function summarize(groups: { currency: string; total: number }[]) {
  if (!groups.length) return "—";
  if (groups.length === 1) {
    const [group] = groups;
    return formatMoney(group.total, group.currency);
  }

  return "Mixto";
}

function aggregateByCurrency(leads: Lead[], field: "presupuesto_min" | "presupuesto_max") {
  const groups = new Map<string, { currency: string; total: number }>();

  for (const lead of leads) {
    if (lead.estado === "ganado" || lead.estado === "perdido") continue;

    const currency = (lead.presupuesto_moneda ?? "ARS").toUpperCase();
    const current = groups.get(currency) ?? { currency, total: 0 };
    current.total += lead[field] ?? 0;
    groups.set(currency, current);
  }

  return Array.from(groups.values()).sort((left, right) =>
    left.currency.localeCompare(right.currency)
  );
}

function getActiveLeads(leads: Lead[]) {
  return leads.filter((lead) => lead.estado !== "ganado" && lead.estado !== "perdido");
}

function getNegotiationLeads(leads: Lead[]) {
  return leads.filter((lead) => lead.estado === "negociacion");
}

function getUpcomingLeads(leads: Lead[]) {
  return leads.filter((lead) => Boolean(lead.proximo_contacto));
}

export default async function CrmPage() {
  let leads: Lead[] = mockLeads as Lead[];
  let pipelineEstados: PipelineEstado[] = mockPipelineEstados as PipelineEstado[];

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const [pipelineResult, leadsResult] = await Promise.all([
      supabase
        .from("crm_pipeline_estados")
        .select("id,slug,nombre,orden,activo")
        .eq("activo", true)
        .order("orden"),
      supabase
        .from("leads")
        .select(
          "id,nombre,telefono,email,origen,estado,presupuesto_min,presupuesto_max,presupuesto_moneda,nivel_interes,proximo_contacto,created_at,vehiculo:vehiculos!leads_vehiculo_interes_id_fkey(id,marca,modelo,version,anio,dominio),vendedor:empleados!leads_vendedor_id_fkey(id,nombre,email,rol)"
        )
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    pipelineEstados = (pipelineResult.data ?? []) as PipelineEstado[];
    leads = ((leadsResult.data ?? []) as unknown as RawLead[]).map((lead) => ({
      ...lead,
      vehiculo: normalizeSingleRelation(lead.vehiculo),
      vendedor: normalizeSingleRelation(lead.vendedor),
    }));
  }

  const activeLeads = getActiveLeads(leads);
  const negotiationLeads = getNegotiationLeads(leads);
  const upcomingLeads = getUpcomingLeads(leads);
  const presupuestoTotal = aggregateByCurrency(activeLeads, "presupuesto_min");

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
              CRM
            </h1>
            <p className="text-sm leading-6 text-[#6B7280]">
              Leads, pipeline comercial e historial de seguimiento
            </p>
          </div>

          <Link
            href="/crm/nuevo"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A]"
          >
            <Plus className="h-4 w-4" />
            Nuevo lead
          </Link>
        </div>
        {isDemoMode ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
            Modo demo: los leads son mock y no se guardará nada en Supabase.
          </div>
        ) : null}
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Leads activos</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">
            {activeLeads.length}
          </p>
        </article>
        <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">En negociación</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">
            {negotiationLeads.length}
          </p>
        </article>
        <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Próximos contactos</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">
            {upcomingLeads.length}
          </p>
          <p className="mt-2 text-xs text-[#6B7280]">{formatCurrencyBreakdown(presupuestoTotal)}</p>
        </article>
      </div>

      <CrmPipeline leads={leads} pipelineEstados={pipelineEstados} />
      <LeadsTable leads={leads} />
    </section>
  );
}
