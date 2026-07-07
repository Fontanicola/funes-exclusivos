export function EmpleadoStatusBadge({ active }: { active: boolean | null | undefined }) {
  const isActive = active === true;

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        isActive
          ? "border-[#E5E7EB] bg-[#FAFAFA] text-[#111827]"
          : "border-[#E5E7EB] bg-white text-[#6B7280]",
      ].join(" ")}
    >
      {isActive ? "Activo" : "Inactivo"}
    </span>
  );
}
