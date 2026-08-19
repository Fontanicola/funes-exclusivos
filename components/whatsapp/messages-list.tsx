"use client";

import { useState } from "react";
import { PaginationControls } from "@/components/common/pagination-controls";

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

const PAGE_SIZE = 10;

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

function getDirection(message: Message) {
  const normalized = (message.direccion ?? message.direction ?? "").toLowerCase();
  if (!normalized && typeof message.from_me === "boolean") {
    return message.from_me ? "saliente" : "entrante";
  }
  if (["saliente", "outbound", "sent"].includes(normalized)) return "saliente";
  return "entrante";
}

function getFallbackBody(type: string | null) {
  const normalized = (type ?? "").toLowerCase();
  if (["image", "imagen"].includes(normalized)) return "Imagen";
  if (normalized === "audio") return "Audio";
  if (["document", "documento"].includes(normalized)) return "Documento";
  if (normalized === "sticker") return "Sticker";
  return "Mensaje sin texto";
}

export function MessagesList({
  messages,
  lastMessagePreview,
  hasRecentActivity,
  paginate = true,
  showHeader = true,
  fillHeight = false,
  incomingLabel = "Cliente",
  outgoingLabel = "Vendedor",
}: {
  messages: Message[];
  lastMessagePreview?: string | null;
  hasRecentActivity?: boolean;
  paginate?: boolean;
  showHeader?: boolean;
  fillHeight?: boolean;
  incomingLabel?: string;
  outgoingLabel?: string;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(messages.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleMessages = paginate
    ? messages.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : messages;

  return (
    <section className={["rounded-md border border-[#E5E7EB] bg-white", fillHeight ? "flex h-full min-h-0 flex-col" : ""].join(" ")}>
      {showHeader ? (
        <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] px-4 py-3">
          <h2 className="text-base font-semibold text-[#111827]">Mensajes</h2>
          {messages.length ? (
            <span className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
              {messages.length} mensajes
            </span>
          ) : null}
        </div>
      ) : null}

      <div className={["space-y-3 overflow-y-auto bg-[#FAFAFA] p-4", fillHeight ? "min-h-0 flex-1" : "max-h-[74vh]"].join(" ")}>
        {messages.length ? (
          visibleMessages.map((message) => {
            const isOutgoing = getDirection(message) === "saliente";
            const senderLabel = isOutgoing ? outgoingLabel : incomingLabel;
            const body = message.body?.trim() || getFallbackBody(message.message_type ?? message.tipo ?? null);

            return (
              <article
                key={message.id}
                className={["flex", isOutgoing ? "justify-end" : "justify-start"].join(" ")}
              >
                <div
                  className={[
                    "max-w-[82%] rounded-md border px-4 py-3",
                    isOutgoing
                      ? "border-[#D8A1B2] bg-[#FDF2F5] text-right"
                      : "border-[#E5E7EB] bg-white text-left",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={[
                      "text-[10px] font-semibold uppercase tracking-[0.14em]",
                      isOutgoing ? "text-[#8A1538]" : "text-[#6B7280]",
                    ].join(" ")}>
                      {senderLabel}
                    </span>
                    <span className="text-xs text-[#6B7280]">
                      {formatDateTime(message.sent_at ?? message.created_at)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#111827]">{body}</p>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-md border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-5 py-8">
            <p className="text-sm font-medium text-[#111827]">
              Todavía no hay mensajes guardados para esta conversación.
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              {hasRecentActivity || lastMessagePreview ? (
                <>La conversación tiene actividad reciente, pero el historial todavía no está disponible.</>
              ) : (
                <>Cuando llegue el primer mensaje sincronizado, se mostrará acá.</>
              )}
            </p>
            {lastMessagePreview ? (
              <p className="mt-3 text-sm text-[#6B7280]">
                Última vista previa: <span className="text-[#111827]">{lastMessagePreview}</span>
              </p>
            ) : null}
          </div>
        )}
      </div>
      {paginate ? (
        <PaginationControls
          page={currentPage}
          totalItems={messages.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      ) : null}
    </section>
  );
}
