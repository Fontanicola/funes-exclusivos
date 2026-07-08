import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { isDemoMode } from "@/lib/demo-mode";
import { mockGestoriaTramites } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GestoriaTable } from "@/components/gestoria/gestoria-table";

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
    pendientes: tramites.filter((tramite) => ["pendiente", "en_proceso"].includes((tramite.estado ?? "").toLowerCase())).length,
    observados: tramites.filter((tramite) => (tramite.estado ?? "").toLowerCase() === "observado").length,
    vencidos: tramites.filter(isOverdue).length,
    completados: tramites.filter((tramite) => (tramite.estado ?? "").toLowerCase() === "completado").length,
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
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-[#6B7280]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">{value}</p>
    </article>
  );
}

export default async function GestoriaPage() {
  let tramites: GestoriaTramite[] = mockGestoriaTramites as GestoriaTramite[];

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("gestoria_tramites")
      .select(
        "id,tipo,estado,titulo,descripcion,cliente_nombre,cliente_telefono,cliente_email,cliente_documento,fecha_inicio,fecha_vencimiento,fecha_finalizacion,documentos,observaciones,created_at,vehiculo:vehiculos!gestoria_tramites_vehiculo_id_fkey(id,marca,modelo,version,anio,dominio),venta:ventas!gestoria_tramites_venta_id_fkey(id,fecha_venta,cliente_nombre),responsable:empleados!gestoria_tramites_responsable_id_fkey(id,nombre,email,rol)"
      )
      .order("fecha_vencimiento", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(150);

    tramites = ((data ?? []) as RawGestoriaTramite[]).map((tramite) => ({
      ...tramite,
      vehiculo: normalizeSingleRelation(tramite.vehiculo),
      venta: normalizeSingleRelation(tramite.venta),
      responsable: normalizeSingleRelation(tramite.responsable),
    }));
  }

  const kpis = getKpiTramites(tramites);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
              Gestoría
            </h1>
            <p className="text-sm leading-6 text-[#6B7280]">
              Trámites, vencimientos y documentación
            </p>
          </div>

          <Link
            href="/gestoria/nuevo"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A]"
          >
            <Plus className="h-4 w-4" />
            Nuevo trámite
          </Link>
          <Link
            href="/gestoria/presupuestos"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Presupuestos
          </Link>
        </div>
        {isDemoMode ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
            Modo demo: los trámites son mock y no se guardará nada en Supabase.
          </div>
        ) : null}
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Pendientes" value={kpis.pendientes} />
        <KpiCard label="Observados" value={kpis.observados} />
        <KpiCard label="Vencidos" value={kpis.vencidos} />
        <KpiCard label="Completados" value={kpis.completados} />
      </div>

      <GestoriaTable tramites={tramites} />
    </section>
  );
}
