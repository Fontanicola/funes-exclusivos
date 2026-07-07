import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import {
  mockGestoriaPresupuestoItems,
  mockGestoriaPresupuestos,
} from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PresupuestoDetail } from "@/components/gestoria/presupuesto-detail";

export const metadata: Metadata = {
  title: "Presupuesto de gestoría | Funes Exclusivos",
};

export const dynamic = "force-dynamic";

type Presupuesto = {
  id: string;
  estado: string | null;
  cliente_nombre: string | null;
  cliente_telefono: string | null;
  cliente_email: string | null;
  cliente_documento: string | null;
  fecha: string | null;
  moneda: string | null;
  valor_vehiculo: number | null;
  valor_tabla_dnrpa: number | null;
  valor_tabla_api: number | null;
  subtotal: number | null;
  total: number | null;
  link_dnrpa: string | null;
  link_api: string | null;
  observaciones: string | null;
  tramite: {
    id: string;
    titulo: string | null;
    tipo: string | null;
    estado: string | null;
  } | null;
  venta: {
    id: string;
    fecha_venta: string | null;
    cliente_nombre: string | null;
  } | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    version: string | null;
    anio: number | null;
    dominio: string | null;
  } | null;
};

type Item = {
  id: string;
  presupuesto_id: string;
  tipo: string | null;
  descripcion: string | null;
  monto: number | null;
  moneda: string | null;
  orden: number | null;
};

type RawPresupuesto = Omit<Presupuesto, "tramite" | "venta" | "vehiculo"> & {
  tramite: Presupuesto["tramite"] | Presupuesto["tramite"][] | null;
  venta: Presupuesto["venta"] | Presupuesto["venta"][] | null;
  vehiculo: Presupuesto["vehiculo"] | Presupuesto["vehiculo"][] | null;
};

function normalizeSingleRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function formatVehicleLabel(presupuesto: Presupuesto) {
  return [presupuesto.vehiculo?.marca, presupuesto.vehiculo?.modelo].filter(Boolean).join(" ") || presupuesto.tramite?.titulo || presupuesto.venta?.cliente_nombre || "Presupuesto";
}

export default async function PresupuestoDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  let presupuesto: Presupuesto | null = null;
  let items: Item[] = [];

  if (isDemoMode) {
    presupuesto = (mockGestoriaPresupuestos as Presupuesto[]).find((entry) => entry.id === id) ?? null;
    items = (mockGestoriaPresupuestoItems as Item[]).filter((item) => item.presupuesto_id === id);
  } else {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("gestoria_presupuestos")
      .select(
        "id,tramite_id,venta_id,vehiculo_id,estado,cliente_nombre,cliente_telefono,cliente_email,cliente_documento,fecha,moneda,valor_vehiculo,valor_tabla_dnrpa,valor_tabla_api,subtotal,total,link_dnrpa,link_api,observaciones,tramite:gestoria_tramites!gestoria_presupuestos_tramite_id_fkey(id,titulo,tipo,estado),venta:ventas!gestoria_presupuestos_venta_id_fkey(id,fecha_venta,cliente_nombre),vehiculo:vehiculos!gestoria_presupuestos_vehiculo_id_fkey(id,marca,modelo,version,anio,dominio)"
      )
      .eq("id", id)
      .maybeSingle();

    if (!data) {
      notFound();
    }

    const raw = data as unknown as RawPresupuesto;
    presupuesto = {
      ...raw,
      tramite: normalizeSingleRelation(raw.tramite),
      venta: normalizeSingleRelation(raw.venta),
      vehiculo: normalizeSingleRelation(raw.vehiculo),
    };

    const { data: itemsData } = await supabase
      .from("gestoria_presupuesto_items")
      .select("id,presupuesto_id,tipo,descripcion,monto,moneda,orden")
      .eq("presupuesto_id", id)
      .order("orden", { ascending: true });

    items = (itemsData ?? []) as Item[];
  }

  if (!presupuesto) {
    notFound();
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
              Presupuesto de gestoría
            </h1>
            <p className="text-sm leading-6 text-[#6B7280]">
              {presupuesto.cliente_nombre ?? formatVehicleLabel(presupuesto)}
            </p>
          </div>
        </div>
      </header>

      <PresupuestoDetail presupuesto={presupuesto} items={items} />
    </section>
  );
}

