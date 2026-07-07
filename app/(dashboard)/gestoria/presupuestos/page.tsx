import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { isDemoMode } from "@/lib/demo-mode";
import {
  mockGestoriaPresupuestos,
  mockGestoriaTramites,
  mockVehiculos,
  mockVentas,
} from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PresupuestosTable } from "@/components/gestoria/presupuestos-table";

export const metadata: Metadata = {
  title: "Presupuestos de gestoría | Funes Exclusivos",
};

export const dynamic = "force-dynamic";

type Presupuesto = {
  id: string;
  tramite_id: string | null;
  venta_id: string | null;
  vehiculo_id: string | null;
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
  created_at: string | null;
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

type RawPresupuesto = Omit<Presupuesto, "tramite" | "venta" | "vehiculo"> & {
  tramite: Presupuesto["tramite"] | Presupuesto["tramite"][] | null;
  venta: Presupuesto["venta"] | Presupuesto["venta"][] | null;
  vehiculo: Presupuesto["vehiculo"] | Presupuesto["vehiculo"][] | null;
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

function formatCurrency(value: number | null, currency: string | null) {
  if (value == null) return "—";
  const isoCurrency = (currency ?? "").toLowerCase() === "usd" ? "USD" : "ARS";
  const symbol = isoCurrency === "USD" ? "US$" : "$";
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: isoCurrency,
    maximumFractionDigits: 0,
  }).format(value);

  return formatted.replace("US$", symbol).replace("$", symbol);
}

function groupByCurrency(entries: { total: number; moneda: string | null }[]) {
  const groups = new Map<string, number>();

  for (const entry of entries) {
    const currency = (entry.moneda ?? "ARS").toUpperCase();
    groups.set(currency, (groups.get(currency) ?? 0) + (entry.total ?? 0));
  }

  return Array.from(groups.entries()).map(([currency, total]) => ({ currency, total }));
}

function formatGroupedCurrency(entries: { currency: string; total: number }[]) {
  if (!entries.length) return "—";
  if (entries.length === 1) {
    return formatCurrency(entries[0].total, entries[0].currency);
  }

  return entries
    .map(
      (entry) =>
        `${entry.currency} ${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(entry.total)}`
    )
    .join(" · ");
}

function getMonthKey(value: string | null) {
  if (!value) return "";
  return value.slice(0, 7);
}

export default async function GestoriaPresupuestosPage() {
  let presupuestos: Presupuesto[] = mockGestoriaPresupuestos as Presupuesto[];

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("gestoria_presupuestos")
      .select(
        "id,tramite_id,venta_id,vehiculo_id,estado,cliente_nombre,cliente_telefono,cliente_email,cliente_documento,fecha,moneda,valor_vehiculo,valor_tabla_dnrpa,valor_tabla_api,subtotal,total,link_dnrpa,link_api,observaciones,created_at,tramite:gestoria_tramites!gestoria_presupuestos_tramite_id_fkey(id,titulo,tipo,estado),venta:ventas!gestoria_presupuestos_venta_id_fkey(id,fecha_venta,cliente_nombre),vehiculo:vehiculos!gestoria_presupuestos_vehiculo_id_fkey(id,marca,modelo,version,anio,dominio)"
      )
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false });

    presupuestos = ((data ?? []) as unknown as RawPresupuesto[]).map((presupuesto) => ({
      ...presupuesto,
      tramite: normalizeSingleRelation(presupuesto.tramite),
      venta: normalizeSingleRelation(presupuesto.venta),
      vehiculo: normalizeSingleRelation(presupuesto.vehiculo),
    }));
  }

  const nowMonth = new Date().toISOString().slice(0, 7);
  const presupuestosMes = presupuestos.filter((presupuesto) => getMonthKey(presupuesto.fecha) === nowMonth);
  const totalPresupuestado = groupByCurrency(
    presupuestosMes.map((presupuesto) => ({
      total: presupuesto.total ?? 0,
      moneda: presupuesto.moneda,
    }))
  );
  const aprobados = presupuestos.filter((presupuesto) => (presupuesto.estado ?? "").toLowerCase() === "aprobado").length;
  const borradores = presupuestos.filter((presupuesto) => ["borrador", "enviado"].includes((presupuesto.estado ?? "").toLowerCase())).length;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Link
              href="/gestoria"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#111827]"
            >
              Volver a Gestoría
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
              Presupuestos de gestoría
            </h1>
            <p className="text-sm leading-6 text-[#6B7280]">
              Transferencias, aranceles, sellos y honorarios
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/gestoria/presupuestos/nuevo"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A]"
            >
              <Plus className="h-4 w-4" />
              Nuevo presupuesto
            </Link>
          </div>
        </div>
        {isDemoMode ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
            Modo demo: los presupuestos son mock y no se guardará nada en Supabase.
          </div>
        ) : null}
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Presupuestos del mes</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">{presupuestosMes.length}</p>
        </article>
        <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Total presupuestado</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">
            {formatGroupedCurrency(totalPresupuestado)}
          </p>
        </article>
        <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Aprobados</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">{aprobados}</p>
        </article>
        <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Pendientes / borrador</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">{borradores}</p>
        </article>
      </div>

      <PresupuestosTable presupuestos={presupuestos} />
    </section>
  );
}
