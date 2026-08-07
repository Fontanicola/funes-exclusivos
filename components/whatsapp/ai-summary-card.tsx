type Conversation = {
  ia_estado: string | null;
  ia_resumen: string | null;
  ia_score: number | null;
  ia_procesado_at: string | null;
  ia_error: string | null;
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

function getStatusLabel(status: string | null) {
  switch ((status ?? "").toLowerCase()) {
    case "procesado":
      return "Procesado";
    case "pendiente":
      return "Pendiente";
    case "error":
      return "Error";
    case "en_proceso":
      return "En proceso";
    default:
      return "Sin resumen";
  }
}

export function AiSummaryCard({ conversation }: { conversation: Conversation }) {
  return (
    <section className="rounded-md border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#111827]">Resumen IA</h3>
          <p className="mt-1 text-sm text-[#6B7280]">Lectura generada automáticamente desde el historial de mensajes.</p>
        </div>
        <span className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
          {getStatusLabel(conversation.ia_estado)}
        </span>
      </div>

      <div className="mt-4 rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-3">
        <p className="text-sm leading-6 text-[#111827]">
          {conversation.ia_resumen ?? "Todavía no se generó resumen IA."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#6B7280]">
          <span>Score: {conversation.ia_score != null ? `${conversation.ia_score}/100` : "sin score"}</span>
          <span>Procesado: {formatDateTime(conversation.ia_procesado_at)}</span>
        </div>
      </div>

      {conversation.ia_error ? (
        <div className="mt-4 rounded-md border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
          {conversation.ia_error}
        </div>
      ) : null}
    </section>
  );
}
