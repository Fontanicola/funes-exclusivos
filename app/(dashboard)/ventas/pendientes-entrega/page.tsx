import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isDemoMode } from "@/lib/demo-mode";
import {
  mockVentasEntregas,
  mockVentasPagos,
} from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PendientesEntregaTable } from "@/components/ventas/pendientes-entrega-table";

export const metadata: Metadata = {
  title: "Pendientes de entrega | Funes Exclusivos",
};

export const dynamic = "force-dynamic";

type VentaRelacion = {
  id: string;
  fecha_venta: string | null;
  cliente_nombre: string | null;
  cliente_telefono: string | null;
  cliente_email: string | null;
  cliente_documento: string | null;
  precio_venta: number | null;
  moneda: string | null;
  metodo_pago: string | null;
  monto_permuta: number | null;
  saldo_preventa: number | null;
  saldo_efectivo: number | null;
  importe_gestoria: number | null;
  importe_escribania: number | null;
  resultado_operativo: number | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    version: string | null;
    anio: number | null;
    dominio: string | null;
  } | null;
  vehiculo_recibido: {
    id: string;
    marca: string | null;
    modelo: string | null;
    version: string | null;
    anio: number | null;
    dominio: string | null;
  } | null;
  vendedor: {
    id: string;
    nombre: string | null;
    email: string | null;
  } | null;
};

type Entrega = {
  id: string;
  venta_id: string;
  estado: string | null;
  fecha_entrega: string | null;
  status_informe_vu: string | null;
  usado_credito: string | null;
  usado_informe_dominio: string | null;
  usado_multas: string | null;
  usado_patentes: string | null;
  usado_observaciones: string | null;
  observaciones: string | null;
  created_at: string | null;
  updated_at: string | null;
  venta: VentaRelacion | null;
  pagos?: Array<Record<string, any>>;
};

function normalizeSingleRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function PendientesEntregaPage() {
  let entregas: Entrega[] = [];

  if (isDemoMode) {
    const pagosPorVenta = new Map<string, Array<Record<string, any>>>();
    for (const pago of mockVentasPagos) {
      const ventaId = String(pago.venta_id);
      const current = pagosPorVenta.get(ventaId) ?? [];
      current.push(pago);
      pagosPorVenta.set(ventaId, current);
    }

    entregas = mockVentasEntregas.map((entrega) => ({
      ...entrega,
      venta: entrega.venta as unknown as VentaRelacion,
      pagos: pagosPorVenta.get(entrega.venta_id) ?? [],
    })) as Entrega[];
  } else {
    const supabase = createSupabaseServerClient();
    const [entregasResult, pagosResult] = await Promise.all([
      supabase
        .from("ventas_entregas")
        .select(
          "id,venta_id,estado,fecha_entrega,status_informe_vu,usado_credito,usado_informe_dominio,usado_multas,usado_patentes,usado_observaciones,observaciones,created_at,updated_at,venta:ventas!ventas_entregas_venta_id_fkey(id,fecha_venta,cliente_nombre,cliente_telefono,cliente_email,cliente_documento,precio_venta,moneda,metodo_pago,monto_permuta,saldo_preventa,saldo_efectivo,importe_gestoria,importe_escribania,resultado_operativo,vehiculo:vehiculos!ventas_vehiculo_id_fkey(id,marca,modelo,version,anio,dominio),vehiculo_recibido:vehiculos!ventas_vehiculo_recibido_id_fkey(id,marca,modelo,version,anio,dominio),vendedor:empleados!ventas_vendedor_id_fkey(id,nombre,email))"
        )
        .order("fecha_entrega", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("ventas_pagos")
        .select("id,venta_id,tipo,fecha,importe,moneda,medio,detalle")
        .order("fecha", { ascending: true }),
    ]);

    const pagosPorVenta = new Map<string, Array<Record<string, any>>>();
    for (const pago of (pagosResult.data ?? []) as Array<Record<string, any>>) {
      const ventaId = String(pago?.venta_id ?? "");
      if (!ventaId) continue;
      const current = pagosPorVenta.get(ventaId) ?? [];
      current.push(pago);
      pagosPorVenta.set(ventaId, current);
    }

    entregas = ((entregasResult.data ?? []) as any[]).map((entrega) => ({
      ...entrega,
      venta: normalizeSingleRelation(entrega.venta) as unknown as VentaRelacion,
      pagos: pagosPorVenta.get(String(entrega.venta_id ?? "")) ?? [],
    })) as Entrega[];
  }

  const pending = entregas.filter((entrega) => (entrega.estado ?? "pendiente") === "pendiente").length;
  const inProcess = entregas.filter((entrega) => (entrega.estado ?? "").toLowerCase() === "en_proceso").length;
  const observed = entregas.filter((entrega) => (entrega.estado ?? "").toLowerCase() === "observada").length;
  const ready = entregas.filter((entrega) => (entrega.estado ?? "").toLowerCase() === "lista_para_entregar").length;
  const delivered = entregas.filter((entrega) => (entrega.estado ?? "").toLowerCase() === "entregada").length;

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">Pendientes de entrega</h1>
            <p className="text-sm leading-6 text-[#6B7280]">
              Seguimiento de operaciones vendidas hasta la entrega final
            </p>
          </div>

          <Link
            href="/ventas"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a ventas
          </Link>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-5">
        {[
          ["Pendientes", pending],
          ["En proceso", inProcess],
          ["Observadas", observed],
          ["Listas para entregar", ready],
          ["Entregadas", delivered],
        ].map(([label, value]) => (
          <article key={label as string} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-[#6B7280]">{label as string}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">{value as number}</p>
          </article>
        ))}
      </div>

      <PendientesEntregaTable entregas={entregas} />
    </section>
  );
}
