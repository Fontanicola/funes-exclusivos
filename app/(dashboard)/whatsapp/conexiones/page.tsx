import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isDemoMode } from "@/lib/demo-mode";
import { mockWhatsappInstancias } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WhatsappInstanceCreateForm } from "@/components/whatsapp/whatsapp-instance-create-form";
import { WhatsappInstancesGrid } from "@/components/whatsapp/whatsapp-instances-grid";

export const metadata: Metadata = {
  title: "Conexiones WhatsApp | Funes Exclusivos",
};

export const dynamic = "force-dynamic";

type Employee = {
  id: string;
  nombre: string | null;
  email: string | null;
  rol: string | null;
};

type Instance = {
  id: string;
  empleado_id: string | null;
  provider: string | null;
  instance_name: string | null;
  estado: string | null;
  telefono_conectado: string | null;
  nombre_perfil: string | null;
  qr_code: string | null;
  qr_expires_at: string | null;
  last_connection_at: string | null;
  last_disconnection_at: string | null;
  last_sync_at: string | null;
  last_error: string | null;
  activo: boolean | null;
  created_at: string | null;
  empleado: {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
  } | null;
};

type RawInstance = Omit<Instance, "empleado"> & {
  empleado: Instance["empleado"] | Instance["empleado"][] | null;
};

function normalizeSingleRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function getEmployeesFromInstances(instances: Instance[]) {
  const employees = new Map<string, Employee>();

  for (const instance of instances) {
    if (instance.empleado) {
      employees.set(instance.empleado.id, instance.empleado);
    }
  }

  return Array.from(employees.values());
}

export default async function WhatsappConnectionsPage() {
  let instancias: Instance[] = mockWhatsappInstancias as Instance[];
  let employees: Employee[] = getEmployeesFromInstances(instancias);
  let canManageAll = true;
  let currentEmployee: Employee | null = null;

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: employee } = user
      ? await supabase
          .from("empleados")
          .select("id,nombre,email,rol,activo")
          .eq("id", user.id)
          .maybeSingle<Employee & { activo: boolean | null }>()
      : { data: null };

    currentEmployee = employee
      ? {
          id: employee.id,
          nombre: employee.nombre,
          email: employee.email,
          rol: employee.rol,
        }
      : null;

    canManageAll = employee?.rol === "admin" && employee.activo === true;

    const [instancesResult, employeesResult] = await Promise.all([
      supabase
        .from("whatsapp_instancias")
        .select(
          "id,empleado_id,provider,instance_name,estado,telefono_conectado,nombre_perfil,qr_code,qr_expires_at,last_connection_at,last_disconnection_at,last_sync_at,last_error,activo,created_at,empleado:empleados!whatsapp_instancias_empleado_id_fkey(id,nombre,email,rol)"
        )
        .eq("activo", true)
        .order("created_at", { ascending: true }),
      supabase
        .from("empleados")
        .select("id,nombre,email,rol")
        .eq("activo", true)
        .in("rol", ["vendedor", "admin"])
        .order("nombre"),
    ]);

    instancias = ((instancesResult.data ?? []) as unknown as RawInstance[]).map((instance) => ({
      ...instance,
      empleado: normalizeSingleRelation(instance.empleado),
    }));

    if (!canManageAll && currentEmployee) {
      const employee = currentEmployee;
      instancias = instancias.filter((instance) => instance.empleado_id === employee.id);
      employees = [
        {
          id: employee.id,
          nombre: employee.nombre,
          email: employee.email,
          rol: employee.rol,
        },
      ];
    } else {
      employees = (employeesResult.data ?? []) as Employee[];
    }
  }

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <Link
          href="/whatsapp"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#111827]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a WhatsApp
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
            Conexiones WhatsApp
          </h1>
          <p className="text-sm leading-6 text-[#6B7280]">
            QR e instancias Evolution API por vendedor
          </p>
        </div>
        <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
          Si el QR no aparece o vence, usá Refrescar QR.
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-6 xl:self-start">
          <WhatsappInstanceCreateForm employees={employees} />
          {!canManageAll && currentEmployee ? (
            <p className="mt-3 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-xs leading-5 text-[#6B7280]">
              Estás viendo solo tu instancia. La conexión se crea y administra para {currentEmployee.nombre ?? currentEmployee.email ?? "tu usuario"}.
            </p>
          ) : null}
        </aside>

        <WhatsappInstancesGrid instancias={instancias} canManageAll={canManageAll} />
      </div>
    </section>
  );
}
