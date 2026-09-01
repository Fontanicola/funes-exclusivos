"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { updateCompraVehiculoAction } from "@/app/(dashboard)/compras/actions";

type Provider = { id: string; nombre: string | null; categoria: string | null };
type Compra = { id: string; fecha: string | null; nro_operacion: string | null; proveedor_id: string | null; precio_compra: number | null; precio_boleto: number | null; moneda: string | null; diferencia_b: number | null; deuda_pendiente: number | null; observaciones: string | null };

function Submit() { const { pending } = useFormStatus(); return <button disabled={pending} className="h-10 rounded-md bg-[#8A1538] px-4 text-sm font-medium text-white disabled:opacity-60">{pending ? "Guardando..." : "Guardar cambios"}</button>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="space-y-1.5 text-sm font-medium text-[#111827]"><span>{label}</span>{children}</label>; }
const input = "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm font-normal outline-none focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]";

export function CompraEditForm({ compra, proveedores }: { compra: Compra; proveedores: Provider[] }) {
  const [state, action] = useFormState(updateCompraVehiculoAction, {});
  return <form action={action} className="space-y-5 rounded-md border border-[#E5E7EB] bg-white p-5">
    <input type="hidden" name="id" value={compra.id} />
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Fecha"><input className={input} type="date" name="fecha" defaultValue={compra.fecha?.slice(0, 10) ?? ""} required /></Field>
      <Field label="Nro. operación"><input className={input} name="nro_operacion" defaultValue={compra.nro_operacion ?? ""} /></Field>
      <Field label="Proveedor"><select className={input} name="proveedor_id" defaultValue={compra.proveedor_id ?? ""}><option value="">Sin proveedor</option>{proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre ?? "Proveedor"}{p.categoria ? ` · ${p.categoria}` : ""}</option>)}</select></Field>
      <Field label="Moneda"><select className={input} name="moneda" defaultValue={compra.moneda ?? "ARS"}><option>ARS</option><option>USD</option></select></Field>
      <Field label="Precio compra"><input className={input} type="number" min="0" step="0.01" name="precio_compra" defaultValue={compra.precio_compra ?? ""} required /></Field>
      <Field label="Deuda pendiente"><input className={input} type="number" min="0" step="0.01" name="deuda_pendiente" defaultValue={compra.deuda_pendiente ?? ""} /></Field>
    </div>
    <Field label="Observaciones"><textarea className="min-h-24 w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-sm font-normal outline-none focus:border-[#8A1538]" name="observaciones" defaultValue={compra.observaciones ?? ""} /></Field>
    {state.error ? <p className="text-sm text-[#8A1538]">{state.error}</p> : null}
    <div className="flex justify-end gap-2 border-t border-[#E5E7EB] pt-4"><Link href="/compras" className="inline-flex h-10 items-center rounded-md border border-[#E5E7EB] px-4 text-sm font-medium">Cancelar</Link><Submit /></div>
  </form>;
}
