"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ConversacionInterestBadge } from "./conversacion-interest-badge";
import { ConversacionStatusBadge } from "./conversacion-status-badge";

type Conversation = {
  id: string;
  whatsapp_instancia_id: string | null;
  lead_id: string | null;
  vendedor_id: string | null;
  vehiculo_interes_id: string | null;
  canal: string | null;
  estado: string | null;
  contacto_nombre: string | null;
  contacto_telefono: string | null;
  contacto_numero_normalizado: string | null;
  contacto_email: string | null;
  ultimo_mensaje_at: string | null;
  last_message_preview: string | null;
  mensajes_count: number | null;
  unread_count: number | null;
  resumen_ia: string | null;
  interes_compra: string | null;
  ia_estado: string | null;
  ia_resumen: string | null;
  ia_interes_compra: string | null;
  ia_score: number | null;
  ia_intencion: string | null;
  ia_proximo_paso: string | null;
  ia_procesado_at: string | null;
  ia_modelo: string | null;
  ia_error: string | null;
  intencion_detectada: string | null;
  proxima_accion_sugerida: string | null;
  requiere_atencion: boolean | null;
  created_at: string | null;
  instancia: {
    id: string;
    instance_name: string | null;
    estado: string | null;
    telefono_conectado: string | null;
  } | null;
  lead: {
    id: string;
    nombre: string | null;
    telefono: string | null;
    email: string | null;
    estado: string | null;
    origen: string | null;
  } | null;
  vendedor: {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
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

const statuses = ["", "abierta", "en_seguimiento", "cerrada", "archivada"] as const;
const interests = ["", "alto", "medio", "bajo", "sin_interes", "no_detectado"] as const;
const aiFilters = ["", "alto", "requiere_atencion", "sin_resumen"] as const;

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(date);
}

function getContactTitle(conversation: Conversation) {
  return conversation.contacto_nombre ?? conversation.contacto_telefono ?? "—";
}

function getContactSubtitle(conversation: Conversation) {
  return conversation.contacto_telefono ?? conversation.contacto_email ?? "—";
}

function getSellerName(conversation: Conversation) {
  return conversation.vendedor?.nombre ?? conversation.vendedor?.email ?? "—";
}

function getAiInterest(conversation: Conversation) {
  return conversation.ia_interes_compra ?? conversation.interes_compra;
}

function hasAiSummary(conversation: Conversation) {
  return Boolean(conversation.ia_resumen);
}

function getVehicleSummary(conversation: Conversation) {
  const vehicle = conversation.vehiculo;
  if (!vehicle) return "—";
  return [vehicle.marca, vehicle.modelo, vehicle.version, vehicle.anio, vehicle.dominio]
    .filter(Boolean)
    .join(" · ");
}

function getSearchableText(conversation: Conversation) {
  return [
    conversation.contacto_nombre,
    conversation.contacto_telefono,
    conversation.contacto_email,
    conversation.lead?.nombre,
    conversation.lead?.telefono,
    conversation.vendedor?.nombre,
    conversation.vendedor?.email,
    conversation.last_message_preview,
    conversation.resumen_ia,
    conversation.ia_resumen,
    conversation.ia_intencion,
    conversation.ia_proximo_paso,
    conversation.vehiculo?.marca,
    conversation.vehiculo?.modelo,
    conversation.vehiculo?.dominio,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function ConversacionesTable({ conversaciones }: { conversaciones: Conversation[] }) {
  const [query, setQuery] = useState("");
  const [instanceFilter, setInstanceFilter] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("");
  const [interestFilter, setInterestFilter] = useState<(typeof interests)[number]>("");
  const [aiFilter, setAiFilter] = useState<(typeof aiFilters)[number]>("");
  const [onlyAttention, setOnlyAttention] = useState(false);

  const instanceOptions = useMemo(() => {
    const options = new Map<string, string>();

    for (const conversation of conversaciones) {
      const id = conversation.instancia?.id ?? conversation.whatsapp_instancia_id;
      if (!id) continue;
      options.set(id, conversation.instancia?.instance_name ?? "Sin instancia");
    }

    return Array.from(options.entries());
  }, [conversaciones]);

  const sellerOptions = useMemo(() => {
    const options = new Map<string, string>();

    for (const conversation of conversaciones) {
      const id = conversation.vendedor?.id ?? conversation.vendedor_id;
      if (!id) continue;
      options.set(id, getSellerName(conversation));
    }

    return Array.from(options.entries());
  }, [conversaciones]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return conversaciones.filter((conversation) => {
      if (instanceFilter && (conversation.instancia?.id ?? conversation.whatsapp_instancia_id) !== instanceFilter) return false;
      if (sellerFilter && (conversation.vendedor?.id ?? conversation.vendedor_id) !== sellerFilter) return false;
      if (statusFilter && conversation.estado !== statusFilter) return false;
      if (interestFilter && conversation.interes_compra !== interestFilter) return false;
      if (onlyAttention && !conversation.requiere_atencion) return false;
      if (aiFilter === "alto" && getAiInterest(conversation) !== "alto") return false;
      if (aiFilter === "requiere_atencion" && !conversation.requiere_atencion) return false;
      if (aiFilter === "sin_resumen" && hasAiSummary(conversation)) return false;

      if (!normalizedQuery) return true;
      return getSearchableText(conversation).includes(normalizedQuery);
    });
  }, [aiFilter, conversaciones, interestFilter, instanceFilter, onlyAttention, query, sellerFilter, statusFilter]);

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#E5E7EB] p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#111827]">Conversaciones</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Filtrá por contacto, vendedor, vehículo, estado o interés.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOnlyAttention((current) => !current)}
            className={[
              "inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition",
              onlyAttention
                ? "border-[#E5E7EB] bg-[#18181B] text-white hover:bg-[#27272A]"
                : "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]",
            ].join(" ")}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Requieren atención
          </button>
        </div>

        <div className="grid gap-2 lg:grid-cols-[320px_180px_180px_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar conversación"
              className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white pl-9 pr-9 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[#6B7280] transition hover:bg-[#F3F4F6]"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <select
            value={instanceFilter}
            onChange={(event) => setInstanceFilter(event.target.value)}
            className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          >
            <option value="">Todas las instancias</option>
            {instanceOptions.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={sellerFilter}
            onChange={(event) => setSellerFilter(event.target.value)}
            className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          >
            <option value="">Todos los vendedores</option>
            {sellerOptions.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as (typeof statuses)[number])}
            className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          >
            <option value="">Todos los estados</option>
            <option value="abierta">Abierta</option>
            <option value="en_seguimiento">En seguimiento</option>
            <option value="cerrada">Cerrada</option>
            <option value="archivada">Archivada</option>
          </select>

          <select
            value={interestFilter}
            onChange={(event) => setInterestFilter(event.target.value as (typeof interests)[number])}
            className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          >
            <option value="">Todos los intereses</option>
            <option value="alto">Alto</option>
            <option value="medio">Medio</option>
            <option value="bajo">Bajo</option>
            <option value="sin_interes">Sin interés</option>
            <option value="no_detectado">No detectado</option>
          </select>

          <select
            value={aiFilter}
            onChange={(event) => setAiFilter(event.target.value as (typeof aiFilters)[number])}
            className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          >
            <option value="">Filtro IA</option>
            <option value="alto">Interés alto</option>
            <option value="requiere_atencion">Requiere atención</option>
            <option value="sin_resumen">Sin resumen IA</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#E5E7EB]">
          <thead className="bg-[#FAFAFA]">
            <tr className="text-left text-xs font-medium uppercase tracking-[0.08em] text-[#6B7280]">
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3">Vendedor</th>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Vehículo interés</th>
              <th className="px-4 py-3">Último mensaje</th>
              <th className="px-4 py-3">No leídos</th>
              <th className="px-4 py-3">Interés</th>
              <th className="px-4 py-3">IA</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {filtered.length ? (
              filtered.map((conversation) => (
                <tr key={conversation.id} className="transition hover:bg-[#F9FAFB]">
                  <td className="px-4 py-3 align-middle">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-[#111827]">{getContactTitle(conversation)}</p>
                      <p className="text-sm text-[#6B7280]">{getContactSubtitle(conversation)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <p className="text-sm font-medium text-[#111827]">{getSellerName(conversation)}</p>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-[#111827]">
                        {conversation.lead?.nombre ?? "—"}
                      </p>
                      <p className="text-sm text-[#6B7280]">
                        {conversation.lead?.telefono ?? conversation.lead?.email ?? "—"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-[#111827]">{getVehicleSummary(conversation)}</p>
                      {conversation.vehiculo ? (
                        <p className="text-sm text-[#6B7280]">
                          {conversation.vehiculo.version ?? "—"}
                        </p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="space-y-1">
                      <p className="text-sm text-[#111827]">{formatDateTime(conversation.ultimo_mensaje_at)}</p>
                      <p className="max-w-[260px] text-sm text-[#6B7280]">
                        {conversation.last_message_preview ?? "—"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle text-sm text-[#111827]">
                    {conversation.unread_count && conversation.unread_count > 0 ? conversation.unread_count : "—"}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <ConversacionInterestBadge interest={conversation.interes_compra} />
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="space-y-1">
                      <ConversacionInterestBadge interest={getAiInterest(conversation)} />
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                        <span>{conversation.ia_score != null ? `Score ${conversation.ia_score}` : "Sin score"}</span>
                        {conversation.requiere_atencion ? (
                          <span className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#FEF3C7] px-2 py-0.5 text-[#92400E]">
                            Atención
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <ConversacionStatusBadge status={conversation.estado} />
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <Link
                      href={`/whatsapp/${conversation.id}`}
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-4 py-14 text-center text-sm text-[#6B7280]">
                  No hay conversaciones que coincidan con los filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
