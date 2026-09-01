"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeDollarSign,
  Banknote,
  Bell,
  Boxes,
  ClipboardCheck,
  FileText,
  Grid2X2,
  MessageCircle,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import { canAccessRoute } from "@/lib/auth/permissions";

type Employee = { rol: string | null };

const sections = [
  {
    label: "Operación",
    items: [
      { label: "Inventario", href: "/inventario", icon: Boxes },
      { label: "Peritajes", href: "/peritajes", icon: ClipboardCheck },
      { label: "Compras", href: "/compras", icon: BadgeDollarSign },
      { label: "Ventas", href: "/ventas", icon: ShoppingCart },
      { label: "Caja", href: "/caja", icon: Banknote },
      { label: "Cobros", href: "/caja?tipo=ingreso", icon: Banknote },
    ],
  },
  {
    label: "Comercial",
    items: [
      { label: "CRM", href: "/crm", icon: Users },
      { label: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
      { label: "Catálogo", href: "/dashboard/catalogo", icon: Grid2X2 },
      { label: "Recordatorios", href: "/recordatorios", icon: Bell },
    ],
  },
  {
    label: "Administración",
    items: [
      { label: "Comisiones", href: "/comisiones", icon: BadgeDollarSign },
      { label: "Gestoría", href: "/gestoria", icon: FileText },
      { label: "Empleados", href: "/empleados", icon: Users },
      { label: "Configuración", href: "/configuracion", icon: Settings },
    ],
  },
] as const;

function matches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SectionSubheader({ employee }: { employee: Employee }) {
  const pathname = usePathname();
  const section = sections.find((candidate) =>
    candidate.items.some((item) => matches(pathname, item.href))
  );

  if (!section) return null;

  const items = section.items.filter((item) => canAccessRoute(employee.rol, item.href));
  if (items.length === 0) return null;

  return (
    <nav
      aria-label={`Secciones de ${section.label}`}
      className="border-b border-[#E5E7EB] bg-white px-3 sm:px-5"
    >
      <div className="flex min-w-0 items-center gap-2 py-1.5 sm:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          <span className="mr-2 shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">
            {section.label}
          </span>
          {items.map((item) => {
            const active = matches(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "inline-flex h-8 shrink-0 items-center gap-2 rounded-md border px-3 text-xs font-medium transition",
                  active
                    ? "border-[#D8A1B2] bg-[#FDF2F5] text-[#8A1538]"
                    : "border-transparent text-[#64748B] hover:border-[#E5E7EB] hover:bg-[#FAFAFA] hover:text-[#111827]",
                ].join(" ")}
              >
                <Icon className={active ? "h-3.5 w-3.5 text-[#8A1538]" : "h-3.5 w-3.5 text-[#94A3B8]"} />
                {item.label}
              </Link>
            );
          })}
        </div>
        <div id="section-subheader-actions" className="flex shrink-0 items-center gap-2" />
      </div>
    </nav>
  );
}
