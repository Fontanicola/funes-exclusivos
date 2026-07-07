"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgePercent,
  Banknote,
  BadgeDollarSign,
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
import { UserMenu } from "./user-menu";

type Employee = {
  email: string;
  nombre: string | null;
  rol: string | null;
};

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Inventario", href: "/inventario", icon: Package },
  { label: "Compras", href: "/compras", icon: BadgeDollarSign },
  { label: "Ventas", href: "/ventas", icon: ShoppingCart },
  { label: "Caja", href: "/caja", icon: Banknote },
  { label: "Comisiones", href: "/comisiones", icon: BadgePercent },
  { label: "Gestoría", href: "/gestoria", icon: FileText },
  { label: "Catálogo", href: "/catalogo", icon: Grid2X2 },
  { label: "CRM", href: "/crm", icon: Users },
  { label: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
  { label: "Empleados", href: "/empleados", icon: Users },
  { label: "Configuración", href: "/configuracion", icon: Settings },
];

const STORAGE_KEY = "funes-sidebar-collapsed";
const EXPANDED_WIDTH = "240px";
const COLLAPSED_WIDTH = "72px";

export function Sidebar({ employee }: { employee: Employee }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(STORAGE_KEY) === "true";
  });

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH
    );
    window.localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  return (
    <aside
      className={[
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-[#E5E7EB] bg-[#FAFAFA] px-4 py-4 text-[#111827] transition-[width] duration-200 relative",
        collapsed ? "w-[72px]" : "w-[240px]",
      ].join(" ")}
    >
      <div
        className={[
          "mb-6 flex items-center",
          collapsed ? "justify-center" : "justify-between gap-3",
        ].join(" ")}
      >
        {collapsed ? null : (
          <Link href="/dashboard" className="flex items-center pl-2">
            <Image
              src="/logo-funes.svg"
              alt="Funes Exclusivos"
              width={140}
              height={49}
              priority
              className="h-9 w-auto"
            />
          </Link>
        )}

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="inline-flex h-8 w-8 items-center justify-center text-[#6B7280] transition hover:text-[#111827]"
          aria-label={collapsed ? "Expandir sidebar" : "Cerrar sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={[
                "flex items-center rounded-xl border py-2 text-sm font-medium transition",
                collapsed ? "justify-center px-2" : "gap-3 px-3",
                active
                  ? "border-[#E5E7EB] bg-white text-[#111827]"
                  : "border-transparent text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]",
              ].join(" ")}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>{item.label}</span> : null}
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
