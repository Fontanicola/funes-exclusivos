import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import { mockComisionLiquidaciones } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LiquidacionDetail } from "@/components/comisiones/liquidacion-detail";

export const metadata: Metadata = {
  title: "Liquidación de comisión | Funes Exclusivos",
};

export const dynamic = "force-dynamic";

type Liquidacion = {
  id: string;
  periodo: string | null;
  estado: string | null;
  moneda: string | null;
  neto_a_cobrar: number | null;
  fecha_pago: string | null;
  fecha_cierre: string | null;
  observaciones: string | null;
  created_at: string | null;
  vendedor: {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
  } | null;
};

type RawLiquidacion = Omit<Liquidacion, "vendedor"> & {
  vendedor: Liquidacion["vendedor"] | Liquidacion["vendedor"][] | null;
};

function normalizeSingleRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default async function LiquidacionDetallePage({ params }: { params: { id: string } }) {
  const { id } = params;

  let liquidacion: Liquidacion | null = null;

  if (isDemoMode) {
    liquidacion = (mockComisionLiquidaciones as Liquidacion[]).find((item) => item.id === id) ?? null;
  } else {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("comision_liquidaciones")
      .select(
        "id,periodo,estado,moneda,neto_a_cobrar,fecha_pago,fecha_cierre,observaciones,created_at,vendedor:empleados!comision_liquidaciones_vendedor_id_fkey(id,nombre,email,rol)"
      )
      .eq("id", id)
      .maybeSingle<RawLiquidacion>();

    liquidacion = data
      ? {
          ...data,
          vendedor: normalizeSingleRelation(data.vendedor),
        }
      : null;
  }

  if (!liquidacion) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <Link href="/comisiones/liquidaciones" className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#111827]">
          <ArrowLeft className="h-4 w-4" />
          Volver a liquidaciones
        </Link>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">Liquidación de comisión</h1>
          <p className="text-sm leading-6 text-[#6B7280]">
            Seguimiento del cierre y pago automático en Caja.
          </p>
        </div>
      </header>

      <LiquidacionDetail liquidacion={liquidacion} />
    </section>
  );
}
