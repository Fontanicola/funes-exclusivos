import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isDemoMode } from "@/lib/demo-mode";
import {
  mockGestoriaResponsables,
  mockVehiculos,
  mockVentas,
} from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GestoriaForm } from "@/components/gestoria/gestoria-form";

export const metadata: Metadata = {
  title: "Nuevo trámite | Funes Exclusivos",
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

type Venta = {
  id: string;
  fecha_venta: string | null;
  cliente_nombre: string | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    dominio: string | null;
  } | null;
};

type Employee = {
  id: string;
  nombre: string | null;
  email: string | null;
  rol: string | null;
};

type RawVenta = Omit<Venta, "vehiculo"> & {
  vehiculo: Venta["vehiculo"] | Venta["vehiculo"][] | null;
};

function normalizeSingleRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function getVehicleOption(vehicle: Vehicle) {
  return `${vehicle.marca ?? "-"} ${vehicle.modelo ?? ""}${vehicle.version ? ` · ${vehicle.version}` : ""}${vehicle.anio ? ` · ${vehicle.anio}` : ""}${vehicle.dominio ? ` · ${vehicle.dominio}` : ""}`;
}

function getSaleOption(sale: Venta) {
  const vehicle = sale.vehiculo
    ? `${sale.vehiculo.marca ?? "-"} ${sale.vehiculo.modelo ?? ""}`.trim()
    : "Venta";
  const subtitle = sale.vehiculo?.dominio ?? sale.cliente_nombre ?? "Sin detalle";

  return `${sale.fecha_venta ?? "—"} · ${vehicle} · ${subtitle}`;
}

function getEmployeeOption(employee: Employee) {
  return employee.nombre ?? employee.email ?? "Responsable";
}

export default async function NuevoGestoriaPage() {
  let vehicles: Vehicle[] = mockVehiculos as Vehicle[];
  let ventas: Venta[] = (mockVentas.filter((venta) => venta.estado === "registrada") as Venta[]) ?? [];
  let responsables: Employee[] = mockGestoriaResponsables as Employee[];

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();

    const [vehiclesResult, ventasResult, responsablesResult] = await Promise.all([
      supabase
        .from("vehiculos")
        .select("id,marca,modelo,version,anio,dominio")
        .order("marca")
        .order("modelo"),
      supabase
        .from("ventas")
        .select("id,fecha_venta,cliente_nombre,vehiculo:vehiculos!ventas_vehiculo_id_fkey(id,marca,modelo,dominio)")
        .eq("estado", "registrada")
        .order("fecha_venta", { ascending: false }),
      supabase
        .from("empleados")
        .select("id,nombre,email,rol")
        .eq("activo", true)
        .order("nombre"),
    ]);

    vehicles = (vehiclesResult.data ?? []) as Vehicle[];
    ventas = ((ventasResult.data ?? []) as RawVenta[]).map((venta) => ({
      ...venta,
      vehiculo: normalizeSingleRelation(venta.vehiculo),
    }));
    responsables = (responsablesResult.data ?? []) as Employee[];
  }

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <Link
          href="/gestoria"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#111827]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a gestoría
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
            Nuevo trámite
          </h1>
          <p className="text-sm leading-6 text-[#6B7280]">
            Cargar seguimiento de gestoría
          </p>
        </div>
        {isDemoMode ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
            Modo demo: este formulario no guardará datos reales hasta conectar Supabase.
          </div>
        ) : null}
      </header>

      <GestoriaForm vehicles={vehicles} ventas={ventas} responsables={responsables} />
    </section>
  );
}
