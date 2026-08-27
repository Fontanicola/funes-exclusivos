import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import { mockEmpleado, mockVentas } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { VentaEditForm } from "@/components/ventas/venta-edit-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Editar venta | Funes Exclusivos" };

export default async function EditarVentaPage({ params }: { params: { id: string } }) {
  let venta: any = isDemoMode ? mockVentas.find((item) => item.id === params.id) : null;
  let vendedores: any[] = isDemoMode ? [mockEmpleado] : [];
  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const [{ data: ventaData }, { data: sellerData }] = await Promise.all([
      supabase.from("ventas").select("id,fecha_venta,cliente_nombre,cliente_telefono,cliente_email,cliente_documento,precio_venta,moneda,metodo_pago,vendedor_id,saldo_preventa,saldo_efectivo,observaciones").eq("id", params.id).maybeSingle(),
      supabase.from("empleados").select("id,nombre,email").eq("activo", true).eq("rol", "vendedor").order("nombre"),
    ]);
    venta = ventaData;
    vendedores = sellerData ?? [];
  }
  if (!venta) notFound();
  return <section className="max-w-4xl space-y-6"><Link href="/ventas" className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#111827]"><ArrowLeft className="h-4 w-4" />Volver a ventas</Link><div><h1 className="text-2xl font-semibold text-[#111827]">Editar venta</h1><p className="mt-1 text-sm text-[#6B7280]">Actualizá los datos del cliente, vendedor y operación.</p></div><VentaEditForm venta={venta} vendedores={vendedores} /></section>;
}
