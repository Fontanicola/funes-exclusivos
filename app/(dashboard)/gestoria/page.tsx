import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { isDemoMode } from "@/lib/demo-mode";
import { mockEmpleados, mockGestoriaPresupuestos, mockGestoriaTramites } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAllSupabaseRows } from "@/lib/supabase/paginated";
import { GestoriaKanban } from "@/components/gestoria/gestoria-kanban";
import { filterByDateRange, parseDateRange } from "@/lib/date-range";

export const metadata: Metadata = {
  title: "Gestoría | Funes Exclusivos",
};

export const dynamic = "force-dynamic";

type GestoriaTramite = {
  id: string;
  tipo: string | null;
  estado: string | null;
  titulo: string | null;
  descripcion: string | null;
  cliente_nombre: string | null;
  cliente_telefono: string | null;
  cliente_email: string | null;
  cliente_documento: string | null;
  fecha_inicio: string | null;
  fecha_vencimiento: string | null;
  fecha_finalizacion: string | null;
  etapa?: string | null;
  gestion_tipo?: string | null;
  fecha_envio?: string | null;
  fecha_firma?: string | null;
  costo_final_transferencia?: number | null;
  costo_final_moneda?: string | null;
  presupuesto_confirmado?: boolean | null;
  cat_estado?: string | null;
  cat_fecha?: string | null;
  documentacion_fisica_estado?: string | null;
  documentacion_fisica_fecha?: string | null;
  escribania_estado?: string | null;
  escribania_fecha_retiro?: string | null;
  transferencia_registral_estado?: string | null;
  transferencia_registral_fecha?: string | null;
  retiro_documentacion_cliente_estado?: string | null;
  retiro_documentacion_cliente_fecha?: string | null;
  transferencia_municipal_estado?: string | null;
  transferencia_municipal_fecha?: string | null;
  seguimiento_comentarios?: string | null;
  documentos: string[] | string | null;
  observaciones: string | null;
  created_at: string | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    version: string | null;
    anio: number | null;
    dominio: string | null;
  } | null;
  venta: {
    id: string;
    fecha_venta: string | null;
    cliente_nombre: string | null;
  } | null;
  responsable: {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
  } | null;
  presupuesto?: {
    id: string;
    estado: string | null;
    total: number | null;
    moneda: string | null;
    fecha: string | null;
  } | null;
};

type Employee = {
  id: string;
  nombre: string | null;
  email: string | null;
  rol: string | null;
};

type Presupuesto = {
  id: string;
  tramite_id: string | null;
  estado: string | null;
  total: number | null;
  moneda: string | null;
  fecha: string | null;
};

type RawGestoriaTramite = Omit<GestoriaTramite, "vehiculo" | "venta" | "responsable"> & {
  vehiculo: GestoriaTramite["vehiculo"] | GestoriaTramite["vehiculo"][] | null;
  venta: GestoriaTramite["venta"] | GestoriaTramite["venta"][] | null;
  responsable:
    | GestoriaTramite["responsable"]
    | GestoriaTramite["responsable"][]
    | null;
};

function normalizeSingleRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR").format(date);
}

