"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeDollarSign,
  Banknote,
  Bell,
  ClipboardCheck,
  FileText,
  Grid2X2,
  LayoutDashboard,
  MessageCircle,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import { canAccessRoute } from "@/lib/auth/permissions";
import { UserMenu } from "./user-menu";

type Employee = {
  email: string;
  nombre: string | null;
  rol: string | null;
};

type NavigationGroup = {
  label: string;
  icon: typeof LayoutDashboard;
  items: Array<{
    label: string;
    href: string;
    icon: typeof LayoutDashboard;
  }>;
};

const primaryNavigation = {
  label: "Dashboard",
  href: "/dashboard",
  icon: LayoutDashboard,
};

const navigation: NavigationGroup[] = [
  {
    label: "Operación",
    icon: LayoutDashboard,
    items: [
      { label: "Inventario", href: "/inventario", icon: Package },
      { label: "Peritajes", href: "/peritajes", icon: ClipboardCheck },
      { label: "Compras", href: "/compras", icon: BadgeDollarSign },
      { label: "Ventas", href: "/ventas", icon: ShoppingCart },
      { label: "Caja", href: "/caja", icon: Banknote },
    ],
  },
  {
    label: "Comercial",
    icon: MessageCircle,
    items: [
      { label: "CRM", href: "/crm", icon: Users },
      { label: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
      { label: "Catálogo", href: "/dashboard/catalogo", icon: Grid2X2 },
      { label: "Recordatorios", href: "/recordatorios", icon: Bell },
    ],
  },
  {
    label: "Administración",
    icon: Settings,
    items: [
      { label: "Comisiones", href: "/comisiones", icon: BadgeDollarSign },
      { label: "Gestoría", href: "/gestoria", icon: FileText },
      { label: "Empleados", href: "/empleados", icon: Users },
      { label: "Configuración", href: "/configuracion", icon: Settings },
    ],
  },
];

const EXPANDED_WIDTH = "240px";
const COLLAPSED_WIDTH = "72px";

export function Sidebar({ employee }: { employee: Employee }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const collapsed = !expanded;

  const visibleNavigation = useMemo(
    () =>
      navigation
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => canAccessRoute(employee.rol, item.href)),
        }))
        .filter((group) => group.items.length > 0),
    [employee.rol]
  );
  const showPrimaryNavigation = canAccessRoute(employee.rol, primaryNavigation.href);

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocusCapture={() => setExpanded(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setExpanded(false);
        }
      }}
      className={[
        "z-30 flex h-full shrink-0 flex-col border-r border-[#E5E7EB] bg-white px-2 py-3 text-[#111827] transition-[width] duration-200 ease-out sm:px-3",
        collapsed ? "w-[72px]" : "w-[240px]",
      ].join(" ")}
      style={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
    >
      <div className={["flex items-center pb-3", collapsed ? "justify-center px-0" : "px-1"].join(" ")}>
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center pl-1">
            <Image
              src="/logo-funes.svg"
              alt="Funes Exclusivos"
              width={158}
              height={55}
              priority
              className="h-9 w-auto"
            />
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center"
            aria-label="Funes Exclusivos"
            title="Funes Exclusivos"
          >
            <Image
              src="/logo-funes.svg"
              alt=""
              width={54}
              height={19}
              priority
              className="h-auto w-[42px] sm:w-[44px]"
            />
          </Link>
        )}
      </div>

      <nav className={["flex-1 overflow-y-auto pr-1", collapsed ? "space-y-1" : "space-y-3"].join(" ")}>
        {showPrimaryNavigation ? (
          <div className={collapsed ? "space-y-1" : "border-b border-[#E5E7EB] pb-3"}>
            {(() => {
              const Icon = primaryNavigation.icon;
              const active = pathname === primaryNavigation.href;

              return (
                <Link
                  href={primaryNavigation.href}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? primaryNavigation.label : undefined}
                  className={[
                    "group relative flex items-center rounded-md border py-2 text-sm font-medium transition",
                    collapsed ? "justify-center px-2" : "gap-3 px-3",
                    active
                      ? "border-[#D8A1B2] bg-[#FDF2F5] text-[#7A1230]"
                      : "border-transparent text-[#64748B] hover:border-[#E5E7EB] hover:bg-[#FAFAFA] hover:text-[#111827]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-[#8A1538] transition-opacity",
                      active ? "opacity-100" : "opacity-0 group-hover:opacity-30",
                    ].join(" ")}
                  />
                  <Icon
                    className={[
                      "h-4 w-4 shrink-0 transition",
                      active ? "text-[#8A1538]" : "text-[#94A3B8] group-hover:text-[#64748B]",
                    ].join(" ")}
                  />
                  {!collapsed ? <span className="truncate">{primaryNavigation.label}</span> : null}
                </Link>
              );
            })()}
          </div>
        ) : null}

        {visibleNavigation.map((group) => {
          const GroupIcon = group.icon;
          const groupHref = group.items[0]?.href ?? "/dashboard";
          const groupActive = group.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

          return (
          <Link
            key={group.label}
            href={groupHref}
            aria-current={groupActive ? "page" : undefined}
            title={collapsed ? group.label : undefined}
            className={[
              "group relative flex items-center rounded-md border py-2 text-sm font-medium transition",
              collapsed ? "justify-center px-2" : "gap-3 px-3",
              groupActive
                ? "border-[#D8A1B2] bg-[#FDF2F5] text-[#7A1230]"
                : "border-transparent text-[#64748B] hover:border-[#E5E7EB] hover:bg-[#FAFAFA] hover:text-[#111827]",
            ].join(" ")}
          >
            <span className={["absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-[#8A1538] transition-opacity", groupActive ? "opacity-100" : "opacity-0 group-hover:opacity-30"].join(" ")} />
            <GroupIcon className={["h-4 w-4 shrink-0 transition", groupActive ? "text-[#8A1538]" : "text-[#94A3B8] group-hover:text-[#64748B]"].join(" ")} />
            {!collapsed ? <span className="truncate">{group.label}</span> : null}
          </Link>
        );
        })}
      </nav>

      <div className="pt-4">
        <UserMenu employee={employee} collapsed={collapsed} />
      </div>
    </aside>
  );
}
