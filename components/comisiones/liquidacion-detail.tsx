"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { updateLiquidacionEstadoAction } from "@/app/(dashboard)/comisiones/liquidaciones/actions";

type Liquidacion = {
  id: string;
  periodo: string | null;
  estado: string | null;
  moneda: string | null;
  neto_a_cobrar: number | null;
  fecha_pago: string | null;
  fecha_cierre: string | null;
  observaciones: string | null;
  vendedor: {
    id: string;
    nombre: string | null;
    email: string | null;
  } | null;
};

type ActionState = {
  error?: string;
  success?: boolean;
  warning?: string;
};

const initialState: ActionState = {};

const MEDIOS_CAJA = [
  "efectivo",
  "banco_santander",
  "cheques_terceros",
  "dolares",
  "car_france",
  "renault_credit",
  "kyoto",
  "metz",
  "avec",
  "mg",
  "cta_hab_sol",
  "otro",
] as const;

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatMoney(value: number | null, currency: string | null) {
  if (value == null) return "—";
  const isoCurrency = (currency ?? "").toUpperCase() === "USD" ? "USD" : "ARS";
  const symbol = isoCurrency === "USD" ? "US$" : "$";
  const formatted = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(value);

  return `${symbol} ${formatted}`;
}

function formatPeriod(value: string | null) {
  if (!value) return "Sin período";
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) return value;
  return `${match[2]}/${match[1]}`;
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

function StatusButton({ liquidacionId, estado, label, disabled }: { liquidacionId: string; estado: "borrador" | "cerrada" | "anulada"; label: string; disabled?: boolean }) {
  const [state, formAction] = useFormState(updateLiquidacionEstadoAction, initialState);

  return (
    <div className="space-y-1">
      <form action={formAction as any}>
        <input type="hidden" name="liquidacion_id" value={liquidacionId} />
        <input type="hidden" name="estado" value={estado} />
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex h-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {label}
        </button>
      </form>
      {state.error ? <p className="text-xs text-[#991B1B]">{state.error}</p> : null}
    </div>
  );
}

function PaymentForm({ liquidacion }: { liquidacion: Liquidacion }) {
  const [state, formAction] = useFormState(updateLiquidacionEstadoAction, initialState);
  const [open, setOpen] = useState(false);
  const currentState = (liquidacion.estado ?? "borrador").toLowerCase();

  if (currentState === "pagada" || currentState === "anulada") {
    return null;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center justify-center rounded-xl bg-[#18181B] px-3.5 text-xs font-medium text-white transition hover:bg-[#27272A]"
      >
        Marcar pagada
      </button>
    );
  }

  return (
    <form action={formAction as any} className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
      <input type="hidden" name="liquidacion_id" value={liquidacion.id} />
      <input type="hidden" name="estado" value="pagada" />
      <div className="space-y-2">
        <label htmlFor="medio_caja" className="text-sm font-medium text-[#111827]">Medio de caja *</label>
        <select id="medio_caja" name="medio_caja" defaultValue="efectivo" required className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]">
          {MEDIOS_CAJA.map((medio) => (
            <option key={medio} value={medio}>
              {medio.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="cuenta_caja" className="text-sm font-medium text-[#111827]">Cuenta Caja</label>
        <input id="cuenta_caja" name="cuenta_caja" placeholder="Cuenta o subcuenta" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]" />
      </div>
      <div className="space-y-2">
        <label htmlFor="concepto_caja" className="text-sm font-medium text-[#111827]">Concepto Caja</label>
        <input id="concepto_caja" name="concepto_caja" defaultValue="Pago de comisión" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]" />
      </div>
      <p className="text-xs leading-5 text-[#6B7280]">
        Al marcar como pagada, se generará un egreso automático en Caja por el neto a cobrar.
      </p>
      {state.error ? (
        <div className="rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] px-3 py-2 text-sm text-[#991B1B]">
          {state.error}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-[#18181B] px-3.5 text-xs font-medium text-white transition hover:bg-[#27272A]"
        >
          Confirmar pago
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex h-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-3.5 text-xs font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function LiquidacionDetail({ liquidacion }: { liquidacion: Liquidacion }) {
  const currentState = (liquidacion.estado ?? "borrador").toLowerCase();
  const locked = currentState === "anulada" || currentState === "pagada";
  const vendorLabel = [liquidacion.vendedor?.nombre, liquidacion.vendedor?.email].filter(Boolean).join(" · ") || "—";

  return (
    <section className="space-y-6">
      {locked ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-sm text-[#6B7280]">
          {currentState === "pagada"
            ? "La liquidación ya fue pagada y quedó bloqueada para edición."
            : "La liquidación fue anulada y no admite nuevas acciones."}
        </div>
      ) : null}

      <article className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#E5E7EB] pb-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <LiquidacionStatusBadge status={liquidacion.estado} />
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight text-[#111827]">
                Liquidación {formatPeriod(liquidacion.periodo)}
              </h2>
              <p className="text-sm text-[#6B7280]">{vendorLabel}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">Neto a cobrar</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#111827]">
              {formatMoney(liquidacion.neto_a_cobrar, liquidacion.moneda)}
            </p>
            <p className="mt-1 text-xs text-[#6B7280]">
              {liquidacion.fecha_pago ? `Pagada el ${formatDate(liquidacion.fecha_pago)}` : liquidacion.fecha_cierre ? `Cerrada el ${formatDate(liquidacion.fecha_cierre)}` : "Pendiente de definición"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 py-5 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">Vendedor</p>
            <p className="text-sm font-medium text-[#111827]">{liquidacion.vendedor?.nombre ?? "—"}</p>
            <p className="text-sm text-[#6B7280]">{liquidacion.vendedor?.email ?? "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">Período</p>
            <p className="text-sm font-medium text-[#111827]">{formatPeriod(liquidacion.periodo)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">Estado</p>
            <p className="text-sm font-medium text-[#111827] capitalize">{liquidacion.estado ?? "borrador"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">Moneda</p>
            <p className="text-sm font-medium text-[#111827]">{(liquidacion.moneda ?? "ARS").toUpperCase()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">Fecha pago</p>
            <p className="text-sm font-medium text-[#111827]">{formatDate(liquidacion.fecha_pago)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">Fecha cierre</p>
            <p className="text-sm font-medium text-[#111827]">{formatDate(liquidacion.fecha_cierre)}</p>
          </div>
        </div>

        {liquidacion.observaciones ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">Observaciones</p>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">{liquidacion.observaciones}</p>
          </div>
        ) : null}
      </article>

      <div className="flex flex-wrap items-center gap-2">
        {!locked ? <PaymentForm liquidacion={liquidacion} /> : null}
        {!locked ? (
          <>
            <StatusButton liquidacionId={liquidacion.id} estado="cerrada" label="Cerrar" />
            <StatusButton liquidacionId={liquidacion.id} estado="borrador" label="Borrador" />
            <StatusButton liquidacionId={liquidacion.id} estado="anulada" label="Anular" />
          </>
        ) : null}
      </div>
    </section>
  );
}