function isOverdue(tramite: GestoriaTramite) {
  if (!tramite.fecha_vencimiento) return false;

  const due = new Date(`${tramite.fecha_vencimiento}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const status = (tramite.estado ?? "").toLowerCase();
  return due.getTime() < today.getTime() && !["completado", "cancelado"].includes(status);
}

function getKpiTramites(tramites: GestoriaTramite[]) {
  return {
    presupuesto: tramites.filter((tramite) => (tramite.etapa ?? "presupuesto") === "presupuesto").length,
    escribania: tramites.filter((tramite) => (tramite.etapa ?? "") === "escribania").length,
    gestoria: tramites.filter((tramite) => (tramite.etapa ?? "") === "gestoria").length,
    vencidos: tramites.filter(isOverdue).length,
  };
}

function KpiCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-md border border-[#E5E7EB] bg-white p-4">
      <p className="text-sm font-medium text-[#6B7280]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">{value}</p>
    </article>
  );
}

export default async function GestoriaPage({ searchParams }: { searchParams?: { from?: string; to?: string } }) {
  const dateRange = parseDateRange(searchParams);
  let tramites: GestoriaTramite[] = mockGestoriaTramites as GestoriaTramite[];
  let gestores: Employee[] = (mockEmpleados as Employee[]).filter((empleado) =>
    ["admin", "gestor"].includes((empleado.rol ?? "").toLowerCase())
  );

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const [tramitesResult, presupuestosResult, gestoresResult] = await Promise.all([
      fetchAllSupabaseRows((from, to) => supabase
        .from("gestoria_tramites")
        .select(
          "id,tipo,estado,titulo,descripcion,cliente_nombre,cliente_telefono,cliente_email,cliente_documento,fecha_inicio,fecha_vencimiento,fecha_finalizacion,etapa,gestion_tipo,fecha_envio,fecha_firma,costo_final_transferencia,costo_final_moneda,presupuesto_confirmado,cat_estado,cat_fecha,documentacion_fisica_estado,documentacion_fisica_fecha,escribania_estado,escribania_fecha_retiro,transferencia_registral_estado,transferencia_registral_fecha,retiro_documentacion_cliente_estado,retiro_documentacion_cliente_fecha,transferencia_municipal_estado,transferencia_municipal_fecha,seguimiento_comentarios,documentos,observaciones,created_at,vehiculo:vehiculos!gestoria_tramites_vehiculo_id_fkey(id,marca,modelo,version,anio,dominio),venta:ventas!gestoria_tramites_venta_id_fkey(id,fecha_venta,cliente_nombre),responsable:empleados!gestoria_tramites_responsable_id_fkey(id,nombre,email,rol)"
        )
        .order("fecha_vencimiento", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })
        .range(from, to)),
      fetchAllSupabaseRows((from, to) => supabase
        .from("gestoria_presupuestos")
        .select("id,tramite_id,estado,total,moneda,fecha")
        .order("fecha", { ascending: false, nullsFirst: false })
        .range(from, to)),
      supabase
        .from("empleados")
        .select("id,nombre,email,rol")
        .eq("activo", true)
        .in("rol", ["admin", "gestor"])
        .order("nombre", { ascending: true }),
    ]);

    const presupuestoByTramite = new Map<string, Presupuesto>();
    ((presupuestosResult.data ?? []) as Presupuesto[]).forEach((presupuesto) => {
      if (presupuesto.tramite_id && !presupuestoByTramite.has(presupuesto.tramite_id)) {
        presupuestoByTramite.set(presupuesto.tramite_id, presupuesto);
      }
    });

    tramites = ((tramitesResult.data ?? []) as RawGestoriaTramite[]).map((tramite) => ({
      ...tramite,
      vehiculo: normalizeSingleRelation(tramite.vehiculo),
      venta: normalizeSingleRelation(tramite.venta),
      responsable: normalizeSingleRelation(tramite.responsable),
      presupuesto: presupuestoByTramite.get(tramite.id) ?? null,
    }));
    gestores = (gestoresResult.data ?? []) as Employee[];
  } else {
    const presupuestoByTramite = new Map<string, Presupuesto>();
    (mockGestoriaPresupuestos as Presupuesto[]).forEach((presupuesto) => {
      if (presupuesto.tramite_id && !presupuestoByTramite.has(presupuesto.tramite_id)) {
        presupuestoByTramite.set(presupuesto.tramite_id, presupuesto);
      }
    });
    tramites = tramites.map((tramite) => ({
      ...tramite,
      presupuesto: presupuestoByTramite.get(tramite.id) ?? null,
    }));
  }

  tramites = filterByDateRange(tramites, dateRange, (tramite) => tramite.fecha_inicio ?? tramite.fecha_vencimiento ?? tramite.created_at);
  const kpis = getKpiTramites(tramites);

  return (
    <section className="space-y-6">
      {isDemoMode ? (
        <div className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
          Modo demo: los trámites usan datos simulados y no se guardarán cambios reales.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Presupuesto" value={kpis.presupuesto} />
        <KpiCard label="Escribanía" value={kpis.escribania} />
        <KpiCard label="Gestoría" value={kpis.gestoria} />
        <KpiCard label="Vencidos" value={kpis.vencidos} />
      </div>

      <GestoriaKanban
        tramites={tramites}
        gestores={gestores}
        toolbarAction={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/gestoria/presupuestos"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              Presupuestos
            </Link>
            <Link
              href="/gestoria/nuevo"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#8A1538] px-4 text-sm font-medium text-white transition hover:bg-[#6F102D]"
            >
              <Plus className="h-4 w-4" />
              Nuevo trámite
            </Link>
          </div>
        }
      />
    </section>
  );
}
