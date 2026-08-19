export function EmpleadoStatusBadge({ active }: { active: boolean | null | undefined }) {
  const isActive = active === true;

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-rose-200 bg-rose-50 text-rose-800",
      ].join(" ")}
    >
      {isActive ? "Activo" : "Inactivo"}
    </span>
  );
}
