import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { isDemoMode } from "@/lib/demo-mode";
import { mockEmpleado, mockProveedores, mockVehiculos } from "@/lib/mock-data";
import { canManageInventory } from "@/lib/auth/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAllSupabaseRows } from "@/lib/supabase/paginated";
import { InventarioTable } from "@/components/inventario/inventario-table";
import { filterByDateRange, parseDateRange } from "@/lib/date-range";
import { CollapsibleSummary } from "@/components/common/collapsible-summary";
import { SectionSubheaderActions } from "@/components/dashboard/section-subheader-actions";
import { SummaryChart } from "@/components/common/summary-chart";

export const metadata: Metadata = {
  title: "Inventario | Funes Exclusivos",
};

export const dynamic = "force-dynamic";

type Vehiculo = {
  id: string;
  marca: string | null;
  modelo: string | null;
  version: string | null;
  anio: number | null;
  color: string | null;
  km: number | null;
  dominio: string | null;
  motor: string | null;
  ubicacion: string | null;
  nro_operacion: string | null;
  proveedor_id: string | null;
  fecha_compra: string | null;
  costo_adquisicion: number | null;
  costo_moneda: string | null;
  precio_venta: number | null;
  precio_moneda: string | null;
  precio_infoauto_compra: number | null;
  precio_infoauto_actual: number | null;
  precio_infoauto_anterior: number | null;
  precio_permuta: number | null;
  precio_contado: number | null;
  costo_reposicion: number | null;
  estado: string | null;
  estado_preparacion: string | null;
  chapero: string | null;
  preparacion_comentarios: string | null;
  publicado_mercadolibre: boolean | null;
  publicado_rodados_google: boolean | null;
  fotos: string[] | string | null;
  fecha_ingreso: string | null;
  created_at: string | null;
};

type Proveedor = {
  id: string;
  nombre: string | null;
  categoria: string | null;
};

function formatPublishedTotal(vehiculos: Vehiculo[]) {
  const total = vehiculos.reduce((accumulator, vehiculo) => {
    if (vehiculo.estado !== "en_stock") return accumulator;
    return accumulator + (vehiculo.precio_venta ?? 0);
  }, 0);

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(total);
}

export default async function InventarioPage({ searchParams }: { searchParams?: { from?: string; to?: string } }) {
  const dateRange = parseDateRange(searchParams);
  let vehiculos: Vehiculo[] = mockVehiculos as unknown as Vehiculo[];
  let proveedores: Proveedor[] = mockProveedores as Proveedor[];
  let canEditInventory = canManageInventory(mockEmpleado.rol);
  let currentRole: string | null = mockEmpleado.rol;

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const [
      vehiculosResult,
      proveedoresResult,
      {
        data: { user },
      },
    ] = await Promise.all([
      fetchAllSupabaseRows((from, to) =>
        supabase
          .from("vehiculos")
          .select(
            "id,marca,modelo,version,anio,color,km,dominio,motor,ubicacion,nro_operacion,proveedor_id,fecha_compra,costo_adquisicion,costo_moneda,precio_venta,precio_moneda,precio_infoauto_compra,precio_infoauto_actual,precio_infoauto_anterior,precio_permuta,precio_contado,costo_reposicion,estado,estado_preparacion,chapero,preparacion_comentarios,publicado_mercadolibre,publicado_rodados_google,fotos,fecha_ingreso,created_at"
          )
          .order("created_at", { ascending: false })
          .range(from, to)
      ),
      supabase
        .from("proveedores")
        .select("id,nombre,categoria")
        .eq("activo", true)
        .order("nombre")
        .limit(100),
      supabase.auth.getUser(),
    ]);

    vehiculos = (vehiculosResult.data ?? []) as Vehiculo[];
    proveedores = (proveedoresResult.data ?? []) as Proveedor[];

    if (user) {
      const { data: employee } = await supabase
        .from("empleados")
        .select("id,rol,activo")
        .eq("id", user.id)
        .maybeSingle<{ id: string; rol: string | null; activo: boolean | null }>();

      currentRole = employee?.rol ?? null;
      canEditInventory = canManageInventory(currentRole) && employee?.activo === true;
    }
  }
  vehiculos = filterByDateRange(vehiculos, dateRange, (vehiculo) => vehiculo.fecha_ingreso ?? vehiculo.created_at);
  const totalVehiculos = vehiculos.length;
  const enStock = vehiculos.filter((vehiculo) => vehiculo.estado === "en_stock").length;
  const valorPublicadoTotal = formatPublishedTotal(vehiculos);
  const inventarioPorEstado = [
    ["En stock", "en_stock", "emerald"],
    ["Vendidos", "vendido", "slate"],
    ["En consignación", "en_consignacion", "amber"],
  ].map(([label, estado, tone]) => ({
    label,
    value: vehiculos.filter((vehiculo) => vehiculo.estado === estado).length,
    tone: tone as "emerald" | "slate" | "amber",
  }));
  const toolbarAction = canEditInventory ? (
    <Link
      href="/inventario/nuevo"
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#8A1538] px-4 text-sm font-medium text-white transition hover:bg-[#6F102D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D8A1B2]"
    >
      <Plus className="h-4 w-4" />
      Nuevo vehículo
    </Link>
  ) : (
    <div className="inline-flex h-10 items-center rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-sm text-[#6B7280]">
      Solo lectura
    </div>
  );

  return (
    <section className="space-y-4">
      {isDemoMode ? (
        <div className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
          Modo demo: los datos son simulados y no se guardarán cambios reales.
        </div>
      ) : null}

      <SectionSubheaderActions>{toolbarAction}</SectionSubheaderActions>

      <CollapsibleSummary sectionKey="inventario">
        <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-md border border-[#E5E7EB] bg-white p-4">
          <p className="text-sm font-medium text-[#6B7280]">Total vehículos</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">
            {totalVehiculos}
          </p>
        </article>
        <article className="rounded-md border border-[#E5E7EB] bg-white p-4">
          <p className="text-sm font-medium text-[#6B7280]">En stock</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">
            {enStock}
          </p>
        </article>
        <article className="rounded-md border border-[#E5E7EB] bg-white p-4">
          <p className="text-sm font-medium text-[#6B7280]">
            Valor publicado total
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">
            {valorPublicadoTotal}
          </p>
        </article>
        </div>
        <SummaryChart
          title="Distribución del inventario"
          description="Unidades agrupadas por estado actual."
          items={inventarioPorEstado}
        />
      </CollapsibleSummary>

      <InventarioTable
        vehiculos={vehiculos as Vehiculo[]}
        proveedores={proveedores}
        canEdit={canEditInventory}
        role={currentRole}
      />
    </section>
  );
}
