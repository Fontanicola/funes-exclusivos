import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PencilLine } from "lucide-react";
import { isDemoMode } from "@/lib/demo-mode";
import { canManageInventory } from "@/lib/auth/permissions";
import { mockEmpleado, mockVehiculoDocumentos, mockVehiculos } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { VehiculoDetail } from "@/components/inventario/vehiculo-detail";
import { VehiculoDocumentoForm } from "@/components/inventario/vehiculo-documento-form";
import { VehiculoDocumentosTable } from "@/components/inventario/vehiculo-documentos-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vehículo | Funes Exclusivos",
};

type PageProps = {
  params: {
    id: string;
  };
};

type Proveedor = {
  id: string;
  nombre: string | null;
  categoria: string | null;
};

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
  descripcion: string | null;
  observaciones: string | null;
  created_at: string | null;
  proveedor?: Proveedor | null;
};

type VehiculoDocumento = {
  id: string;
  vehiculo_id: string | null;
  tramite_id: string | null;
  venta_id: string | null;
  compra_id: string | null;
  tipo: string | null;
  estado: string | null;
  titulo: string | null;
  descripcion: string | null;
  archivo_path: string | null;
  archivo_nombre: string | null;
  archivo_mime_type: string | null;
  archivo_size_bytes: number | null;
  fecha_emision: string | null;
  fecha_vencimiento: string | null;
  observaciones: string | null;
  created_at: string | null;
  updated_at: string | null;
  tramite?: {
    id: string;
    titulo: string | null;
    tipo: string | null;
    estado: string | null;
    fecha_vencimiento: string | null;
  } | null;
  venta?: {
    id: string;
    cliente_nombre: string | null;
    fecha_venta: string | null;
  } | null;
  compra?: {
    id: string;
    nro_operacion: string | null;
    fecha: string | null;
    proveedor?: {
      id: string;
      nombre: string | null;
    } | null;
  } | null;
  vehiculo?: {
    id: string;
    marca: string | null;
    modelo: string | null;
    dominio: string | null;
  } | null;
};

function sortDocuments(documentos: VehiculoDocumento[]) {
  return [...documentos].sort((left, right) => {
    const leftStatus = (left.estado ?? "").toLowerCase();
    const rightStatus = (right.estado ?? "").toLowerCase();
    const rank = (status: string, due: string | null | undefined) => {
      if (status === "vencido") return 0;
      if (due && new Date(due).getTime() < Date.now()) return 0;
      if (status === "pendiente") return 1;
      if (status === "observado") return 2;
      if (status === "recibido") return 3;
      return 4;
    };

    const rankDiff = rank(leftStatus, left.fecha_vencimiento) - rank(rightStatus, right.fecha_vencimiento);
    if (rankDiff) return rankDiff;

    const leftDue = left.fecha_vencimiento ? new Date(left.fecha_vencimiento).getTime() : Number.POSITIVE_INFINITY;
    const rightDue = right.fecha_vencimiento ? new Date(right.fecha_vencimiento).getTime() : Number.POSITIVE_INFINITY;
    if (leftDue !== rightDue) return leftDue - rightDue;

    const leftCreated = left.created_at ? new Date(left.created_at).getTime() : 0;
    const rightCreated = right.created_at ? new Date(right.created_at).getTime() : 0;
    return rightCreated - leftCreated;
  });
}

function getDemoVehicle(id: string) {
  return mockVehiculos.find((vehicle) => vehicle.id === id) ?? null;
}

function getDemoDocuments(id: string) {
  return mockVehiculoDocumentos.filter((documento) => documento.vehiculo_id === id);
}

