type Interaction = {
  id: string;
  tipo: string | null;
  titulo: string | null;
  contenido: string | null;
  fecha: string | null;
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
  }).format(date);
}

export function LeadInteractionsTimeline({ interactions }: { interactions: Interaction[] }) {
  if (!interactions.length) {
    return (
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-6 text-sm text-[#6B7280]">
          Todavía no hay interacciones para este lead.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="space-y-1 border-b border-[#E5E7EB] pb-4">
        <h2 className="text-base font-semibold text-[#111827]">Historial</h2>
        <p className="text-sm text-[#6B7280]">Seguimiento cronológico de contactos e ինտeracciones.</p>
      </div>

      <div className="mt-4 space-y-4">
        {interactions.map((interaction, index) => (
          <article key={interaction.id} className="relative pl-6">
            <span className="absolute left-2 top-2 h-full w-px bg-[#E5E7EB]" />
            <span className="absolute left-0 top-2 h-4 w-4 rounded-full border border-[#E5E7EB] bg-white" />
            <div className="space-y-1 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFB] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-[#111827]">
                  {interaction.tipo ?? "Interacción"}
                </p>
                <span className="text-xs text-[#6B7280]">{formatDateTime(interaction.fecha ?? interaction.created_at)}</span>
                {interaction.created_by?.nombre ?? interaction.created_by?.email ? (
                  <span className="text-xs text-[#6B7280]">
                    {interaction.created_by?.nombre ?? interaction.created_by?.email}
                  </span>
                ) : null}
              </div>
              {interaction.titulo ? (
                <p className="text-sm font-medium text-[#111827]">{interaction.titulo}</p>
              ) : null}
              {interaction.contenido ? (
                <p className="text-sm leading-6 text-[#6B7280]">{interaction.contenido}</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
