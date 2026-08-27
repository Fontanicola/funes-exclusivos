"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateVentaAction } from "@/app/(dashboard)/ventas/actions";

type Seller = { id: string; nombre: string | null; email: string | null };
type Sale = { id: string; fecha_venta: string | null; cliente_nombre: string | null; cliente_telefono: string | null; cliente_email: string | null; cliente_documento: string | null; precio_venta: number | null; moneda: string | null; metodo_pago: string | null; vendedor_id: string | null; saldo_preventa: number | null; saldo_efectivo: number | null; observaciones: string | null };
const input = "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm font-normal outline-none focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]";
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="space-y-1.5 text-sm font-medium text-[#111827]"><span>{label}</span>{children}</label>; }
function Submit() { const { pending } = useFormStatus(); return <button disabled={pending} className="h-10 rounded-md bg-[#8A1538] px-4 text-sm font-medium text-white disabled:opacity-60">{pending ? "Guardando..." : "Guardar cambios"}</button>; }

export function VentaEditForm({ venta, vendedores }: { venta: Sale; vendedores: Seller[] }) {
  const [state, action] = useFormState(updateVentaAction, {});
  return <form action={action} className="space-y-5 rounded-md border border-[#E5E7EB] bg-white p-5">
    <input type="hidden" name="id" value={venta.id} />
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Fecha de venta"><input className={input} type="date" name="fecha_venta" defaultValue={venta.fecha_venta?.slice(0, 10) ?? ""} required /></Field>
      <Field label="Vendedor"><select className={input} name="vendedor_id" defaultValue={venta.vendedor_id ?? ""}><option value="">Sin cambio</option>{vendedores.map((v) => <option key={v.id} value={v.id}>{v.nombre ?? v.email ?? "Vendedor"}</option>)}</select></Field>
      <Field label="Cliente"><input className={input} name="cliente_nombre" defaultValue={venta.cliente_nombre ?? ""} required /></Field>
      <Field label="Teléfono"><input className={input} name="cliente_telefono" defaultValue={venta.cliente_telefono ?? ""} /></Field>
      <Field label="Email"><input className={input} type="email" name="cliente_email" defaultValue={venta.cliente_email ?? ""} /></Field>
      <Field label="Documento"><input className={input} name="cliente_documento" defaultValue={venta.cliente_documento ?? ""} /></Field>
      <Field label="Precio venta"><input className={input} type="number" min="0" step="0.01" name="precio_venta" defaultValue={venta.precio_venta ?? ""} required /></Field>
      <Field label="Moneda"><select className={input} name="moneda" defaultValue={venta.moneda ?? "ARS"}><option>ARS</option><option>USD</option></select></Field>
      <Field label="Método de pago"><select className={input} name="metodo_pago" defaultValue={venta.metodo_pago ?? "transferencia"}><option value="transferencia">Transferencia</option><option value="efectivo">Efectivo</option><option value="dolares">Dólares</option><option value="pesos">Pesos</option><option value="permuta">Permuta</option></select></Field>
      <Field label="Saldo preventa"><input className={input} type="number" min="0" step="0.01" name="saldo_preventa" defaultValue={venta.saldo_preventa ?? ""} /></Field>
      <Field label="Saldo efectivo"><input className={input} type="number" min="0" step="0.01" name="saldo_efectivo" defaultValue={venta.saldo_efectivo ?? ""} /></Field>
    </div>
    <Field label="Observaciones"><textarea className="min-h-24 w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-sm font-normal outline-none focus:border-[#8A1538]" name="observaciones" defaultValue={venta.observaciones ?? ""} /></Field>
    {state.error ? <p className="text-sm text-[#8A1538]">{state.error}</p> : null}
    <div className="flex justify-end gap-2 border-t border-[#E5E7EB] pt-4"><Link href="/ventas" className="inline-flex h-10 items-center rounded-md border border-[#E5E7EB] px-4 text-sm font-medium">Cancelar</Link><Submit /></div>
  </form>;
}
