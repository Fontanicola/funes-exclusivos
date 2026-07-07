"use client";

import Link from "next/link";

type Lead = {
  id: string;
  nombre: string | null;
  telefono: string | null;
  email: string | null;
  origen: string | null;
  estado: string | null;
  presupuesto_min: number | null;
  presupuesto_max: number | null;
  presupuesto_moneda: string | null;
  nivel_interes: number | null;
  proximo_contacto: string | null;
  created_at: string | null;
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

function getSellerName(lead: Lead) {
  return lead.vendedor?.nombre ?? lead.vendedor?.email ?? "Sin vendedor";
}

function getVehicleSummary(lead: Lead) {
  const vehicle = lead.vehiculo;
  return vehicle ? `${vehicle.marca ?? "-"} ${vehicle.modelo ?? ""}`.trim() : null;
}

export function CrmPipeline({
  leads,
  pipelineEstados,
}: {
  leads: Lead[];
  pipelineEstados: PipelineEstado[];
}) {
  const states = pipelineEstados.length
    ? pipelineEstados
    : [
        { id: "nuevo", slug: "nuevo", nombre: "Nuevo", orden: 1, activo: true },
        { id: "contactado", slug: "contactado", nombre: "Contactado", orden: 2, activo: true },
        { id: "interesado", slug: "interesado", nombre: "Interesado", orden: 3, activo: true },
        { id: "negociacion", slug: "negociacion", nombre: "Negociación", orden: 4, activo: true },
        { id: "reservado", slug: "reservado", nombre: "Reservado", orden: 5, activo: true },
        { id: "ganado", slug: "ganado", nombre: "Ganado", orden: 6, activo: true },
        { id: "perdido", slug: "perdido", nombre: "Perdido", orden: 7, activo: true },
      ];

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="space-y-1 border-b border-[#E5E7EB] pb-4">
        <h2 className="text-base font-semibold text-[#111827]">Pipeline</h2>
        <p className="text-sm text-[#6B7280]">
          Vista comercial por estado, sin arrastrar tarjetas.
        </p>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-7 lg:grid-cols-3 md:grid-cols-2">
        {states
          .slice()
          .sort((left, right) => left.orden - right.orden)
          .map((state) => {
            const stateLeads = leads.filter((lead) => lead.estado === state.slug);

            return (
              <div key={state.id} className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-3">
                <div className="flex items-center justify-between gap-2 border-b border-[#E5E7EB] pb-3">
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{state.nombre}</p>
                    <p className="text-xs text-[#6B7280]">{stateLeads.length} leads</p>
                  </div>
                  <span className="rounded-full border border-[#E5E7EB] bg-white px-2 py-1 text-xs font-medium text-[#111827]">
                    {stateLeads.length}
                  </span>
                </div>

                <div className="mt-3 space-y-3">
                  {stateLeads.length ? (
                    stateLeads.map((lead) => (
                      <Link
                        key={lead.id}
                        href={`/crm/${lead.id}`}
                        className="block rounded-xl border border-[#E5E7EB] bg-white p-3 transition hover:bg-[#F9FAFB]"
                      >
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-[#111827]">{lead.nombre ?? "Sin nombre"}</p>
                            {getVehicleSummary(lead) ? (
                              <p className="text-xs text-[#6B7280]">{getVehicleSummary(lead)}</p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                            <span>{getSellerName(lead)}</span>
                            {lead.nivel_interes ? <span>• Nivel {lead.nivel_interes}</span> : null}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-6 text-center text-xs text-[#6B7280]">
                      Sin leads en esta etapa.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}
