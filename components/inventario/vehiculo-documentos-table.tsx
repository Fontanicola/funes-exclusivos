"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  deleteVehiculoDocumentoAction,
  getVehiculoDocumentoSignedUrlAction,
  updateVehiculoDocumentoEstadoAction,
} from "@/app/(dashboard)/inventario/[id]/documentos/actions";
import { VehiculoDocumentoStatusBadge } from "./vehiculo-documento-status-badge";
import { VehiculoDocumentoTypeBadge } from "./vehiculo-documento-type-badge";

type Relation = {
  id: string;
  titulo?: string | null;
  tipo?: string | null;
  estado?: string | null;
  fecha_vencimiento?: string | null;
  fecha_venta?: string | null;
  cliente_nombre?: string | null;
  marca?: string | null;
  modelo?: string | null;
  dominio?: string | null;
  nro_operacion?: string | null;
  fecha?: string | null;
  proveedor?: {
    id: string;
    nombre: string | null;
  } | null;
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
  vehiculo?: {
    id: string;
    marca: string | null;
    modelo: string | null;
    dominio: string | null;
  } | null;
  tramite?: Relation | null;
  venta?: Relation | null;
  compra?: Relation | null;
};

const statuses = ["", "pendiente", "recibido", "observado", "vencido", "archivado"] as const;
const types = [
  "",
  "titulo",
  "cedula",
  "factura",
  "boleto",
  "permiso",
  "comprobante_pago",
  "informe_dominio",
  "verificacion_policial",
  "seguro",
  "patente",
  "formulario",
  "otro",
] as const;

function getStatusLabel(status: string) {
  if (status === "pendiente") return "Pendiente";
  if (status === "recibido") return "Recibido";
  if (status === "observado") return "Observado";
  if (status === "vencido") return "Vencido";
  if (status === "archivado") return "Archivado";
  return status;
}

function getTypeLabel(type: string) {
  if (type === "titulo") return "Título";
  if (type === "cedula") return "Cédula";
  if (type === "factura") return "Factura";
  if (type === "boleto") return "Boleto";
  if (type === "permiso") return "Permiso";
  if (type === "comprobante_pago") return "Comprobante de pago";
  if (type === "informe_dominio") return "Informe de dominio";
  if (type === "verificacion_policial") return "Verificación policial";
  if (type === "seguro") return "Seguro";
  if (type === "patente") return "Patente";
  if (type === "formulario") return "Formulario";
  if (type === "otro") return "Otro";
  return type;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR").format(parsed);
}

