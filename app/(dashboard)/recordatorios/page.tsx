import type { Metadata } from "next";
import Link from "next/link";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mockEmpleados, mockRecordatorios, mockEmpleado } from "@/lib/mock-data";
import { RecordatorioForm } from "@/components/recordatorios/recordatorio-form";
import { RecordatoriosTable } from "@/components/recordatorios/recordatorios-table";
import { KpiCard } from "@/components/dashboard/kpi-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recordatorios | Funes Exclusivos",
};

type Employee = {
  id: string;
  nombre: string | null;
  email: string | null;
  rol: string | null;
  activo: boolean | null;
};

type Recordatorio = {
  id: string;
  tipo: string | null;
  estado: string | null;
  prioridad: string | null;
  titulo: string | null;
  descripcion: string | null;
  fecha_vencimiento: string | null;
  fecha_completado: string | null;
  fecha_pospuesto: string | null;
  asignado_a: string | null;
  lead_id: string | null;
  conversacion_id: string | null;
  venta_id: string | null;
  entrega_id: string | null;
  tramite_id: string | null;
  vehiculo_id: string | null;
  comision_liquidacion_id: string | null;
  origen_automatico: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  asignado: {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
  } | null;
  lead: {
    id: string;
    nombre: string | null;
    telefono: string | null;
    estado: string | null;
  } | null;
  conversacion: {
    id: string;
    contacto_nombre: string | null;
    contacto_telefono: string | null;
    ultimo_mensaje_at: string | null;
  } | null;
  venta: {
    id: string;
    cliente_nombre: string | null;
    fecha_venta: string | null;
  } | null;
  entrega: {
    id: string;
    estado: string | null;
    fecha_entrega: string | null;
  } | null;
  tramite: {
    id: string;
    titulo: string | null;
    tipo: string | null;
    estado: string | null;
    fecha_vencimiento: string | null;
  } | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    dominio: string | null;
  } | null;
};

type RawRecordatorio = Omit<
  Recordatorio,
  "asignado" | "lead" | "conversacion" | "venta" | "entrega" | "tramite" | "vehiculo"
