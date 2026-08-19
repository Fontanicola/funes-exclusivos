"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { updateLeadStatusAction } from "@/app/(dashboard)/crm/actions";

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

const PAGE_SIZE = 10;

function getSellerName(lead: Lead) {
  return lead.vendedor?.nombre ?? "Sin vendedor";
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
  const [localLeads, setLocalLeads] = useState(leads);
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [dragError, setDragError] = useState<string | null>(null);

  useEffect(() => setLocalLeads(leads), [leads]);
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
    <div className="min-w-0">
      <div className="grid auto-cols-[240px] grid-flow-col gap-3 overflow-x-auto pb-2">
        {states
          .slice()
          .sort((left, right) => left.orden - right.orden)
          .map((state) => {
            const stateLeads = localLeads.filter((lead) => lead.estado === state.slug);
            const visibleCount = visibleCounts[state.id] ?? PAGE_SIZE;
            const visibleLeads = stateLeads.slice(0, visibleCount);

            return (
              <div
                key={state.id}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const leadId = event.dataTransfer.getData("text/lead-id") || draggedLeadId;
                  if (!leadId) return;
                  const previousLeads = localLeads;
                  const movedLead = previousLeads.find((lead) => lead.id === leadId);
                  if (!movedLead || movedLead.estado === state.slug) return;

                  setDragError(null);
                  setLocalLeads((current) => current.map((lead) => lead.id === leadId ? { ...lead, estado: state.slug } : lead));
                  setDraggedLeadId(null);

                  const formData = new FormData();
                  formData.set("lead_id", leadId);
                  formData.set("estado", state.slug);
                  startTransition(async () => {
                    const result = await updateLeadStatusAction(formData);
                    if (result.error) {
                      setLocalLeads(previousLeads);
                      setDragError(result.error);
                    }
                  });
                }}
                className={[
                  "flex h-[min(62vh,680px)] min-h-[420px] min-w-0 flex-col rounded-md border bg-[#FAFAFA] p-3 transition",
                  draggedLeadId ? "border-[#D8A1B2]" : "border-[#E5E7EB]",
                ].join(" ")}
              >
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#E5E7EB] pb-3">
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{state.nombre}</p>
                    <p className="text-xs text-[#6B7280]">{stateLeads.length} leads</p>
                  </div>
                  <span className="rounded-full border border-[#E5E7EB] bg-white px-2 py-1 text-xs font-medium text-[#111827]">
                    {stateLeads.length}
                  </span>
                </div>

                <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                  {stateLeads.length ? (
                    visibleLeads.map((lead) => (
                      <Link
                        key={lead.id}
                        href={`/crm/${lead.id}`}
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/lead-id", lead.id);
                          setDraggedLeadId(lead.id);
                        }}
                        onDragEnd={() => setDraggedLeadId(null)}
                        onClick={(event) => {
                          if (draggedLeadId) event.preventDefault();
                        }}
                        className={[
                          "block cursor-grab rounded-md border border-[#E5E7EB] bg-white p-3 transition hover:bg-[#F9FAFB] active:cursor-grabbing",
                          draggedLeadId === lead.id ? "opacity-50" : "",
                        ].join(" ")}
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
                    <div className="rounded-md border border-dashed border-[#E5E7EB] bg-white px-3 py-6 text-center text-xs text-[#6B7280]">
                      Sin leads en esta etapa.
                    </div>
                  )}
                </div>
                {visibleLeads.length < stateLeads.length ? (
                  <button
                    type="button"
                    onClick={() => setVisibleCounts((current) => ({ ...current, [state.id]: (current[state.id] ?? PAGE_SIZE) + PAGE_SIZE }))}
                    className="mt-3 shrink-0 border-t border-[#E5E7EB] pt-3 text-center text-xs font-semibold text-[#8A1538] hover:underline"
                  >
                    Ver más
                  </button>
                ) : null}
              </div>
            );
          })}
      </div>
      {isPending ? <p className="mt-2 text-xs text-[#6B7280]">Guardando cambio de etapa...</p> : null}
      {dragError ? <p className="mt-2 text-xs text-rose-700">{dragError}</p> : null}
    </div>
  );
}
