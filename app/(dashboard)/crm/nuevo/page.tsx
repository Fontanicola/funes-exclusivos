import type { Metadata } from "next";
import Link from "next/link";
import { isDemoMode } from "@/lib/demo-mode";
import { mockEmpleado, mockVehiculos, mockLeads } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LeadForm } from "@/components/crm/lead-form";

export const metadata: Metadata = {
  title: "Nuevo lead | Funes Exclusivos",
};

export const dynamic = "force-dynamic";

type Vehicle = {
  id: string;
  marca: string | null;
  modelo: string | null;
  version: string | null;
  anio: number | null;
  dominio: string | null;
};

type Employee = {
  id: string;
  nombre: string | null;
  email: string | null;
  rol: string | null;
};

export default async function NewLeadPage() {
  let vehicles: Vehicle[] = mockVehiculos.filter((vehicle) => vehicle.estado === "en_stock") as Vehicle[];
  let employees: Employee[] = [mockEmpleado as Employee];

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const [vehiclesResult, employeesResult] = await Promise.all([
      supabase
        .from("vehiculos")
        .select("id,marca,modelo,version,anio,dominio")
        .eq("estado", "en_stock")
        .order("marca")
        .order("modelo"),
      supabase
        .from("empleados")
        .select("id,nombre,email,rol")
        .in("rol", ["vendedor", "admin"])
        .eq("activo", true)
        .order("nombre"),
    ]);

    vehicles = (vehiclesResult.data ?? []) as Vehicle[];
    employees = (employeesResult.data ?? []) as Employee[];
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
            Nuevo lead
          </h1>
          <p className="text-sm leading-6 text-[#6B7280]">
            Cargar contacto y oportunidad comercial
          </p>
        </div>
        {isDemoMode ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
            Modo demo: este formulario no guardará datos reales hasta conectar Supabase.
          </div>
        ) : null}
      </header>

      <div className="flex items-center justify-between">
        <Link href="/crm" className="text-sm font-medium text-[#111827] underline-offset-4 hover:underline">
          Volver al CRM
        </Link>
      </div>

      <LeadForm vehicles={vehicles} employees={employees} />
    </section>
  );
}