function isOverdue(documento: VehiculoDocumento) {
  if (documento.estado === "archivado") return false;
  if (documento.estado === "vencido") return true;
  if (!documento.fecha_vencimiento) return false;
  const parsed = new Date(documento.fecha_vencimiento);
  if (Number.isNaN(parsed.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed.getTime() < today.getTime();
}

function getSearchableText(documento: VehiculoDocumento) {
  return [
    documento.titulo,
    documento.descripcion,
    documento.observaciones,
    documento.tipo,
    documento.vehiculo?.marca,
    documento.vehiculo?.modelo,
    documento.vehiculo?.dominio,
    documento.tramite?.titulo,
    documento.tramite?.tipo,
    documento.venta?.cliente_nombre,
    documento.compra?.nro_operacion,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getLinkLabel(documento: VehiculoDocumento) {
  if (documento.tramite) {
    return documento.tramite.titulo ?? documento.tramite.tipo ?? "Trámite";
  }

  if (documento.venta) {
    return [
      documento.venta.cliente_nombre ?? "Venta",
      documento.venta.fecha_venta ? formatDate(documento.venta.fecha_venta) : null,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  if (documento.compra) {
    return [
      documento.compra.nro_operacion ?? "Compra",
      documento.compra.proveedor?.nombre ?? null,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  if (documento.vehiculo) {
    return [documento.vehiculo.marca, documento.vehiculo.modelo, documento.vehiculo.dominio]
      .filter(Boolean)
      .join(" · ");
  }

  return "Manual";
}

function getLinkDetail(documento: VehiculoDocumento) {
  if (documento.tramite) return "Trámite vinculado";
  if (documento.venta) return "Venta vinculada";
  if (documento.compra) return "Compra vinculada";
  if (documento.vehiculo) return "Vehículo principal";
  return "Carga manual";
}

function getFileSizeLabel(size: number | null) {
  if (!size || size <= 0) return "—";
  const mb = size / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
  }
  const kb = size / 1024;
  return `${kb.toFixed(kb >= 10 ? 0 : 1)} KB`;
}

function SignedUrlButton({ documento }: { documento: VehiculoDocumento }) {
  const popupRef = useRef<Window | null>(null);
  const [state, formAction] = useFormState(getVehiculoDocumentoSignedUrlAction, {});

  useEffect(() => {
    if (!state.signedUrl) return;
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.location.href = state.signedUrl;
      popupRef.current.focus();
      return;
    }

    window.open(state.signedUrl, "_blank", "noopener,noreferrer");
    popupRef.current = null;
  }, [state.signedUrl]);

  return (
    <form action={formAction} className="space-y-1">
      <input type="hidden" name="documento_id" value={documento.id} />
      <button
        type="submit"
        onClick={() => {
          popupRef.current = window.open("", "_blank");
        }}
        className="inline-flex h-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
      >
        Abrir
      </button>
      {state.error ? <p className="max-w-[220px] text-[11px] leading-4 text-[#6B7280]">{state.error}</p> : null}
    </form>
  );
}

function DocumentoEstadoForm({
  documento,
  vehiculoId,
}: {
  documento: VehiculoDocumento;
  vehiculoId: string;
}) {
  const [state, formAction] = useFormState(updateVehiculoDocumentoEstadoAction, {});

  return (
    <form action={formAction} className="space-y-1">
      <input type="hidden" name="documento_id" value={documento.id} />
      <input type="hidden" name="vehiculo_id" value={vehiculoId} />
      <div className="flex items-center gap-2">
        <select
          name="estado"
          defaultValue={documento.estado ?? "pendiente"}
          className="h-9 rounded-xl border border-[#E5E7EB] bg-white px-2.5 text-xs text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
        >
          {statuses.filter(Boolean).map((status) => (
            <option key={status} value={status}>
              {status === "pendiente"
                ? "Pendiente"
                : status === "recibido"
                  ? "Recibido"
                  : status === "observado"
                    ? "Observado"
                    : status === "vencido"
                      ? "Vencido"
                      : "Archivado"}
            </option>
          ))}
        </select>
        <UpdateButton />
      </div>
      {state.error ? <p className="max-w-[220px] text-[11px] leading-4 text-[#6B7280]">{state.error}</p> : null}
    </form>
  );
}

function UpdateButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-3 text-xs font-medium text-[#111827] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "..." : "Actualizar"}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-medium text-rose-800 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "..." : "Borrar"}
    </button>
  );
}

function DeleteDocumentoForm({
  documento,
  vehiculoId,
}: {
  documento: VehiculoDocumento;
  vehiculoId: string;
}) {
  const [state, formAction] = useFormState(deleteVehiculoDocumentoAction, {});

  return (
    <form action={formAction} className="space-y-1">
      <input type="hidden" name="documento_id" value={documento.id} />
      <input type="hidden" name="vehiculo_id" value={vehiculoId} />
      <input type="hidden" name="archivo_path" value={documento.archivo_path ?? ""} />
      <DeleteButton />
      {state.error ? <p className="max-w-[220px] text-[11px] leading-4 text-[#6B7280]">{state.error}</p> : null}
    </form>
  );
}

export function VehiculoDocumentosTable({
  documentos,
  vehiculoId,
  canManage = false,
  canDelete = false,
}: {
  documentos: VehiculoDocumento[];
  vehiculoId: string;
  canManage?: boolean;
  canDelete?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("");
  const [typeFilter, setTypeFilter] = useState<(typeof types)[number]>("");
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const MAX_VISIBLE_ROWS = 200;

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return documentos.filter((documento) => {
      if (statusFilter && documento.estado !== statusFilter) return false;
      if (typeFilter && documento.tipo !== typeFilter) return false;
      if (onlyOverdue && !isOverdue(documento)) return false;
      if (!normalizedQuery) return true;
      return getSearchableText(documento).includes(normalizedQuery);
    });
  }, [documentos, onlyOverdue, query, statusFilter, typeFilter]);

  const visibleDocumentos = filtered.slice(0, MAX_VISIBLE_ROWS);
  const hasMoreRows = filtered.length > MAX_VISIBLE_ROWS;

  return (
    <section className="rounded-[32px] border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#E5E7EB] p-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#111827]">Documentos del vehículo</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Filtrá por título, tipo, estado o vencimiento.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOnlyOverdue((current) => !current)}
            className={[
              "inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition",
              onlyOverdue
                ? "border-[#E5E7EB] bg-[#18181B] text-white hover:bg-[#27272A]"
                : "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]",
            ].join(" ")}
          >
            Vencidos
          </button>
        </div>

        <div className="grid gap-2 lg:grid-cols-[minmax(0,1.2fr)_180px_220px]">
          <div className="relative">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar documento"
              className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as (typeof statuses)[number])}
            className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          >
            <option value="">Todos los estados</option>
            {statuses.filter(Boolean).map((status) => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as (typeof types)[number])}
            className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          >
            <option value="">Todos los tipos</option>
            {types.filter(Boolean).map((type) => (
              <option key={type} value={type}>
                {getTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#E5E7EB]">
          <thead className="bg-[#FAFAFA]">
            <tr className="text-left text-xs font-medium uppercase tracking-[0.08em] text-[#6B7280]">
              <th className="px-4 py-3">Documento</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Emisión</th>
              <th className="px-4 py-3">Vencimiento</th>
              <th className="px-4 py-3">Archivo</th>
              <th className="px-4 py-3">Vínculo</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {visibleDocumentos.length ? (
              visibleDocumentos.map((documento) => {
                const overdue = isOverdue(documento);

                return (
                  <tr key={documento.id} className={["transition hover:bg-[#F9FAFB]", overdue ? "bg-rose-50/30" : ""].join(" ")}>
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">{documento.titulo ?? "Sin título"}</p>
                        <p className="text-sm text-[#6B7280]">{documento.descripcion ?? documento.observaciones ?? "—"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <VehiculoDocumentoTypeBadge type={documento.tipo} />
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-2">
                        <VehiculoDocumentoStatusBadge status={documento.estado} />
                        {overdue ? <p className="text-xs font-medium text-rose-700">Vencido</p> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-[#111827]">
                      {formatDate(documento.fecha_emision)}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <p className="text-sm text-[#111827]">{formatDate(documento.fecha_vencimiento)}</p>
                        <p className="text-xs text-[#6B7280]">{documento.fecha_vencimiento ? "Fecha límite" : "Sin vencimiento"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        {documento.archivo_path ? (
                          <>
                            <SignedUrlButton documento={documento} />
                            <p className="text-xs text-[#6B7280]">{getFileSizeLabel(documento.archivo_size_bytes)}</p>
                          </>
                        ) : (
                          <p className="text-sm text-[#6B7280]">Sin archivo</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#111827]">{getLinkLabel(documento)}</p>
                        <p className="text-xs text-[#6B7280]">{getLinkDetail(documento)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {canManage ? (
                        <div className="flex flex-col gap-3">
                          <DocumentoEstadoForm documento={documento} vehiculoId={vehiculoId} />
                          {canDelete ? <DeleteDocumentoForm documento={documento} vehiculoId={vehiculoId} /> : null}
                        </div>
                      ) : (
                        <span className="text-xs text-[#6B7280]">Solo lectura</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center">
                  <div className="mx-auto max-w-sm space-y-2">
                    <p className="text-sm font-medium text-[#111827]">No hay documentos para mostrar</p>
                    <p className="text-sm leading-6 text-[#6B7280]">
                      Probá cambiar los filtros o cargá un documento nuevo.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasMoreRows ? (
        <div className="border-t border-[#E5E7EB] px-4 py-3 text-xs text-[#6B7280]">
          Mostrando los primeros {MAX_VISIBLE_ROWS} resultados. Afiná filtros para ver el resto.
        </div>
      ) : null}
    </section>
  );
}
