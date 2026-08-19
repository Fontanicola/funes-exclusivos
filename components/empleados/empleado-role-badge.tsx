type Role = string | null | undefined;

const roleLabels: Record<string, string> = {
  admin: "Admin",
  vendedor: "Vendedor",
  gestor: "Gestor",
};

export function EmpleadoRoleBadge({ role }: { role: Role }) {
  const normalized = (role ?? "").toLowerCase();
  const label = roleLabels[normalized] ?? role ?? "—";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        normalized === "admin"
          ? "border-slate-200 bg-slate-50 text-slate-700"
          : normalized === "vendedor"
            ? "border-blue-200 bg-blue-50 text-blue-800"
            : "border-amber-200 bg-amber-50 text-amber-800",
      ].join(" ")}
    >
      {label}
    </span>
  );
}
