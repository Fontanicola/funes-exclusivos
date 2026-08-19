type CatalogoStatus = "publicado" | "no_publicado" | "destacado" | string | null | undefined;

export function CatalogoStatusBadge({ status }: { status: CatalogoStatus }) {
  const normalized = (status ?? "").toLowerCase();

  const labels: Record<string, string> = {
    publicado: "Publicado",
    no_publicado: "No publicado",
    destacado: "Destacado",
  };

  const styles: Record<string, string> = {
    publicado: "border-emerald-200 bg-emerald-50 text-emerald-800",
    no_publicado: "border-slate-200 bg-slate-50 text-slate-700",
    destacado: "border-amber-200 bg-amber-50 text-amber-800",
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
