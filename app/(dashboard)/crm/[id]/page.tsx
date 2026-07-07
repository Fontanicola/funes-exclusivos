import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import { mockEmpleados, mockLeadInteracciones, mockLeads, mockVentas, mockVehiculos } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LeadDetail } from "@/components/crm/lead-detail";
import { LeadInteractionForm } from "@/components/crm/lead-interaction-form";
import { LeadInteractionsTimeline } from "@/components/crm/lead-interactions-timeline";
import { LeadOriginBadge } from "@/components/crm/lead-origin-badge";
import { LeadStatusBadge } from "@/components/crm/lead-status-badge";

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
  notas: string | null;
  venta_id: string | null;
  fecha_ganado: string | null;
  created_at: string | null;
  moneda_presupuesto?: string | null;
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
  venta: {
    id: string;
    fecha_venta: string | null;
    precio_venta: number | null;
    moneda: string | null;
    estado: string | null;
    vehiculo: {
      id: string;
      marca: string | null;
      modelo: string | null;
      dominio: string | null;
    } | null;
  } | null;
};

type Interaction = {
  id: string;
  lead_id: string | null;
  tipo: string | null;
  titulo: string | null;
  contenido: string | null;
  fecha: string | null;
  created_at: string | null;
  created_by: {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
  } | null;
};

type RawLead = Omit<Lead, "vehiculo" | "vendedor" | "venta"> & {
  vehiculo: Lead["vehiculo"] | Lead["vehiculo"][] | null;
  vendedor: Lead["vendedor"] | Lead["vendedor"][] | null;
  venta: Lead["venta"] | Lead["venta"][] | null;
};

type RawInteraction = Omit<Interaction, "created_by"> & {
  created_by: Interaction["created_by"] | Interaction["created_by"][] | null;
};

function normalizeSingleRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function formatMoney(value: number | null, currency: string | null) {
  if (value == null) return "—";
  const isoCurrency = (currency ?? "").toLowerCase() === "usd" ? "USD" : "ARS";
  const symbol = isoCurrency === "USD" ? "US$" : "$";
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: isoCurrency,
    maximumFractionDigits: 0,
  }).format(value);

  return formatted.replace("US$", symbol).replace("$", symbol);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR").format(date);
}

