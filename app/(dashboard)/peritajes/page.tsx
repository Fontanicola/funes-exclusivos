import Link from "next/link";
import { ClipboardCheck, Settings2 } from "lucide-react";
import { isDemoMode } from "@/lib/demo-mode";
import { mockEmpleado, mockVehiculos } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

type VehicleRow = {
  id: string;
  marca: string | null;
  modelo: string | null;
  version?: string | null;
  anio: number | null;
  dominio: string | null;
  estado?: string | null;
  peritajes?: Array<{ id: string; estado: string; fecha_peritaje: string }>;
};

function vehicleName(vehicle: VehicleRow) {
  return [vehicle.marca, vehicle.modelo, vehicle.version].filter(Boolean).join(" ") || "Vehículo sin identificar";
}

export default async function PeritajesPage() {
  let role = isDemoMode ? mockEmpleado.rol : null;
  let vehicles: VehicleRow[] = [];

  if (isDemoMode) {
    vehicles = mockVehiculos.slice(0, 10).map((vehicle) => ({
      id: vehicle.id,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      version: vehicle.version,
      anio: vehicle.anio,
      dominio: vehicle.dominio,
      estado: vehicle.estado,
    }));
  } else {
    const supabase = createSupabaseServerClient();
    const [{ data, error }] = await Promise.all([
      supabase.from("vehiculos").select("id,marca,modelo,version,anio,dominio,estado").order("created_at", { ascending: false }).limit(100),
    ]);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: employee } = user
      ? await supabase.from("empleados").select("rol").eq("id", user.id).maybeSingle()
      : { data: null };
    if (!error) vehicles = (data ?? []) as unknown as VehicleRow[];
    if (employee) role = employee.rol;
  }

  const canManage = isAdmin(role);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Operación</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Peritajes</h1>
          <p className="mt-1 text-sm text-slate-500">Revisión visual, checklist y valoración de cada vehículo.</p>
        </div>
        {canManage ? <Link href="/peritajes/plantillas" className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"><Settings2 className="h-4 w-4" />Administrar plantillas</Link> : null}
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3"><ClipboardCheck className="h-4 w-4 text-[#8A1538]" /><p className="text-sm font-semibold text-slate-900">Vehículos para revisar</p><span className="text-xs text-slate-500">{vehicles.length} unidades</span></div>
        {vehicles.length === 0 ? <div className="px-4 py-12 text-center text-sm text-slate-500">No hay vehículos disponibles para iniciar un peritaje.</div> : (
          <div className="divide-y divide-slate-100">
            {vehicles.map((vehicle) => {
              const latest = vehicle.peritajes?.[0];
              return <Link key={vehicle.id} href={`/inventario/${vehicle.id}/peritaje`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 transition hover:bg-slate-50"><div><p className="text-sm font-semibold text-slate-900">{vehicleName(vehicle)}</p><p className="mt-1 text-xs text-slate-500">{[vehicle.dominio, vehicle.anio, vehicle.estado].filter(Boolean).join(" · ") || "Sin datos adicionales"}</p></div><div className="flex items-center gap-3 text-xs text-slate-500">{latest ? <span className="rounded-full border border-slate-200 px-2.5 py-1">{latest.estado === "completado" ? "Completado" : "En curso"}</span> : <span>Sin peritaje</span>}<span className="font-medium text-[#8A1538]">Abrir</span></div></Link>;
            })}
          </div>
        )}
      </div>
    </section>
  );
}
