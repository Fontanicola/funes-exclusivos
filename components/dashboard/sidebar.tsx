"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeDollarSign,
  Banknote,
  Bell,
  ChevronLeft,
  ChevronRight,
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
  items: Array<{
    label: string;
    href: string;
    icon: typeof LayoutDashboard;
  }>;
};

const navigation: NavigationGroup[] = [
  {
    label: "Operación",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Inventario", href: "/inventario", icon: Package },
      { label: "Compras", href: "/compras", icon: BadgeDollarSign },
      { label: "Ventas", href: "/ventas", icon: ShoppingCart },
      { label: "Caja", href: "/caja", icon: Banknote },
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
];

const STORAGE_KEY = "funes-sidebar-collapsed";
const EXPANDED_WIDTH = "240px";
const COLLAPSED_WIDTH = "72px";

export function Sidebar({ employee }: { employee: Employee }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored != null) {
      setCollapsed(stored === "true");
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-width", collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH);
    window.localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

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

  return (
    <aside
      className={[
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-[#E5E7EB] bg-[linear-gradient(180deg,#FAFAFA_0%,#FFFFFF_100%)] px-3 py-4 text-[#111827] shadow-[0_1px_0_rgba(255,255,255,0.75)_inset] transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-[240px]",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3 px-1 pb-4">
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center pl-1">
            <Image
              src="/logo-funes.svg"
              alt="Funes Exclusivos"
              width={140}
              height={49}
              priority
              className="h-9 w-auto"
            />
          </Link>
        ) : (
          <span className="sr-only">Funes Exclusivos</span>
        )}

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white text-[#6B7280] shadow-sm transition hover:border-[#D1D5DB] hover:text-[#111827] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D1D5DB]"
          aria-label={collapsed ? "Expandir sidebar" : "Cerrar sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto pr-1">
        {visibleNavigation.map((group) => (
          <section key={group.label} className="space-y-2">
            {!collapsed ? (
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">
                {group.label}
              </p>
            ) : null}

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                    className={[
                      "group relative flex items-center rounded-2xl border py-2.5 text-sm font-medium transition",
                      collapsed ? "justify-center px-2" : "gap-3 px-3",
                      active
                        ? "border-[#E5E7EB] bg-white text-[#111827] shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
                        : "border-transparent text-[#6B7280] hover:border-[#E5E7EB] hover:bg-white hover:text-[#111827]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-[#111827] transition-opacity",
                        active ? "opacity-100" : "opacity-0 group-hover:opacity-30",
                      ].join(" ")}
                    />
                    <Icon
                      className={[
                        "h-4 w-4 shrink-0 transition",
                        active ? "text-[#111827]" : "text-[#9CA3AF] group-hover:text-[#6B7280]",
                      ].join(" ")}
                    />
                    {!collapsed ? <span className="truncate">{item.label}</span> : null}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>

      <div className="pt-4">
        <UserMenu employee={employee} collapsed={collapsed} />
      </div>
    </aside>
  );
}