async function loadData(id: string) {
  if (isDemoMode) {
    const vehiculo = getDemoVehicle(id);
    if (!vehiculo) return null;
    const canEditVehicle = canManageInventory(mockEmpleado.rol);

    return {
      vehiculo: {
        ...vehiculo,
        proveedor: null,
      } as unknown as Vehiculo,
      documentos: sortDocuments(getDemoDocuments(id) as VehiculoDocumento[]),
      canManageDocuments: mockEmpleado.rol === "admin" || mockEmpleado.rol === "gestor",
      canDeleteDocuments: mockEmpleado.rol === "admin",
      canEditVehicle,
    };
  }

  const supabase = createSupabaseServerClient();
  const [
    vehicleResult,
    providerResult,
    documentsResult,
    {
      data: { user },
    },
  ] = await Promise.all([
    supabase
      .from("vehiculos")
      .select(
        "id,marca,modelo,version,anio,color,km,dominio,motor,ubicacion,nro_operacion,proveedor_id,fecha_compra,costo_adquisicion,costo_moneda,precio_venta,precio_moneda,precio_infoauto_compra,precio_infoauto_actual,precio_infoauto_anterior,precio_permuta,precio_contado,costo_reposicion,estado,estado_preparacion,chapero,preparacion_comentarios,publicado_mercadolibre,publicado_rodados_google,fotos,fecha_ingreso,descripcion,observaciones,created_at"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("proveedores")
      .select("id,nombre,categoria")
      .eq("activo", true),
    supabase
      .from("vehiculo_documentos")
      .select(
        "id,vehiculo_id,tramite_id,venta_id,compra_id,tipo,estado,titulo,descripcion,archivo_path,archivo_nombre,archivo_mime_type,archivo_size_bytes,fecha_emision,fecha_vencimiento,observaciones,created_at,updated_at,tramite:gestoria_tramites!vehiculo_documentos_tramite_id_fkey(id,titulo,tipo,estado,fecha_vencimiento),venta:ventas!vehiculo_documentos_venta_id_fkey(id,cliente_nombre,fecha_venta),compra:compras_vehiculos!vehiculo_documentos_compra_id_fkey(id,nro_operacion,fecha,proveedor:proveedores!compras_vehiculos_proveedor_id_fkey(id,nombre)),vehiculo:vehiculos!vehiculo_documentos_vehiculo_id_fkey(id,marca,modelo,dominio)"
      )
      .eq("vehiculo_id", id),
    supabase.auth.getUser(),
  ]);

  if (!user) return null;

  const { data: employee } = await supabase
    .from("empleados")
    .select("id,nombre,email,rol,activo")
    .eq("id", user.id)
    .maybeSingle();

  if (!employee || employee.activo === false) return null;

  const vehicle = vehicleResult.data as Vehiculo | null;
  if (!vehicle) return null;

  const providers = (providerResult.data ?? []) as Proveedor[];
  const provider = vehicle.proveedor_id
    ? providers.find((item) => item.id === vehicle.proveedor_id) ?? null
    : null;

  const documentos = sortDocuments((documentsResult.data ?? []) as unknown as VehiculoDocumento[]);

  return {
    vehiculo: {
      ...vehicle,
      proveedor: provider,
    },
    documentos,
    canManageDocuments: (employee.rol ?? "").toLowerCase() === "admin" || (employee.rol ?? "").toLowerCase() === "gestor",
    canDeleteDocuments: (employee.rol ?? "").toLowerCase() === "admin",
    canEditVehicle: canManageInventory(employee?.rol ?? null) && employee?.activo === true,
  };
}

export default async function VehiculoDetailPage({ params }: PageProps) {
  const data = await loadData(params.id);

  if (!data) {
    notFound();
  }

  const subtitle = [
    [data.vehiculo.marca, data.vehiculo.modelo, data.vehiculo.version].filter(Boolean).join(" "),
    data.vehiculo.dominio,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <Link
          href="/inventario"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#111827]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inventario
        </Link>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
              {subtitle || "Vehículo"}
            </h1>
            <p className="text-sm leading-6 text-[#6B7280]">
              Ficha interna, documentos y estado operativo del vehículo.
            </p>
          </div>

          <Link
            href={`/inventario/${data.vehiculo.id}/editar`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A]"
          >
            <PencilLine className="h-4 w-4" />
            Editar vehículo
          </Link>
        </div>
      </header>

      <VehiculoDetail vehiculo={data.vehiculo} canEdit={data.canEditVehicle} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        {data.canManageDocuments ? (
          <VehiculoDocumentoForm vehiculoId={data.vehiculo.id} />
        ) : (
          <section className="rounded-[32px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-5 text-sm text-[#6B7280]">
              Solo admin y gestor pueden cargar o modificar documentos.
            </div>
          </section>
        )}

        <VehiculoDocumentosTable
          documentos={data.documentos}
          vehiculoId={data.vehiculo.id}
          canManage={data.canManageDocuments}
          canDelete={data.canDeleteDocuments}
        />
      </div>
    </section>
  );
}
