import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import { mockEmpleado, mockVehiculos } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildDemoPeritaje, DEMO_PERITAJE_SECTIONS } from "@/lib/peritajes/demo";
import { DEFAULT_PERITAJE_PANELS, type PeritajeRecord, type PeritajeTemplateSection, type PeritajeVehicle } from "@/lib/peritajes/types";
import { PeritajeCreateForm } from "@/components/peritajes/peritaje-create-form";
import { PeritajeWorkspace } from "@/components/peritajes/peritaje-workspace";

export const dynamic = "force-dynamic";

type PageProps = { params: { id: string } };

function vehicleTitle(vehicle: PeritajeVehicle) {
  return [vehicle.marca, vehicle.modelo, vehicle.version].filter(Boolean).join(" ") || "Vehículo";
}

async function loadPeritaje(id: string) {
  if (isDemoMode) {
    const vehicle = mockVehiculos.find((item) => item.id === id);
    if (!vehicle) return null;
    const typedVehicle = vehicle as unknown as PeritajeVehicle;
    return { vehicle: typedVehicle, peritaje: buildDemoPeritaje(typedVehicle), sections: DEMO_PERITAJE_SECTIONS, canEdit: mockEmpleado.rol === "admin" || mockEmpleado.rol === "gestor", demo: true };
  }

  const supabase = createSupabaseServerClient();
  const [{ data: vehicle }, { data: latest }] = await Promise.all([
    supabase.from("vehiculos").select("id,marca,modelo,version,anio,color,dominio,km,fotos").eq("id", id).maybeSingle(),
    supabase.from("peritajes").select("id,vehiculo_id,plantilla_id,estado,fecha_peritaje,cliente_nombre,cliente_telefono,datos_generales,equipamiento,observaciones,gasto_total,moneda,valor_mercado,valor_sitio_1,valor_sitio_2,valor_tasado,created_at,updated_at").eq("vehiculo_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const { data: { user } } = await supabase.auth.getUser();
  const { data: employee } = user
    ? await supabase.from("empleados").select("id,rol,activo").eq("id", user.id).maybeSingle()
    : { data: null };
  if (!vehicle || !employee || employee.activo === false) return null;
  const canEdit = employee.rol === "admin" || employee.rol === "gestor";
  if (!latest) return { vehicle: vehicle as PeritajeVehicle, peritaje: null, sections: [], canEdit, demo: false };

  const [{ data: items }, { data: panels }, { data: repairs }, { data: sections }] = await Promise.all([
    supabase.from("peritaje_items").select("id,codigo,nombre,seccion,tipo,estado,valor,nota,orden").eq("peritaje_id", latest.id).order("orden"),
    supabase.from("peritaje_paneles").select("id,codigo,nombre,estado,nota,orden").eq("peritaje_id", latest.id).order("orden"),
    supabase.from("peritaje_reparaciones").select("id,orden,descripcion,monto,moneda,estado").eq("peritaje_id", latest.id).order("orden"),
    latest.plantilla_id ? supabase.from("peritaje_plantilla_secciones").select("id,plantilla_id,nombre,descripcion,orden,items:peritaje_plantilla_items(id,seccion_id,codigo,nombre,tipo,opciones,orden,requerido)").eq("plantilla_id", latest.plantilla_id).eq("activo", true).order("orden") : { data: [] },
  ]);

  const panelMap = new Map((panels ?? []).map((panel) => [panel.codigo, panel]));
  const normalizedPanels = DEFAULT_PERITAJE_PANELS.map((panel) => panelMap.get(panel.codigo) ?? { ...panel, estado: "pendiente", nota: null });
  return { vehicle: vehicle as PeritajeVehicle, peritaje: { ...latest, datos_generales: latest.datos_generales ?? {}, equipamiento: latest.equipamiento ?? {}, items: items ?? [], paneles: normalizedPanels, reparaciones: repairs ?? [] } as unknown as PeritajeRecord, sections: (sections ?? []) as unknown as PeritajeTemplateSection[], canEdit, demo: false };
}

export default async function VehiclePeritajePage({ params }: PageProps) {
  const data = await loadPeritaje(params.id);
  if (!data) notFound();

  return <section className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><Link href={`/inventario/${params.id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft className="h-4 w-4" />Volver al vehículo</Link><h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Peritaje · {vehicleTitle(data.vehicle)}</h1><p className="mt-1 text-sm text-slate-500">Checklist, paneles, observaciones y valoración.</p></div>
    </div>
    {data.peritaje ? <PeritajeWorkspace vehicle={data.vehicle} peritaje={data.peritaje} sections={data.demo ? DEMO_PERITAJE_SECTIONS : data.sections} readOnly={!data.canEdit} demo={data.demo} /> : data.canEdit ? <PeritajeCreateForm vehiculoId={params.id} /> : <div className="rounded-md border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">Todavía no hay un peritaje para este vehículo.</div>}
  </section>;
}
