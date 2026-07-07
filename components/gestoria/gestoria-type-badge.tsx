type GestoriaType = "transferencia" | "cedula" | "titulo" | "verificacion_policial" | "informe_dominio" | "prenda" | "seguro" | "patente" | "otro" | string | null | undefined;

export function GestoriaTypeBadge({ type }: { type: GestoriaType }) {
  const normalized = (type ?? "").toLowerCase();

  const labels: Record<string, string> = {
    transferencia: "Transferencia",
    cedula: "Cédula",
    titulo: "Título",
    verificacion_policial: "Verificación policial",
    informe_dominio: "Informe dominio",
    prenda: "Prenda",
    seguro: "Seguro",
    patente: "Patente",
    otro: "Otro",
  };

  return (
    <span className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2.5 py-1 text-xs font-medium text-[#111827]">
      {labels[normalized] ?? "Otro"}
    </span>
  );
}