function getVehicleSummary(lead: Lead) {
  const vehicle = lead.vehiculo;
  if (!vehicle) return null;
  return [vehicle.marca, vehicle.modelo, vehicle.version, vehicle.anio, vehicle.dominio]
    .filter(Boolean)
    .join(" · ");
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  return {
    title: `Lead ${params.id} | CRM | Funes Exclusivos`,
  };
}

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let lead: Lead | null = null;
  let interactions: Interaction[] = [];
  let vehicles: Array<{
    id: string;
    marca: string | null;
    modelo: string | null;
    version: string | null;
    anio: number | null;
    dominio: string | null;
    precio_venta: number | null;
    precio_moneda: string | null;
    estado: string | null;
  }> = [];
  let sellers: Array<{
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
    activo: boolean | null;
  }> = [];

  if (isDemoMode) {
    const demoLead = (mockLeads.find((item) => item.id === params.id) ?? null) as Lead | null;
    const demoSale = demoLead?.venta_id
      ? ((mockVentas.find((item) => item.id === demoLead.venta_id) ?? null) as Lead["venta"])
      : null;

    lead = demoLead ? { ...demoLead, venta: demoSale } : null;
    interactions = (mockLeadInteracciones.filter((item) => item.lead_id === params.id) ?? []) as Interaction[];
    vehicles = mockVehiculos
      .filter((vehicle) => vehicle.estado === "en_stock")
      .map((vehicle) => ({
        id: vehicle.id,
        marca: vehicle.marca ?? null,
        modelo: vehicle.modelo ?? null,
        version: vehicle.version ?? null,
        anio: vehicle.anio ?? null,
        dominio: vehicle.dominio ?? null,
        precio_venta: vehicle.precio_venta ?? null,
        precio_moneda: vehicle.precio_moneda ?? null,
        estado: vehicle.estado ?? null,
      }));
    sellers = mockEmpleados.filter(
      (employee) => employee.activo && ["admin", "vendedor"].includes(employee.rol ?? "")
    );
  } else {
    const supabase = createSupabaseServerClient();

    const [leadResult, interactionsResult, vehiclesResult, sellersResult] = await Promise.all([
      supabase
        .from("leads")
        .select(
          "id,nombre,telefono,email,documento,origen,estado,presupuesto_min,presupuesto_max,presupuesto_moneda,moneda_presupuesto:presupuesto_moneda,nivel_interes,proximo_contacto,notas,venta_id,fecha_ganado,created_at,vehiculo:vehiculos!leads_vehiculo_interes_id_fkey(id,marca,modelo,version,anio,dominio),vendedor:empleados!leads_vendedor_id_fkey(id,nombre,email,rol),venta:ventas!leads_venta_id_fkey(id,fecha_venta,precio_venta,moneda,estado,vehiculo:vehiculos!ventas_vehiculo_id_fkey(id,marca,modelo,dominio))"
        )
        .eq("id", params.id)
        .maybeSingle(),
      supabase
        .from("lead_interacciones")
        .select("id,lead_id,tipo,titulo,contenido,fecha,created_at,created_by:empleados!lead_interacciones_created_by_fkey(id,nombre,email,rol)")
        .eq("lead_id", params.id)
        .order("fecha", { ascending: false }),
      supabase
        .from("vehiculos")
        .select("id,marca,modelo,version,anio,dominio,precio_venta,precio_moneda,estado")
        .eq("estado", "en_stock")
        .order("marca", { ascending: true })
        .order("modelo", { ascending: true }),
      supabase
        .from("empleados")
        .select("id,nombre,email,rol,activo")
        .eq("activo", true)
        .in("rol", ["admin", "vendedor"])
        .order("nombre", { ascending: true }),
    ]);

    const rawLead = leadResult.data as RawLead | null;
    lead = rawLead
      ? {
          ...rawLead,
          vehiculo: normalizeSingleRelation(rawLead.vehiculo),
          vendedor: normalizeSingleRelation(rawLead.vendedor),
          venta: normalizeSingleRelation(rawLead.venta),
        }
      : null;

    interactions = ((interactionsResult.data ?? []) as unknown as RawInteraction[]).map((interaction) => ({
      ...interaction,
      created_by: normalizeSingleRelation(interaction.created_by),
    }));

    vehicles = (vehiclesResult.data ?? []) as typeof vehicles;
    sellers = (sellersResult.data ?? []) as typeof sellers;
  }

  if (!lead) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/crm"
          className="text-sm font-medium text-[#111827] underline-offset-4 hover:underline"
        >
          Volver al CRM
        </Link>
      </div>

      <header className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
              {lead.nombre ?? "Sin nombre"}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <LeadStatusBadge status={lead.estado} />
              <LeadOriginBadge origin={lead.origen} />
            </div>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-sm text-[#111827]">
            <p className="font-medium">Próximo contacto</p>
            <p className="mt-1 text-[#6B7280]">{formatDate(lead.proximo_contacto)}</p>
          </div>
        </div>
      </header>

      <LeadDetail lead={lead} sale={lead.venta ?? null} vehicles={vehicles} sellers={sellers} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-[#111827]">Datos del contacto</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Teléfono</p>
                <p className="mt-1 text-sm text-[#111827]">{lead.telefono ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Email</p>
                <p className="mt-1 text-sm text-[#111827]">{lead.email ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Documento</p>
                <p className="mt-1 text-sm text-[#111827]">{lead.documento ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Vendedor</p>
                <p className="mt-1 text-sm text-[#111827]">
                  {lead.vendedor?.nombre ?? lead.vendedor?.email ?? "—"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-[#111827]">Vehículo de interés</h2>
            <div className="mt-4">
              {lead.vehiculo ? (
                <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                  <p className="text-sm font-medium text-[#111827]">
                    {lead.vehiculo.marca ?? "-"} {lead.vehiculo.modelo ?? ""}
                  </p>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    {getVehicleSummary(lead) ?? "—"}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-4 py-6 text-sm text-[#6B7280]">
                  No hay vehículo asociado.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-[#111827]">Presupuesto y estado comercial</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Presupuesto</p>
                <p className="mt-1 text-sm text-[#111827]">
                  {formatMoney(lead.presupuesto_min, lead.presupuesto_moneda ?? lead.moneda_presupuesto ?? null)}
                  {lead.presupuesto_max && lead.presupuesto_max !== lead.presupuesto_min
                    ? ` - ${formatMoney(lead.presupuesto_max, lead.presupuesto_moneda ?? lead.moneda_presupuesto ?? null)}`
                    : ""}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Nivel de interés</p>
                <p className="mt-1 text-sm text-[#111827]">{lead.nivel_interes ?? "—"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Notas</p>
                <p className="mt-1 text-sm leading-6 text-[#111827]">{lead.notas ?? "—"}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <LeadInteractionForm leadId={lead.id} />
          <LeadInteractionsTimeline interactions={interactions} />
        </div>
      </div>
    </section>
  );
}
