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
          ? "border-[#E5E7EB] bg-[#FAFAFA] text-[#111827]"
          : "border-[#E5E7EB] bg-white text-[#111827]",
      ].join(" ")}
    >
      {label}
    </span>
  );
}
