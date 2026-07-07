import type { Metadata } from "next";
import { isDemoMode } from "@/lib/demo-mode";
import { mockEmpleados } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmpleadosTable } from "@/components/empleados/empleados-table";

export const metadata: Metadata = {
  title: "Empleados | Funes Exclusivos",
};

export const dynamic = "force-dynamic";

type Employee = {
  id: string;
  email: string;
  nombre: string | null;
  telefono: string | null;
  avatar_url: string | null;
  rol: string | null;
  activo: boolean | null;
  cargo: string | null;
  fecha_ingreso: string | null;
  comision_default_porcentaje: number | null;
  notas: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function formatCount(value: number) {
  return new Intl.NumberFormat("es-AR").format(value);
}

function KpiCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-[#6B7280]">{title}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">{value}</p>
      <p className="mt-2 text-xs leading-5 text-[#6B7280]">{description}</p>
    </article>
  );
}

export default async function EmpleadosPage() {
  let empleados: Employee[] = mockEmpleados as Employee[];
  let currentUserId: string | null = null;

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("empleados")
      .select(
        "id,email,nombre,telefono,avatar_url,rol,activo,cargo,fecha_ingreso,comision_default_porcentaje,notas,created_at,updated_at"
      )
      .order("rol")
      .order("nombre")
      .order("email");

    empleados = (data ?? []) as Employee[];
    currentUserId = user?.id ?? null;
  }

  const activeEmployees = empleados.filter((employee) => employee.activo === true);
  const admins = activeEmployees.filter((employee) => employee.rol === "admin");
  const sellers = activeEmployees.filter((employee) => employee.rol === "vendedor");
  const managers = activeEmployees.filter((employee) => employee.rol === "gestor");

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">Empleados</h1>
        <p className="max-w-2xl text-sm leading-6 text-[#6B7280]">
          Equipo, roles y permisos operativos.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total empleados activos"
          value={formatCount(activeEmployees.length)}
          description="Usuarios operativos habilitados en el panel."
        />
        <KpiCard
          title="Administradores"
          value={formatCount(admins.length)}
          description="Perfiles con acceso total a la administración."
        />
        <KpiCard
          title="Vendedores"
          value={formatCount(sellers.length)}
          description="Equipo comercial activo."
        />
        <KpiCard
          title="Gestores"
          value={formatCount(managers.length)}
          description="Perfiles de gestoria y documentación."
        />
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
        Los usuarios se crean desde Supabase Auth. Desde esta pantalla se gestiona el perfil operativo.
      </div>

      <EmpleadosTable empleados={empleados} currentUserId={currentUserId} />
    </section>
  );
}
