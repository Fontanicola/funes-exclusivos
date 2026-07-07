type CatalogoStatus = "publicado" | "no_publicado" | "destacado" | string | null | undefined;

export function CatalogoStatusBadge({ status }: { status: CatalogoStatus }) {
  const normalized = (status ?? "").toLowerCase();

  const labels: Record<string, string> = {
    publicado: "Publicado",
    no_publicado: "No publicado",
    destacado: "Destacado",
  };

  const styles: Record<string, string> = {
    publicado: "border-[#E5E7EB] bg-[#F9FAFB] text-[#111827]",
    no_publicado: "border-[#E5E7EB] bg-[#FAFAFA] text-[#6B7280]",
    destacado: "border-[#E5E7EB] bg-[#F3F4F6] text-[#111827]",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        styles[normalized] ?? styles.no_publicado,
      ].join(" ")}
    >
      {labels[normalized] ?? "No publicado"}
    </span>
  );
}
