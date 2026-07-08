import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import { canAccessRoute } from "@/lib/auth/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { mockEmpleado } from "@/lib/mock-data";

type Employee = {
  id: string;
  email: string;
  nombre: string | null;
  rol: string | null;
  activo: boolean | null;
};

function resolvePathname() {
  const headerStore = headers();
  const rawPathname =
    headerStore.get("x-pathname") ??
    headerStore.get("x-next-pathname") ??
    headerStore.get("x-invoke-path") ??
    headerStore.get("x-matched-path") ??
    headerStore.get("next-url");

  if (!rawPathname) return null;

  try {
    return new URL(rawPathname, "http://localhost").pathname;
  } catch {
    return rawPathname.startsWith("/") ? rawPathname : null;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (isDemoMode) {
    return (
      <div className="min-h-screen bg-white text-[#111827]">
        <div className="flex min-h-screen">
          <Sidebar employee={mockEmpleado} />
          <main className="min-w-0 flex-1">
            <div className="px-6 py-5">{children}</div>
          </main>
        </div>
      </div>
    );
  }

  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!hasSupabaseConfig) {
    redirect("/login?error=config");
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: employee } = await supabase
    .from("empleados")
    .select("id,email,nombre,rol,activo")
    .eq("id", user.id)
    .maybeSingle<Employee>();

  if (!employee || employee.activo !== true) {
    redirect("/login?error=inactive");
  }

  const pathname = resolvePathname();
  if (pathname && !canAccessRoute(employee.rol, pathname)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <div className="flex min-h-screen">
        <Sidebar employee={employee} />
        <main className="min-w-0 flex-1">
        <div className="px-6 py-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
