type CajaTipo = "ingreso" | "egreso" | string | null | undefined;

export function CajaTipoBadge({ tipo }: { tipo: CajaTipo }) {
  const normalized = (tipo ?? "").toLowerCase();
  const isIngreso = normalized === "ingreso";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        isIngreso
          ? "border-[#D1FAE5] bg-[#F0FDF4] text-[#166534]"
          : "border-[#E5E7EB] bg-[#FAFAFA] text-[#111827]",
      ].join(" ")}
    >
      {isIngreso ? "Ingreso" : "Egreso"}
    </span>
  );
}
