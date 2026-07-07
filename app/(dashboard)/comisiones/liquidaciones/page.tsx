import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { isDemoMode } from "@/lib/demo-mode";
import { mockComisionLiquidaciones } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
    const { data } = await supabase
      .from("comision_liquidaciones")
      .select(
        "id,periodo,estado,moneda,neto_a_cobrar,fecha_pago,fecha_cierre,created_at,vendedor:empleados!comision_liquidaciones_vendedor_id_fkey(id,nombre,email,rol)"
      )
      .order("created_at", { ascending: false });

    liquidaciones = ((data ?? []) as unknown as RawLiquidacion[]).map((item) => ({
      ...item,
      vendedor: normalizeSingleRelation(item.vendedor),
    }));
  }

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <Link href="/comisiones" className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#111827]">
          <ArrowLeft className="h-4 w-4" />
          Volver a comisiones
        </Link>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">Liquidaciones de comisión</h1>
          <p className="text-sm leading-6 text-[#6B7280]">Cierres, pagos y seguimiento del neto a cobrar por vendedor.</p>
        </div>
        {isDemoMode ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
            Modo demo: las liquidaciones son mock y no se consultará Supabase.
          </div>
        ) : null}
      </header>

      <div className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#111827]">Listado</h2>
              <p className="text-sm text-[#6B7280]">Neto pendiente, pagado o cerrado por período.</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E5E7EB] text-left text-sm">
            <thead className="bg-[#FAFAFA] text-xs uppercase tracking-[0.14em] text-[#6B7280]">
              <tr>
                <th className="px-5 py-3 font-medium">Período</th>
                <th className="px-5 py-3 font-medium">Vendedor</th>
                <th className="px-5 py-3 font-medium">Neto</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Pago</th>
                <th className="px-5 py-3 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] bg-white">
              {liquidaciones.length ? (
                liquidaciones.map((liquidacion) => (
                  <tr key={liquidacion.id} className="transition hover:bg-[#F9FAFB]">
                    <td className="whitespace-nowrap px-5 py-4 text-[#111827]">{formatPeriod(liquidacion.periodo)}</td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-[#111827]">{liquidacion.vendedor?.nombre ?? "—"}</p>
                        <p className="text-xs text-[#6B7280]">{liquidacion.vendedor?.email ?? "—"}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-[#111827]">{formatMoney(liquidacion.neto_a_cobrar, liquidacion.moneda)}</td>
                    <td className="px-5 py-4">
                      <LiquidacionStatusBadge status={liquidacion.estado} />
                    </td>
                    <td className="px-5 py-4 text-[#111827]">
                      <div className="space-y-1">
                        <p>{liquidacion.fecha_pago ? "Pagada" : "Pendiente"}</p>
                        <p className="text-xs text-[#6B7280]">{liquidacion.fecha_pago ?? liquidacion.fecha_cierre ?? "—"}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/comisiones/liquidaciones/${liquidacion.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-[#111827] transition hover:text-[#6B7280]">
                        Ver
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-sm text-[#6B7280]">
                    No hay liquidaciones cargadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
