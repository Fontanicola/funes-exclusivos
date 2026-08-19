import Link from "next/link";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import { mockEmpleado } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PeritajeTemplateManager } from "@/components/peritajes/peritaje-template-manager";
import type { PeritajeTemplate } from "@/lib/peritajes/types";

export const dynamic = "force-dynamic";

export default async function PeritajeTemplatesPage() {
  if (isDemoMode) {
    if (mockEmpleado.rol !== "admin") notFound();
    return <TemplatePage templates={[]} />;
  }

  const supabase = createSupabaseServerClient();
  const [{ data: { user } }, { data: templates, error }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("peritaje_plantillas").select("id,nombre,descripcion,activo,secciones:peritaje_plantilla_secciones(id,plantilla_id,nombre,descripcion,orden,activo,items:peritaje_plantilla_items(id,seccion_id,codigo,nombre,tipo,opciones,orden,requerido,activo))").eq("activo", true).order("created_at", { ascending: true }),
  ]);
  if (!user || error) return <TemplatePage templates={[]} error={error?.message} />;
  const { data: employee } = await supabase.from("empleados").select("rol,activo").eq("id", user.id).maybeSingle();
  if (!employee || employee.activo === false || String(employee.rol).toLowerCase() !== "admin") notFound();
  return <TemplatePage templates={(templates ?? []) as unknown as PeritajeTemplate[]} />;
}

function TemplatePage({ templates, error }: { templates: PeritajeTemplate[]; error?: string }) {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/peritajes" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft className="h-4 w-4" />Volver a peritajes</Link>
          <div className="mt-3 flex items-center gap-3"><div className="rounded-md bg-rose-50 p-2 text-[#8A1538]"><ClipboardCheck className="h-5 w-5" /></div><div><h1 className="text-2xl font-semibold tracking-tight text-slate-900">Plantillas de peritaje</h1><p className="mt-1 text-sm text-slate-500">Administrá secciones e ítems que se usan en las inspecciones.</p></div></div>
        </div>
      </div>
      {error ? <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">No pudimos cargar las plantillas. Ejecutá `PERITAJES.sql` en Supabase y volvé a intentar.</p> : null}
      <PeritajeTemplateManager templates={templates} />
    </section>
  );
}
