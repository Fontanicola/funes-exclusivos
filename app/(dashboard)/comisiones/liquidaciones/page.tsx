import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isDemoMode } from "@/lib/demo-mode";
import { mockComisionLiquidaciones } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAllSupabaseRows } from "@/lib/supabase/paginated";
import { LiquidacionesTable } from "@/components/comisiones/liquidaciones-table";

export const metadata: Metadata = {
  title: "Liquidaciones de comisión | Funes Exclusivos",
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

function formatPeriod(value: string | null) {
  if (!value) return "—";
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) return value;
  return `${match[2]}/${match[1]}`;
}

function formatMoney(value: number | null, currency: string | null) {
  if (value == null) return "—";
  const isoCurrency = (currency ?? "").toUpperCase() === "USD" ? "USD" : "ARS";
  const symbol = isoCurrency === "USD" ? "US$" : "$";
  const formatted = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(value);

  return `${symbol} ${formatted}`;
}

function LiquidacionStatusBadge({ status }: { status: string | null }) {
  const normalized = (status ?? "borrador").toLowerCase();
  const styles: Record<string, string> = {
    borrador: "border-[#E5E7EB] bg-[#FAFAFA] text-[#111827]",
    cerrada: "border-[#E5E7EB] bg-[#F9FAFB] text-[#111827]",
    pagada: "border-[#D1FAE5] bg-[#F0FDF4] text-[#166534]",
    anulada: "border-[#F3F4F6] bg-[#F9FAFB] text-[#6B7280]",
  };
  const labels: Record<string, string> = {
    borrador: "Borrador",
    cerrada: "Cerrada",
    pagada: "Pagada",
    anulada: "Anulada",
  };

  return (
    <span className={["inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", styles[normalized] ?? styles.borrador].join(" ")}>
      {labels[normalized] ?? "Borrador"}
    </span>
  );
}

export default async function LiquidacionesPage() {
  let liquidaciones: Liquidacion[] = mockComisionLiquidaciones as Liquidacion[];

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const { data } = await fetchAllSupabaseRows((from, to) =>
      supabase
        .from("comision_liquidaciones")
        .select(
          "id,periodo,estado,moneda,neto_a_cobrar,fecha_pago,fecha_cierre,created_at,vendedor:empleados!comision_liquidaciones_vendedor_id_fkey(id,nombre,email,rol)"
        )
        .order("created_at", { ascending: false })
        .range(from, to)
    );

    liquidaciones = ((data ?? []) as unknown as RawLiquidacion[]).map((item) => ({
      ...item,
      vendedor: normalizeSingleRelation(item.vendedor),
    }));
  }

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <Link href="/comisiones" className="inline-flex items-center gap-2 text-sm font-medium text-[#8A1538] underline decoration-[#D8A1B2] underline-offset-4 transition hover:text-[#6F102D]">
          <ArrowLeft className="h-4 w-4" />
          Volver a comisiones
        </Link>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">Liquidaciones de comisión</h1>
          <p className="text-sm leading-6 text-[#6B7280]">Cierres, pagos y seguimiento del neto a cobrar por vendedor.</p>
        </div>
        {isDemoMode ? (
          <div className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
            Modo demo: las liquidaciones usan datos simulados y no consultarán datos reales.
          </div>
        ) : null}
      </header>

      <LiquidacionesTable liquidaciones={liquidaciones} />
    </section>
  );
}
