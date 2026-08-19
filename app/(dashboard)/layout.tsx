import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import { canAccessRoute } from "@/lib/auth/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { BreadcrumbHeader } from "@/components/dashboard/breadcrumb-header";
import { SectionSubheader } from "@/components/dashboard/section-subheader";
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
    const pathname = resolvePathname();

    return (
      <div className="h-dvh overflow-hidden bg-white text-[#111827]">
        <div className="flex h-dvh min-h-0">
          <Sidebar employee={mockEmpleado} />
            <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <BreadcrumbHeader pathname={pathname} />
            <SectionSubheader employee={mockEmpleado} />
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-4">{children}</div>
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
    <div className="h-dvh overflow-hidden bg-white text-[#111827]">
      <div className="flex h-dvh min-h-0">
        <Sidebar employee={employee} />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <BreadcrumbHeader pathname={pathname} />
          <SectionSubheader employee={employee} />
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
