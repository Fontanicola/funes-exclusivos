export type UserRole = "admin" | "vendedor" | "gestor" | string | null | undefined;

function normalizeRole(role: UserRole) {
  return (role ?? "").toLowerCase();
}

function isAdmin(role: UserRole) {
  return normalizeRole(role) === "admin";
}

function isVendedor(role: UserRole) {
  return normalizeRole(role) === "vendedor";
}

function isGestor(role: UserRole) {
  return normalizeRole(role) === "gestor";
}

export function canManageInventory(role: UserRole) {
  return isAdmin(role) || isGestor(role);
}

export function canManageSales(role: UserRole) {
  return isAdmin(role) || isVendedor(role);
}

export function canManageCaja(role: UserRole) {
  return isAdmin(role) || isGestor(role);
}

export function canManageComisiones(role: UserRole) {
  return isAdmin(role);
}

export function canManageGestoria(role: UserRole) {
  return isAdmin(role) || isGestor(role);
}

export function canManageCatalogo(role: UserRole) {
  return isAdmin(role);
}

export function canManageWhatsapp(role: UserRole, isOwner = false) {
  return isAdmin(role) || (isVendedor(role) && isOwner);
}

export function canManageEmpleados(role: UserRole) {
  return isAdmin(role);
}

export function canManageConfiguracion(role: UserRole) {
  return isAdmin(role);
}

export function canAccessRoute(role: UserRole, pathname: string) {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const normalizedRole = normalizeRole(role);

  if (!normalizedRole || normalizedRole === "") {
    return normalizedPath === "/dashboard";
  }

  if (isAdmin(role)) {
    return true;
  }

  const allowed = [
    {
      prefix: "/dashboard/catalogo",
      roles: ["admin"],
    },
    {
      prefix: "/inventario/nuevo",
      roles: ["admin", "gestor"],
    },
    {
      prefix: "/inventario/",
      roles: ["admin", "gestor"],
    },
    {
      prefix: "/inventario",
      roles: ["admin", "vendedor", "gestor"],
    },
    {
      prefix: "/ventas/nueva",
      roles: ["admin", "vendedor"],
    },
    {
      prefix: "/ventas/pendientes-entrega",
      roles: ["admin", "gestor", "vendedor"],
    },
    {
      prefix: "/ventas/renta",
      roles: ["admin", "vendedor", "gestor"],
    },
    {
      prefix: "/ventas",
      roles: ["admin", "vendedor", "gestor"],
    },
    {
      prefix: "/crm/nuevo",
      roles: ["admin", "vendedor"],
    },
    {
      prefix: "/crm/",
      roles: ["admin", "vendedor"],
    },
    {
      prefix: "/crm",
      roles: ["admin", "vendedor"],
    },
    {
      prefix: "/whatsapp/conexiones",
      roles: ["admin", "vendedor"],
    },
    {
      prefix: "/whatsapp/",
      roles: ["admin", "vendedor"],
    },
    {
      prefix: "/whatsapp",
      roles: ["admin", "vendedor"],
    },
    {
      prefix: "/recordatorios",
      roles: ["admin", "vendedor", "gestor"],
    },
    {
      prefix: "/compras/nueva",
      roles: ["admin", "gestor"],
    },
    {
      prefix: "/compras",
      roles: ["admin", "gestor"],
    },
    {
      prefix: "/caja",
      roles: ["admin", "gestor"],
    },
    {
      prefix: "/gestoria/presupuestos/nuevo",
      roles: ["admin", "gestor"],
    },
    {
      prefix: "/gestoria/presupuestos",
      roles: ["admin", "gestor"],
    },
    {
      prefix: "/gestoria/nuevo",
      roles: ["admin", "gestor"],
    },
    {
      prefix: "/gestoria",
      roles: ["admin", "gestor"],
    },
    {
      prefix: "/comisiones/liquidaciones/",
      roles: ["admin"],
    },
    {
      prefix: "/comisiones/liquidaciones",
      roles: ["admin"],
    },
    {
      prefix: "/comisiones",
      roles: ["admin", "vendedor"],
    },
    {
      prefix: "/empleados",
      roles: ["admin"],
    },
    {
      prefix: "/configuracion",
      roles: ["admin"],
    },
    {
      prefix: "/dashboard",
      roles: ["admin", "vendedor", "gestor"],
    },
  ] as const;

  for (const entry of allowed) {
    if (normalizedPath === entry.prefix || normalizedPath.startsWith(entry.prefix)) {
      return entry.roles.some((role) => role === normalizedRole);
    }
  }

  return normalizedPath === "/dashboard";
}

export function getRoleLabel(role: UserRole) {
  const normalized = normalizeRole(role);
  if (normalized === "admin") return "Admin";
  if (normalized === "vendedor") return "Vendedor";
  if (normalized === "gestor") return "Gestor";
  return "Empleado";
}
