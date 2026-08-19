"use client";

import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import { Columns3, Table2 } from "lucide-react";
import { CrmPipeline } from "./crm-pipeline";
import { LeadsTable } from "./leads-table";

type Lead = ComponentProps<typeof LeadsTable>["leads"][number];
type PipelineEstado = ComponentProps<typeof CrmPipeline>["pipelineEstados"][number];

export function CrmViews({
  leads,
  pipelineEstados,
  newLeadAction,
  aiAction,
}: {
  leads: Lead[];
  pipelineEstados: PipelineEstado[];
  newLeadAction: ReactNode;
  aiAction?: ReactNode;
}) {
  const [view, setView] = useState<"pipeline" | "table">("pipeline");

  return (
    <section className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">
            {view === "pipeline" ? "Pipeline" : "Leads"}
          </h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            {view === "pipeline"
              ? "Vista comercial por etapa. Seleccioná una tarjeta para ver el detalle."
              : "Listado completo de oportunidades comerciales."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {view === "pipeline" ? (
            <>
              {newLeadAction}
            </>
          ) : null}
          <div className="inline-flex items-center rounded-md border border-[#E5E7EB] bg-white p-1">
            <button
              type="button"
              onClick={() => setView("pipeline")}
              aria-pressed={view === "pipeline"}
              className={[
                "inline-flex h-8 items-center gap-2 rounded px-2.5 text-xs font-medium transition",
                view === "pipeline"
                  ? "bg-[#FDF2F5] text-[#8A1538]"
                  : "text-[#6B7280] hover:bg-[#F9FAFB]",
              ].join(" ")}
            >
              <Columns3 className="h-4 w-4" />
              Columnas
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              aria-pressed={view === "table"}
              className={[
                "inline-flex h-8 items-center gap-2 rounded px-2.5 text-xs font-medium transition",
                view === "table"
                  ? "bg-[#FDF2F5] text-[#8A1538]"
                  : "text-[#6B7280] hover:bg-[#F9FAFB]",
              ].join(" ")}
            >
              <Table2 className="h-4 w-4" />
              Tabla
            </button>
          </div>
        </div>
      </div>

      {view === "pipeline" ? (
        <CrmPipeline
          leads={leads}
          pipelineEstados={pipelineEstados}
          newColumnAction={aiAction}
        />
      ) : (
        <LeadsTable leads={leads} toolbarAction={newLeadAction} />
      )}
    </section>
  );
}
