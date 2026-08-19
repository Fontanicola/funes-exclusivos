"use client";

import Link from "next/link";
import { Search, MessageCircle, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DataEntryModal } from "@/components/common/data-entry-modal";
import { AdvancedFilters } from "@/components/common/advanced-filters";
import { ConversacionInterestBadge } from "./conversacion-interest-badge";
import { ConversationHeaderActions } from "./conversation-header-actions";
import { ConversacionDetail } from "./conversacion-detail";
import { MessagesList } from "./messages-list";

type Conversation = {
  id: string;
  contacto_nombre: string | null;
  contacto_telefono: string | null;
  estado: string | null;
  lead_id: string | null;
  vendedor_id: string | null;
  contacto_email: string | null;
  unread_count: number | null;
  requiere_atencion: boolean | null;
  ultimo_mensaje_at: string | null;
  last_message_preview: string | null;
  interes_compra: string | null;
  resumen_ia: string | null;
  ia_estado: string | null;
  ia_interes_compra: string | null;
  ia_score: number | null;
  ia_intencion: string | null;
  ia_proximo_paso: string | null;
  ia_procesado_at: string | null;
  ia_error: string | null;
  vehiculo_interes_id: string | null;
  intencion_detectada: string | null;
  proxima_accion_sugerida: string | null;
  ia_resumen: string | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    version: string | null;
    anio: number | null;
    dominio: string | null;
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
  } | null;
};

type Message = {
  id: string;
  body: string | null;
  message_type?: string | null;
  tipo?: string | null;
  direccion?: string | null;
  direction?: string | null;
  from_me?: boolean | null;
  sent_at: string | null;
  created_at: string | null;
};

const CONTACTS_PAGE_SIZE = 20;

function formatTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(date);
}

function contactName(conversation: Conversation) {
  return conversation.contacto_nombre || conversation.lead?.nombre || conversation.contacto_telefono || "Sin nombre";
}

function vehicleName(conversation: Conversation) {
  if (!conversation.vehiculo) return null;
  return [conversation.vehiculo.marca, conversation.vehiculo.modelo].filter(Boolean).join(" ") || null;
}

function isIncoming(message: Message) {
  const direction = (message.direccion ?? message.direction ?? "").toLowerCase();
  if (!direction && typeof message.from_me === "boolean") return !message.from_me;
  if (!direction) return false;
  return !["saliente", "outbound", "sent"].includes(direction);
}

function hasUnansweredMessage(conversation: Conversation, messages: Record<string, Message[]>) {
  const conversationMessages = messages[conversation.id] ?? [];
  const lastMessage = conversationMessages[conversationMessages.length - 1];
  return Boolean(lastMessage && isIncoming(lastMessage));
}