> & {
  asignado: Recordatorio["asignado"] | Recordatorio["asignado"][] | null;
  lead: Recordatorio["lead"] | Recordatorio["lead"][] | null;
  conversacion: Recordatorio["conversacion"] | Recordatorio["conversacion"][] | null;
  venta: Recordatorio["venta"] | Recordatorio["venta"][] | null;
  entrega: Recordatorio["entrega"] | Recordatorio["entrega"][] | null;
  tramite: Recordatorio["tramite"] | Recordatorio["tramite"][] | null;
  vehiculo: Recordatorio["vehiculo"] | Recordatorio["vehiculo"][] | null;
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

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function normalizeDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function isOverdue(recordatorio: Recordatorio) {
  const due = normalizeDate(recordatorio.fecha_vencimiento);
  if (!due) return false;
  const state = (recordatorio.estado ?? "").toLowerCase();
  return due.getTime() < startOfToday().getTime() && !["completado", "cancelado"].includes(state);
}

function isToday(recordatorio: Recordatorio) {
  const due = normalizeDate(recordatorio.fecha_vencimiento);
  if (!due) return false;
  const state = (recordatorio.estado ?? "").toLowerCase();
  return due.getTime() === startOfToday().getTime() && !["completado", "cancelado"].includes(state);
}

function isHighPriority(recordatorio: Recordatorio) {
  const priority = (recordatorio.prioridad ?? "").toLowerCase();
  return ["alta", "critica"].includes(priority) && !["completado", "cancelado"].includes((recordatorio.estado ?? "").toLowerCase());
}

function isPending(recordatorio: Recordatorio) {
  const state = (recordatorio.estado ?? "").toLowerCase();
  return ["pendiente", "pospuesto"].includes(state);
}

function getKpis(recordatorios: Recordatorio[]) {
  const currentMonth = new Date();
  return {
    pendientes: recordatorios.filter(isPending).length,
    vencidos: recordatorios.filter(isOverdue).length,
    hoy: recordatorios.filter(isToday).length,
    altaPrioridad: recordatorios.filter(isHighPriority).length,
    completadosMes: recordatorios.filter((item) => {
      if ((item.estado ?? "").toLowerCase() !== "completado") return false;
      const completed = normalizeDate(item.fecha_completado ?? item.updated_at ?? item.created_at);
      return Boolean(
        completed &&
          completed.getFullYear() === currentMonth.getFullYear() &&
          completed.getMonth() === currentMonth.getMonth()
      );
    }).length,
  };
}

function sortRecordatorios(recordatorios: Recordatorio[]) {
  const priorityRank = (priority: string | null) => {
    const value = (priority ?? "").toLowerCase();
    if (value === "critica") return 0;
    if (value === "alta") return 1;
    if (value === "media") return 2;
    if (value === "baja") return 3;
    return 4;
  };

  const statusRank = (status: string | null) => {
    const value = (status ?? "").toLowerCase();
    if (value === "pendiente") return 0;
    if (value === "pospuesto") return 1;
    if (value === "completado") return 2;
    if (value === "cancelado") return 3;
    return 4;
  };

  return [...recordatorios].sort((left, right) => {
    const statusDiff = statusRank(left.estado) - statusRank(right.estado);
    if (statusDiff) return statusDiff;

    const priorityDiff = priorityRank(left.prioridad) - priorityRank(right.prioridad);
    if (priorityDiff) return priorityDiff;

    const dueLeft = normalizeDate(left.fecha_vencimiento)?.getTime() ?? Number.POSITIVE_INFINITY;
    const dueRight = normalizeDate(right.fecha_vencimiento)?.getTime() ?? Number.POSITIVE_INFINITY;
    if (dueLeft !== dueRight) return dueLeft - dueRight;

    const createdLeft = new Date(left.created_at ?? 0).getTime();
    const createdRight = new Date(right.created_at ?? 0).getTime();
    return createdRight - createdLeft;
  });
}

async function loadData() {
  if (isDemoMode) {
    return {
      recordatorios: mockRecordatorios as Recordatorio[],
      employees: mockEmpleados as Employee[],
      currentEmployeeId: mockEmpleado.id,
      currentEmployeeRole: mockEmpleado.rol,
    };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [currentEmployeeResult, employeesResult, recordatoriosResult] = await Promise.all([
    supabase
      .from("empleados")
      .select("id,nombre,email,rol,activo")
      .eq("id", user?.id ?? "")
      .maybeSingle<Employee>(),
    supabase
      .from("empleados")
      .select("id,nombre,email,rol,activo")
      .eq("activo", true)
      .order("nombre", { ascending: true }),
    supabase
      .from("recordatorios")
      .select(
        "id,tipo,estado,prioridad,titulo,descripcion,fecha_vencimiento,fecha_completado,fecha_pospuesto,asignado_a,lead_id,conversacion_id,venta_id,entrega_id,tramite_id,vehiculo_id,comision_liquidacion_id,origen_automatico,created_at,updated_at,asignado:empleados!recordatorios_asignado_a_fkey(id,nombre,email,rol),lead:leads!recordatorios_lead_id_fkey(id,nombre,telefono,estado),conversacion:conversaciones!recordatorios_conversacion_id_fkey(id,contacto_nombre,contacto_telefono,ultimo_mensaje_at),venta:ventas!recordatorios_venta_id_fkey(id,cliente_nombre,fecha_venta),entrega:ventas_entregas!recordatorios_entrega_id_fkey(id,estado,fecha_entrega),tramite:gestoria_tramites!recordatorios_tramite_id_fkey(id,titulo,tipo,estado,fecha_vencimiento),vehiculo:vehiculos!recordatorios_vehiculo_id_fkey(id,marca,modelo,dominio)"
      )
      .order("fecha_vencimiento", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false }),
  ]);

  const recordatorios = ((recordatoriosResult.data ?? []) as RawRecordatorio[]).map((item) => ({
    ...item,
    asignado: normalizeSingleRelation(item.asignado),
    lead: normalizeSingleRelation(item.lead),
    conversacion: normalizeSingleRelation(item.conversacion),
    venta: normalizeSingleRelation(item.venta),
    entrega: normalizeSingleRelation(item.entrega),
    tramite: normalizeSingleRelation(item.tramite),
    vehiculo: normalizeSingleRelation(item.vehiculo),
  }));

  return {
    recordatorios: sortRecordatorios(recordatorios),
    employees: (employeesResult.data ?? []) as Employee[],
    currentEmployeeId: currentEmployeeResult.data?.id ?? user?.id ?? null,
    currentEmployeeRole: currentEmployeeResult.data?.rol ?? null,
  };
}

export default async function RecordatoriosPage() {
  const { recordatorios, employees, currentEmployeeId, currentEmployeeRole } = await loadData();
  const kpis = getKpis(recordatorios);
  const assignableEmployees =
    currentEmployeeRole === "admin"
      ? employees
      : employees.filter((employee) => employee.id === currentEmployeeId);

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">Recordatorios</h1>
            <p className="text-sm leading-6 text-[#6B7280]">
              Seguimientos, vencimientos y alertas operativas.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Volver al dashboard
          </Link>
        </div>

        {isDemoMode ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
            Modo demo: los recordatorios son mock y no se guardará nada en Supabase.
          </div>
        ) : null}
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard title="Pendientes" value={String(kpis.pendientes)} description="Seguimientos activos" variant="default" />
        <KpiCard title="Vencidos" value={String(kpis.vencidos)} description="Requieren atención" variant="danger" />
        <KpiCard title="Hoy" value={String(kpis.hoy)} description="Para revisar hoy" variant="warning" />
        <KpiCard title="Alta prioridad" value={String(kpis.altaPrioridad)} description="Críticos o urgentes" variant="highlight" />
        <KpiCard title="Completados del mes" value={String(kpis.completadosMes)} description="Cerrados este mes" variant="positive" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)]">
        <RecordatorioForm
          employees={assignableEmployees.length ? assignableEmployees : employees}
          defaultAsignadoId={currentEmployeeId}
        />
        <RecordatoriosTable
          recordatorios={recordatorios}
          employees={assignableEmployees.length ? assignableEmployees : employees}
        />
      </div>
    </section>
  );
}
