"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { PeriodFilter } from "./period-filter";
import { NotificationCenter } from "./notification-center";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  inventario: "Inventario",
  nuevo: "Nuevo",
  editar: "Editar",
  compras: "Compras",
  ventas: "Ventas",
  renta: "Rentabilidad",
  "pendientes-entrega": "Pendientes de entrega",
  caja: "Caja",
  comisiones: "Comisiones",
  liquidaciones: "Liquidaciones",
  crm: "CRM",
  gestoria: "Gestoría",
  presupuestos: "Presupuestos",
  whatsapp: "WhatsApp",
  conexiones: "Conexiones",
  empleados: "Empleados",
  configuracion: "Configuración",
  catalogo: "Catálogo",
  recordatorios: "Recordatorios",
};

function labelFor(segment: string) {
  if (/^[0-9a-f-]{16,}$/i.test(segment)) return "Detalle";
  return routeLabels[segment] ?? segment.replaceAll("-", " ");
}

function buildBreadcrumbs(pathname: string | null) {
  const normalized = pathname?.split("?")[0] || "/dashboard";
  const segments = normalized.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ label: "Dashboard", href: "/dashboard", current: true }];
  }

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    return {
      label: labelFor(segment),
      href,
      current: index === segments.length - 1,
    };
  });
}

export function BreadcrumbHeader({ pathname }: { pathname?: string | null }) {
  const currentPathname = usePathname();
  const breadcrumbs = buildBreadcrumbs(currentPathname ?? pathname ?? "/dashboard");

  return (
    <div className="shrink-0 border-b border-[#E5E7EB] bg-white/95 backdrop-blur">
      <div className="flex min-h-10 items-center justify-between gap-2 px-3 sm:gap-3 sm:px-5">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-xs">
          {breadcrumbs.map((item, index) => (
            <div key={`${item.href}-${index}`} className="flex min-w-0 items-center gap-1">
              {index > 0 ? <ChevronRight className="h-3 w-3 shrink-0 text-[#94A3B8]" /> : null}
              {item.current ? (
                <span className="truncate font-medium text-[#111827]">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="truncate text-[#8A1538] underline decoration-[#D8A1B2] underline-offset-4 transition hover:text-[#6F102D]"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-2"><NotificationCenter /><PeriodFilter /></div>
      </div>
    </div>
  );
}
