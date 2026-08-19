type CajaTipo = "ingreso" | "egreso" | string | null | undefined;

export function CajaTipoBadge({ tipo }: { tipo: CajaTipo }) {
  const normalized = (tipo ?? "").toLowerCase();
  const isIngreso = normalized === "ingreso";

  return (
    <span
      className={[
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium",
        isIngreso
          ? "border-[#D1FAE5] bg-[#F0FDF4] text-[#166534]"
          : "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]",
      ].join(" ")}
    >
      {isIngreso ? "Ingreso" : "Egreso"}
    </span>
  );
}
