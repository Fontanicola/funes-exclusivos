type Message = {
  id: string;
  conversacion_id: string | null;
  external_message_id?: string | null;
  direccion?: string | null;
  from_number?: string | null;
  to_number?: string | null;
  body: string | null;
  message_type?: string | null;
  tipo?: string | null;
  direction?: string | null;
  from_me?: boolean | null;
  sent_at: string | null;
  created_at: string | null;
  created_by: {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
  } | null;
};

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

function getMessageDirection(message: Message) {
  const direction = (message.direccion ?? message.direction ?? "").toLowerCase();
  if (!direction && typeof message.from_me === "boolean") {
    return message.from_me ? "saliente" : "entrante";
  }
  if (direction === "saliente" || direction === "outbound") return "saliente";
  if (direction === "entrante" || direction === "inbound") return "entrante";
  return "entrante";
}

function getMessageTypeLabel(messageType: string | null) {
  const value = (messageType ?? "").toLowerCase();
  if (!value || value === "texto" || value === "text") return "Texto";
  if (value === "image" || value === "imagen") return "Imagen";
  if (value === "audio") return "Audio";
  if (value === "document" || value === "documento") return "Documento";
  if (value === "sticker") return "Sticker";
  return messageType ?? "Mensaje";
}

function getAuthorName(message: Message) {
  return message.created_by?.nombre ?? message.created_by?.email ?? "Sistema";
}

export function ConversacionMessages({ messages }: { messages: Message[] }) {
  if (!messages.length) {
    return (
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-6 text-sm text-[#6B7280]">
          Todavía no hay mensajes en esta conversación.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="space-y-1 border-b border-[#E5E7EB] pb-4">
        <h2 className="text-base font-semibold text-[#111827]">Mensajes</h2>
        <p className="text-sm text-[#6B7280]">Historial cronológico sincronizado por webhook.</p>
      </div>

      <div className="mt-4 space-y-4">
        {messages.map((message) => {
          const isOutgoing = getMessageDirection(message) === "saliente";
          const fallbackBody = message.body?.trim() || getMessageTypeLabel(message.message_type ?? message.tipo ?? null);

          return (
            <article
              key={message.id}
              className={[
                "flex",
                isOutgoing ? "justify-end" : "justify-start",
              ].join(" ")}
            >
              <div
                className={[
                  "max-w-[78%] rounded-2xl border px-4 py-3 shadow-sm",
                  isOutgoing
                    ? "border-[#E5E7EB] bg-[#F9FAFB] text-right"
                    : "border-[#E5E7EB] bg-white text-left",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#6B7280]">
                    {getMessageTypeLabel(message.message_type ?? message.tipo ?? null)}
                  </p>
                  <p className="text-xs text-[#6B7280]">{formatDateTime(message.sent_at ?? message.created_at)}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#111827]">{fallbackBody}</p>
                {message.created_by ? (
                  <p className="mt-2 text-xs text-[#6B7280]">{getAuthorName(message)}</p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
