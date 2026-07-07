"use client";

import { useFormState } from "react-dom";
import { deleteGestoriaPresupuestoItemAction, updateGestoriaPresupuestoEstadoAction } from "@/app/(dashboard)/gestoria/presupuestos/actions";
import { PresupuestoItemTypeBadge } from "./presupuesto-item-type-badge";
import { PresupuestoStatusBadge } from "./presupuesto-status-badge";
import { PresupuestoItemForm } from "./presupuesto-item-form";

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

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR").format(date);
}

function formatMoney(value: number | null, currency: string | null) {
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

function getVehicleLabel(presupuesto: Presupuesto) {
  return [presupuesto.vehiculo?.marca, presupuesto.vehiculo?.modelo].filter(Boolean).join(" ") || "—";
}

function getVehicleSubtitle(presupuesto: Presupuesto) {
  return [presupuesto.vehiculo?.version, presupuesto.vehiculo?.anio ? String(presupuesto.vehiculo.anio) : null, presupuesto.vehiculo?.dominio]
    .filter(Boolean)
    .join(" · ") || "—";
}

function getItemKey(item: Item) {
  return item.id;
}

function StatusActions({ presupuestoId, estado }: { presupuestoId: string; estado: string | null }) {
  const [, formAction] = useFormState(updateGestoriaPresupuestoEstadoAction, {});
  const current = (estado ?? "borrador").toLowerCase();
  const disabled = current === "anulado" || current === "facturado";

  return (
    <form action={formAction as any} className="flex flex-wrap gap-2">
      <input type="hidden" name="presupuesto_id" value={presupuestoId} />
      {(["enviado", "aprobado", "rechazado", "facturado", "anulado"] as const).map((nextState) => (
        <button
          key={nextState}
          name="estado"
          value={nextState}
          disabled={disabled && nextState !== "anulado"}
          className="inline-flex h-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
        >
          {nextState.charAt(0).toUpperCase() + nextState.slice(1)}
        </button>
      ))}
    </form>
  );
}

function DeleteItemForm({ itemId, presupuestoId }: { itemId: string; presupuestoId: string }) {
  const [, formAction] = useFormState(deleteGestoriaPresupuestoItemAction, {});
  return (
    <form className="inline-flex" action={formAction as any}>
      <input type="hidden" name="item_id" value={itemId} />
      <input type="hidden" name="presupuesto_id" value={presupuestoId} />
      <button
        type="submit"
        className="text-xs font-medium text-[#6B7280] transition hover:text-[#111827]"
      >
        Eliminar
      </button>
    </form>
  );
}

export function PresupuestoDetail({
  presupuesto,
  items,
}: {
  presupuesto: Presupuesto;
  items: Item[];
}) {
  const isLocked = ["anulado", "facturado"].includes((presupuesto.estado ?? "").toLowerCase());

  return (
    <section className="space-y-6">
      {isLocked ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-sm text-[#6B7280]">
          Este presupuesto está bloqueado para edición porque ya fue facturado o anulado.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#E5E7EB] pb-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <PresupuestoStatusBadge status={presupuesto.estado} />
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight text-[#111827]">{presupuesto.cliente_nombre ?? "Sin cliente"}</h2>
                <p className="text-sm text-[#6B7280]">{formatDate(presupuesto.fecha)}</p>
              </div>
            </div>
            <StatusActions presupuestoId={presupuesto.id} estado={presupuesto.estado} />
          </div>

          <div className="grid gap-4 py-5 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">Cliente</p>
              <p className="text-sm font-medium text-[#111827]">{presupuesto.cliente_nombre ?? "—"}</p>
              <p className="text-sm text-[#6B7280]">
                {presupuesto.cliente_telefono ?? presupuesto.cliente_email ?? presupuesto.cliente_documento ?? "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">Vehículo</p>
              <p className="text-sm font-medium text-[#111827]">{getVehicleLabel(presupuesto)}</p>
              <p className="text-sm text-[#6B7280]">{getVehicleSubtitle(presupuesto)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">Valor vehículo</p>
              <p className="text-sm font-medium text-[#111827]">{formatMoney(presupuesto.valor_vehiculo, presupuesto.moneda)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">Subtotal / Total</p>
              <p className="text-sm font-medium text-[#111827]">
                {formatMoney(presupuesto.subtotal, presupuesto.moneda)} · {formatMoney(presupuesto.total, presupuesto.moneda)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">Tabla DNRPA / API</p>
              <p className="text-sm font-medium text-[#111827]">
                {formatMoney(presupuesto.valor_tabla_dnrpa, presupuesto.moneda)} · {formatMoney(presupuesto.valor_tabla_api, presupuesto.moneda)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">Links</p>
              <div className="flex flex-wrap gap-2 text-sm">
                {presupuesto.link_dnrpa ? (
                  <a href={presupuesto.link_dnrpa} target="_blank" rel="noreferrer" className="rounded-full border border-[#E5E7EB] px-3 py-1.5 text-[#111827] transition hover:bg-[#F9FAFB]">
                    DNRPA
                  </a>
                ) : null}
                {presupuesto.link_api ? (
                  <a href={presupuesto.link_api} target="_blank" rel="noreferrer" className="rounded-full border border-[#E5E7EB] px-3 py-1.5 text-[#111827] transition hover:bg-[#F9FAFB]">
                    API
                  </a>
                ) : null}
                {!presupuesto.link_dnrpa && !presupuesto.link_api ? (
                  <span className="text-sm text-[#6B7280]">—</span>
                ) : null}
              </div>
            </div>
          </div>

          {presupuesto.observaciones ? (
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">Observaciones</p>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">{presupuesto.observaciones}</p>
            </div>
          ) : null}
        </article>

        <aside className="space-y-4">
          <article className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-[#111827]">Ítems</h3>
            <div className="mt-4 space-y-3">
              {items.length ? (
                items.map((item) => (
                  <div key={getItemKey(item)} className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <PresupuestoItemTypeBadge type={item.tipo} />
                        <p className="text-sm font-medium text-[#111827]">{item.descripcion ?? "Sin descripción"}</p>
                        <p className="text-xs text-[#6B7280]">{formatMoney(item.monto, item.moneda)}</p>
                      </div>
                      <DeleteItemForm itemId={item.id} presupuestoId={presupuesto.id} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#6B7280]">Todavía no hay ítems cargados.</p>
              )}
            </div>
          </article>

          <PresupuestoItemForm presupuestoId={presupuesto.id} />
        </aside>
      </div>
    </section>
  );
}
