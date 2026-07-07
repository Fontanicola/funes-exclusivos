import type { Metadata } from "next";
import Link from "next/link";
import { isDemoMode } from "@/lib/demo-mode";
import {
  mockGestoriaTramites,
  mockVehiculos,
  mockVentas,
} from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PresupuestoForm } from "@/components/gestoria/presupuesto-form";

export const metadata: Metadata = {
  title: "Nuevo presupuesto | Funes Exclusivos",
};

export const dynamic = "force-dynamic";

type Tramite = {
  id: string;
  titulo: string | null;
  tipo: string | null;
  estado: string | null;
  cliente_nombre: string | null;
  cliente_telefono: string | null;
  cliente_email: string | null;
  cliente_documento: string | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    dominio: string | null;
  } | null;
};

type Venta = {
  id: string;
  fecha_venta: string | null;
  cliente_nombre: string | null;
  cliente_telefono: string | null;
  cliente_email: string | null;
  cliente_documento: string | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    dominio: string | null;
  } | null;
};

type Vehiculo = {
  id: string;
  marca: string | null;
  modelo: string | null;
  version: string | null;
  anio: number | null;
  dominio: string | null;
  precio_venta: number | null;
  precio_contado: number | null;
  precio_permuta: number | null;
};

type RawTramite = Omit<Tramite, "vehiculo"> & {
  vehiculo: Tramite["vehiculo"] | Tramite["vehiculo"][] | null;
};

type RawVenta = Omit<Venta, "vehiculo"> & {
  vehiculo: Venta["vehiculo"] | Venta["vehiculo"][] | null;
};

function normalizeSingleRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function NuevoPresupuestoPage() {
  let tramites: Tramite[] = mockGestoriaTramites as Tramite[];
  let ventas: Venta[] = mockVentas as Venta[];
  let vehiculos: Vehiculo[] = mockVehiculos as unknown as Vehiculo[];

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const [tramitesResult, ventasResult, vehiculosResult] = await Promise.all([
      supabase
        .from("gestoria_tramites")
        .select("id,titulo,tipo,estado,cliente_nombre,cliente_telefono,cliente_email,cliente_documento,vehiculo:vehiculos!gestoria_tramites_vehiculo_id_fkey(id,marca,modelo,dominio)")
        .order("created_at", { ascending: false }),
      supabase
        .from("ventas")
        .select("id,fecha_venta,cliente_nombre,cliente_telefono,cliente_email,cliente_documento,vehiculo:vehiculos!ventas_vehiculo_id_fkey(id,marca,modelo,dominio)")
        .eq("estado", "registrada")
        .order("fecha_venta", { ascending: false }),
      supabase
        .from("vehiculos")
        .select("id,marca,modelo,version,anio,dominio,precio_venta,precio_contado,precio_permuta")
        .order("marca", { ascending: true })
        .order("modelo", { ascending: true }),
    ]);

    tramites = ((tramitesResult.data ?? []) as unknown as RawTramite[]).map((tramite) => ({
      ...tramite,
      vehiculo: normalizeSingleRelation(tramite.vehiculo),
    }));
    ventas = ((ventasResult.data ?? []) as unknown as RawVenta[]).map((venta) => ({
      ...venta,
      vehiculo: normalizeSingleRelation(venta.vehiculo),
    }));
    vehiculos = (vehiculosResult.data ?? []) as unknown as Vehiculo[];
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Link
              href="/gestoria/presupuestos"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#111827]"
            >
              Volver a Presupuestos
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
              Nuevo presupuesto
            </h1>
            <p className="text-sm leading-6 text-[#6B7280]">
              Cargar estimación de gestoría
            </p>
          </div>
        </div>
        {isDemoMode ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
            Modo demo: el formulario no guardará datos reales hasta conectar Supabase.
          </div>
        ) : null}
      </header>

      <PresupuestoForm tramites={tramites} ventas={ventas} vehiculos={vehiculos} />
    </section>
  );
}
