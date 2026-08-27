import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import { mockComprasVehiculos, mockProveedores } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CompraEditForm } from "@/components/compras/compra-edit-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Editar compra | Funes Exclusivos" };

export default async function EditarCompraPage({ params }: { params: { id: string } }) {
  let compra: any = isDemoMode ? mockComprasVehiculos.find((item) => item.id === params.id) : null;
  let proveedores: any[] = isDemoMode ? mockProveedores : [];
  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const [{ data: compraData }, { data: providerData }] = await Promise.all([
      supabase.from("compras_vehiculos").select("id,fecha,nro_operacion,proveedor_id,precio_compra,precio_boleto,moneda,diferencia_b,deuda_pendiente,observaciones").eq("id", params.id).maybeSingle(),
      supabase.from("proveedores").select("id,nombre,categoria").eq("activo", true).order("nombre"),
    ]);
    compra = compraData;
    proveedores = providerData ?? [];
  }
  if (!compra) notFound();
  return <section className="max-w-4xl space-y-6"><Link href="/compras" className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#111827]"><ArrowLeft className="h-4 w-4" />Volver a compras</Link><div><h1 className="text-2xl font-semibold text-[#111827]">Editar compra</h1><p className="mt-1 text-sm text-[#6B7280]">Actualizá la operación y sus valores asociados.</p></div><CompraEditForm compra={compra} proveedores={proveedores} /></section>;
}
