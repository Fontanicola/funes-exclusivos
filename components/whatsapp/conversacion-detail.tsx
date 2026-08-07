"use client";

import { AiSummaryCard } from "./ai-summary-card";
import { ConversationFollowUpForm } from "./conversation-follow-up-form";

type Conversation = {
  id: string;
  contacto_nombre: string | null;
  contacto_telefono: string | null;
  contacto_email: string | null;
  estado: string | null;
  lead_id: string | null;
  vehiculo_interes_id: string | null;
  interes_compra: string | null;
  ia_estado: string | null;
  ia_resumen: string | null;
  ia_interes_compra: string | null;
  ia_score: number | null;
  ia_intencion: string | null;
  ia_proximo_paso: string | null;
  ia_procesado_at: string | null;
  ia_error: string | null;
  resumen_ia: string | null;
  intencion_detectada: string | null;
  proxima_accion_sugerida: string | null;
  requiere_atencion: boolean | null;
  lead: {
    id: string;
    nombre: string | null;
    telefono: string | null;
    email: string | null;
    estado: string | null;
    origen: string | null;
  } | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    version: string | null;
    anio: number | null;
    dominio: string | null;
  } | null;
};

function FieldValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B7280]">{label}</p>
      <p className="text-sm font-medium text-[#111827]">{value}</p>
    </div>
  );
}

function getVehicleTitle(vehicle: Conversation["vehiculo"]) {
  if (!vehicle) return "Sin vehículo vinculado";
  return [vehicle.marca, vehicle.modelo].filter(Boolean).join(" ") || "Sin vehículo vinculado";
}

function getVehicleSubtitle(vehicle: Conversation["vehiculo"]) {
  if (!vehicle) return "—";
  return [vehicle.version, vehicle.anio ? String(vehicle.anio) : null, vehicle.dominio]
    .filter(Boolean)
    .join(" · ");
}

export function ConversacionDetail({ conversation }: { conversation: Conversation }) {
  return (
    <aside className="space-y-4 xl:border-l xl:border-[#E5E7EB] xl:pl-6">
      <section className="rounded-md border border-[#E5E7EB] bg-white p-4">
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-[#111827]">Contacto</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              {conversation.contacto_nombre ?? "Sin nombre"} · {conversation.contacto_telefono ?? conversation.contacto_email ?? "Sin teléfono"}
            </p>
          </div>

          <div className="grid gap-3">
            <FieldValue label="Lead vinculado" value={conversation.lead?.nombre ?? "Sin lead vinculado"} />
            {conversation.lead?.origen ? <FieldValue label="Origen" value={conversation.lead.origen} /> : null}
            <FieldValue label="Vehículo de interés" value={getVehicleTitle(conversation.vehiculo)} />
            <p className="text-sm text-[#6B7280]">{getVehicleSubtitle(conversation.vehiculo)}</p>
          </div>
        </div>
      </section>

      <AiSummaryCard conversation={conversation} />

      <ConversationFollowUpForm conversation={conversation} />
    </aside>
  );
}
