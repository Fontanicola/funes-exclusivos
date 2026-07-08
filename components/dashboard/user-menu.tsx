"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { logout } from "@/app/(dashboard)/actions";
import { getRoleLabel } from "@/lib/auth/permissions";

type Employee = {
  email: string;
  nombre: string | null;
  rol: string | null;
};

function getInitials(nombre: string | null, email: string) {
  if (nombre) {
    const parts = nombre.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return `${first}${last}`.toUpperCase();
  }

  return email.slice(0, 2).toUpperCase();
}

export function UserMenu({
  employee,
  collapsed = false,
}: {
  employee: Employee;
  collapsed?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const initials = getInitials(employee.nombre, employee.email);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={[
          "w-full cursor-pointer rounded-[22px] border border-transparent bg-transparent py-2 transition hover:border-[#E5E7EB] hover:bg-white",
          collapsed ? "px-2" : "px-3",
        ].join(" ")}
      >
        <div className={collapsed ? "flex items-center justify-center" : "flex items-center gap-3"}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] text-sm font-semibold text-[#111827]">
            {initials}
          </div>
          {!collapsed ? (
            <>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium text-[#111827]">
                  {employee.nombre ?? employee.email}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="truncate text-xs text-[#6B7280]">{employee.email}</p>
                  <span className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                    {getRoleLabel(employee.rol)}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={[
                  "h-4 w-4 shrink-0 text-[#6B7280] transition",
                  open ? "rotate-180" : "",
                ].join(" ")}
              />
            </>
          ) : null}
        </div>

      </button>

      {open ? (
        <div
          className={[
            "absolute bottom-[calc(100%+0.75rem)] left-0 w-full rounded-[24px] border border-[#E5E7EB] bg-white/95 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur",
            collapsed ? "min-w-[220px]" : "",
          ].join(" ")}
        >
          <div className="space-y-1 border-b border-[#E5E7EB] pb-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">
              Sesión activa
            </p>
            <p className="text-sm font-medium text-[#111827]">
              {employee.nombre ?? employee.email}
            </p>
            <p className="text-xs text-[#6B7280]">{employee.email}</p>
            <span className="inline-flex rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
              {getRoleLabel(employee.rol)}
            </span>
          </div>

          <form action={logout} className="pt-3">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              <LogOut className="h-4 w-4 text-[#6B7280]" />
              Cerrar sesión
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
