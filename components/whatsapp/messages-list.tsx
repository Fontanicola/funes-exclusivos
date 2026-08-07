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

function getTypeLabel(type: string | null) {
  const normalized = (type ?? "").toLowerCase();
  if (!normalized || ["text", "texto"].includes(normalized)) return "Texto";
  if (["image", "imagen"].includes(normalized)) return "Imagen";
  if (normalized === "audio") return "Audio";
  if (["document", "documento"].includes(normalized)) return "Documento";
  if (normalized === "sticker") return "Sticker";
  if (normalized === "video") return "Video";
  return "Mensaje";
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
}: {
  messages: Message[];
  lastMessagePreview?: string | null;
  hasRecentActivity?: boolean;
}) {
  return (
    <section className="rounded-md border border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">Mensajes</h2>
        </div>
        {messages.length ? (
          <span className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
            {messages.length} mensajes
          </span>
        ) : null}
      </div>

      <div className="max-h-[74vh] space-y-3 overflow-y-auto bg-[#FAFAFA] p-4">
        {messages.length ? (
          messages.map((message) => {
            const isOutgoing = getDirection(message) === "saliente";
            const typeLabel = getTypeLabel(message.message_type ?? message.tipo ?? null);
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
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                      {typeLabel}
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
    </section>
  );
}
