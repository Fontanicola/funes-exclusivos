"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { PaginationControls } from "@/components/common/pagination-controls";

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

const PAGE_SIZE = 10;

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

function StatusBadge({ status }: { status: string | null }) {
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

export function LiquidacionesTable({ liquidaciones }: { liquidaciones: Liquidacion[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(liquidaciones.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleLiquidaciones = liquidaciones.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="overflow-hidden rounded-md border border-[#E5E7EB] bg-white">
      <div className="border-b border-[#E5E7EB] px-5 py-4">
        <h2 className="text-base font-semibold text-[#111827]">Listado</h2>
        <p className="text-sm text-[#6B7280]">Neto pendiente, pagado o cerrado por período.</p>
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
            {visibleLiquidaciones.length ? visibleLiquidaciones.map((liquidacion) => (
              <tr key={liquidacion.id} className="transition hover:bg-[#F9FAFB]">
                <td className="whitespace-nowrap px-5 py-4 text-[#111827]">{formatPeriod(liquidacion.periodo)}</td>
                <td className="px-5 py-4">
                  <p className="font-medium text-[#111827]">{liquidacion.vendedor?.nombre ?? "—"}</p>
                  <p className="text-xs text-[#6B7280]">{liquidacion.periodo ?? "Sin período"}</p>
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-medium text-[#111827]">{formatMoney(liquidacion.neto_a_cobrar, liquidacion.moneda)}</td>
                <td className="px-5 py-4"><StatusBadge status={liquidacion.estado} /></td>
                <td className="px-5 py-4 text-[#111827]">
                  <p>{liquidacion.fecha_pago ? "Pagada" : "Pendiente"}</p>
                  <p className="text-xs text-[#6B7280]">{liquidacion.fecha_pago ?? liquidacion.fecha_cierre ?? "—"}</p>
                </td>
                <td className="px-5 py-4">
                  <Link href={`/comisiones/liquidaciones/${liquidacion.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-[#8A1538] underline decoration-[#D8A1B2] underline-offset-4 transition hover:text-[#6F102D]">
                    Ver <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-5 py-16 text-center text-sm text-[#6B7280]">No hay liquidaciones cargadas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginationControls page={currentPage} totalItems={liquidaciones.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </div>
  );
}
