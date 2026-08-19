import type { Metadata } from "next";
import { isDemoMode } from "@/lib/demo-mode";
import { mockEmpleados, mockWhatsappInstancias } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmpleadosTable } from "@/components/empleados/empleados-table";
import type { WhatsappInstance } from "@/components/whatsapp/whatsapp-instance-card";
import { filterByDateRange, parseDateRange } from "@/lib/date-range";
import { CollapsibleSummary } from "@/components/common/collapsible-summary";
import { DataEntryModal } from "@/components/common/data-entry-modal";
import { SectionSubheaderActions } from "@/components/dashboard/section-subheader-actions";
import { EmpleadoCreateForm } from "@/components/empleados/empleado-create-form";

export const metadata: Metadata = {
  title: "Empleados | Funes Exclusivos",
};

export const dynamic = "force-dynamic";

type EmployeeWhatsappInstance = Omit<WhatsappInstance, "empleado"> & {
  empleado: WhatsappInstance["empleado"] | null;
};

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
    <article className="rounded-md border border-[#E5E7EB] bg-white p-4">
      <p className="text-sm font-medium text-[#6B7280]">{title}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">{value}</p>
      <p className="mt-2 text-xs leading-5 text-[#6B7280]">{description}</p>
    </article>
  );
}

export default async function EmpleadosPage({ searchParams }: { searchParams?: { from?: string; to?: string } }) {
  const dateRange = parseDateRange(searchParams);
  let empleados: Employee[] = mockEmpleados as Employee[];
  let currentUserId: string | null = null;
  const whatsappConnections: Record<string, WhatsappInstance> = {};

  const registerConnections = (instances: EmployeeWhatsappInstance[]) => {
    for (const employee of empleados) {
      const instance = instances.find(
        (candidate) =>
          candidate.empleado_id === employee.id ||
          candidate.empleado?.nombre === employee.nombre
      );
      if (!instance) continue;

      whatsappConnections[employee.id] = {
        ...instance,
        qr_base64: instance.qr_base64 ?? null,
        empleado: {
          id: employee.id,
          nombre: employee.nombre,
          email: employee.email,
          rol: employee.rol,
        },
      };
    }
  };

  registerConnections(mockWhatsappInstancias as unknown as EmployeeWhatsappInstance[]);

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

    const { data: instances } = await supabase
      .from("whatsapp_instancias")
      .select(
        "id,empleado_id,provider,instance_name,estado,telefono_conectado,nombre_perfil,qr_code,qr_base64,qr_expires_at,last_connection_at,last_disconnection_at,last_sync_at,last_error,activo,created_at"
      )
      .eq("activo", true);

    registerConnections(
      ((instances ?? []) as unknown as Array<Omit<EmployeeWhatsappInstance, "empleado">>).map((instance) => ({
        ...instance,
        empleado: null,
      }))
    );
  }

  empleados = filterByDateRange(empleados, dateRange, (employee) => employee.fecha_ingreso ?? employee.created_at);
  const activeEmployees = empleados.filter((employee) => employee.activo === true);
  const admins = activeEmployees.filter((employee) => employee.rol === "admin");
  const sellers = activeEmployees.filter((employee) => employee.rol === "vendedor");
  const managers = activeEmployees.filter((employee) => employee.rol === "gestor");

  return (
    <section className="space-y-6">
      <SectionSubheaderActions>
        <DataEntryModal
          triggerLabel="Nuevo usuario"
          title="Nuevo usuario"
          description="Creá el acceso y asigná el rol operativo dentro de Funes Exclusivos."
          triggerClassName="inline-flex h-8 items-center justify-center rounded-md bg-[#8A1538] px-3 text-xs font-medium text-white transition hover:bg-[#6F102D]"
        >
          <EmpleadoCreateForm />
        </DataEntryModal>
      </SectionSubheaderActions>
      <CollapsibleSummary sectionKey="empleados">
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
      </CollapsibleSummary>

      <EmpleadosTable
        empleados={empleados}
        currentUserId={currentUserId}
        whatsappConnections={whatsappConnections}
      />
    </section>
  );
}