export function WhatsappInbox({
  conversaciones,
  mensajes,
}: {
  conversaciones: Conversation[];
  mensajes: Record<string, Message[]>;
}) {
  const [query, setQuery] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [selectedId, setSelectedId] = useState(conversaciones[0]?.id ?? null);
  const [visibleContacts, setVisibleContacts] = useState(CONTACTS_PAGE_SIZE);

  const sellers = useMemo(
    () =>
      conversaciones
        .map((conversation) => conversation.vendedor)
        .filter((seller): seller is NonNullable<Conversation["vendedor"]> => Boolean(seller?.id))
        .filter((seller, index, all) => all.findIndex((item) => item.id === seller.id) === index)
        .sort((a, b) => (a.nombre ?? "").localeCompare(b.nombre ?? "", "es")),
    [conversaciones]
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return conversaciones.filter((conversation) => {
      if (sellerId && conversation.vendedor_id !== sellerId) return false;
      if (!normalizedQuery) return true;

      return [
        contactName(conversation),
        conversation.contacto_telefono,
        conversation.lead?.nombre,
        conversation.vendedor?.nombre,
        conversation.last_message_preview,
        vehicleName(conversation),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [conversaciones, query, sellerId]);

  const visibleConversations = useMemo(
    () => filtered.slice(0, visibleContacts),
    [filtered, visibleContacts]
  );

  useEffect(() => {
    setVisibleContacts(CONTACTS_PAGE_SIZE);
  }, [query, sellerId]);

  useEffect(() => {
    if (!visibleConversations.some((conversation) => conversation.id === selectedId)) {
      setSelectedId(visibleConversations[0]?.id ?? null);
    }
  }, [selectedId, visibleConversations]);

  const selected = conversaciones.find((conversation) => conversation.id === selectedId) ?? null;
  const selectedMessages = selected ? mensajes[selected.id] ?? [] : [];

  return (
    <section className="flex min-h-0 flex-1 overflow-hidden rounded-md border border-[#E5E7EB] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="grid min-h-0 flex-1 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-[#E5E7EB] bg-[#FCFCFC] lg:border-b-0 lg:border-r">
          <div className="shrink-0 border-b border-[#E5E7EB] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[#111827]">Conversaciones</h2>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/whatsapp/conexiones" className="text-xs font-medium text-[#8A1538] hover:underline">
                  Conexiones
                </Link>
                <span className="rounded-full bg-[#F3F4F6] px-2 py-1 text-xs font-medium text-[#6B7280]">
                  {filtered.length}
                </span>
              </div>
            </div>

            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar contacto"
                className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white pl-9 pr-3 text-sm text-[#111827] outline-none focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]"
              />
            </div>

            <div className="mt-2">
              <AdvancedFilters label="Filtros">
                <select
                  value={sellerId}
                  onChange={(event) => setSellerId(event.target.value)}
                  className="h-9 min-w-[190px] rounded-md border border-[#E5E7EB] bg-white px-3 text-xs text-[#111827] outline-none focus:border-[#8A1538]"
                >
                  <option value="">Todos los vendedores</option>
                  {sellers.map((seller) => (
                    <option key={seller.id} value={seller.id}>
                      {seller.nombre ?? "Sin vendedor"}
                    </option>
                  ))}
                </select>
              </AdvancedFilters>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {filtered.length ? (
              visibleConversations.map((conversation) => {
                const isSelected = conversation.id === selectedId;
                const unanswered = hasUnansweredMessage(conversation, mensajes);
                const interestVehicle = vehicleName(conversation);

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setSelectedId(conversation.id)}
                    className={`w-full border-b border-[#E5E7EB] px-4 py-3 text-left transition ${
                      isSelected ? "bg-[#FDF2F5]" : "bg-white hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3E1E7] text-[#8A1538]">
                        <UserRound className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-[#111827]">{contactName(conversation)}</span>
                          <span className="flex shrink-0 items-center gap-2">
                            <span className="text-[10px] text-[#9CA3AF]">{formatTime(conversation.ultimo_mensaje_at)}</span>
                            {unanswered ? (
                              <span
                                className="h-2 w-2 rounded-full bg-[#8A1538]"
                                aria-label="El vendedor tiene un mensaje pendiente de responder"
                                title="Mensaje pendiente de respuesta"
                              />
                            ) : null}
                          </span>
                        </span>
                        <span className="mt-1 block truncate text-xs text-[#6B7280]">
                          {conversation.last_message_preview || "Sin mensajes guardados"}
                        </span>
                        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]">
                          {interestVehicle ? <span className="truncate font-medium text-[#166534]">Interés: {interestVehicle}</span> : null}
                          {conversation.vendedor?.nombre ? <span className="truncate text-[#6B7280]">Vendedor: {conversation.vendedor.nombre}</span> : null}
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-5 py-12 text-center">
                <MessageCircle className="mx-auto h-8 w-8 text-[#CBD5E1]" />
                <p className="mt-3 text-sm font-medium text-[#111827]">No hay conversaciones</p>
                <p className="mt-1 text-xs leading-5 text-[#6B7280]">Probá cambiar la búsqueda o conectar WhatsApp.</p>
              </div>
            )}
            {visibleConversations.length < filtered.length ? (
              <button
                type="button"
                onClick={() => setVisibleContacts((current) => current + CONTACTS_PAGE_SIZE)}
                className="w-full border-t border-[#E5E7EB] bg-white px-4 py-3 text-center text-xs font-semibold text-[#8A1538] transition hover:bg-[#FDF2F5]"
              >
                Ver más
              </button>
            ) : null}
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col bg-[#F8FAFC]">
          {selected ? (
            <>
              <header className="shrink-0 border-b border-[#E5E7EB] bg-white px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3E1E7] text-[#8A1538]">
                      <UserRound className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold text-[#111827]">{contactName(selected)}</h3>
                        <ConversacionInterestBadge interest={selected.ia_interes_compra ?? selected.interes_compra} />
                      </div>
                      <p className="mt-0.5 text-xs text-[#6B7280]">{selected.contacto_telefono || "Sin teléfono"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <DataEntryModal
                      triggerLabel="Ver ficha"
                      title={contactName(selected)}
                      description="Resumen de contacto, interés y seguimiento."
                      size="wide"
                      triggerClassName="inline-flex h-9 items-center rounded-md border border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#111827] hover:bg-[#F9FAFB]"
                    >
                      <ConversacionDetail conversation={selected} />
                    </DataEntryModal>
                    <ConversationHeaderActions conversationId={selected.id} hasSummary={Boolean(selected.ia_resumen)} />
                  </div>
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-hidden">
                <MessagesList
                  messages={selectedMessages}
                  lastMessagePreview={selected.last_message_preview}
                  hasRecentActivity={Boolean(selected.last_message_preview)}
                  paginate={false}
                  showHeader={false}
                  fillHeight
                  incomingLabel={contactName(selected)}
                  outgoingLabel={selected.vendedor?.nombre ?? "Vendedor"}
                />
              </div>
            </>
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center px-6 text-center">
              <div>
                <MessageCircle className="mx-auto h-10 w-10 text-[#CBD5E1]" />
                <h3 className="mt-4 text-base font-semibold text-[#111827]">Seleccioná una conversación</h3>
                <p className="mt-1 text-sm text-[#6B7280]">Los mensajes completos aparecerán en este panel.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
