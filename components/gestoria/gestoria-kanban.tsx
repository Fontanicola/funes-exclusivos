"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Circle, FileText, Search, UserRound } from "lucide-react";
import { updateGestoriaOperacionFormAction } from "@/app/(dashboard)/gestoria/actions";
import { AdvancedFilters } from "@/components/common/advanced-filters";

type Employee = {
  id: string;
  nombre: string | null;
  email: string | null;
  rol: string | null;
};

type GestoriaTramite = {
  id: string;
  tipo: string | null;
  estado: string | null;
  titulo: string | null;
  descripcion: string | null;
  cliente_nombre: string | null;
  cliente_telefono: string | null;
  cliente_email: string | null;
  cliente_documento: string | null;
  fecha_inicio: string | null;
  fecha_vencimiento: string | null;
  fecha_finalizacion: string | null;
  etapa?: string | null;
  gestion_tipo?: string | null;
  fecha_envio?: string | null;
  fecha_firma?: string | null;
  costo_final_transferencia?: number | null;
  costo_final_moneda?: string | null;
  presupuesto_confirmado?: boolean | null;
  cat_estado?: string | null;
  cat_fecha?: string | null;
  documentacion_fisica_estado?: string | null;
  documentacion_fisica_fecha?: string | null;
  escribania_estado?: string | null;
  escribania_fecha_retiro?: string | null;
  transferencia_registral_estado?: string | null;
  transferencia_registral_fecha?: string | null;
  retiro_documentacion_cliente_estado?: string | null;
  retiro_documentacion_cliente_fecha?: string | null;
  transferencia_municipal_estado?: string | null;
  transferencia_municipal_fecha?: string | null;
  seguimiento_comentarios?: string | null;
  documentos: string[] | string | null;
  observaciones: string | null;
  created_at: string | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    version: string | null;
    anio: number | null;
    dominio: string | null;
  } | null;
  venta: {
    id: string;
    fecha_venta: string | null;
    cliente_nombre: string | null;
  } | null;
  responsable: Employee | null;
  presupuesto?: {
    id: string;
    estado: string | null;
    total: number | null;
    moneda: string | null;
    fecha: string | null;
  } | null;
};

const stages = [
  {
    key: "presupuesto",
    label: "Presupuesto",
    description: "Monto estimado, costo final y envío.",
  },
  {
    key: "escribania",
    label: "Escribanía",
    description: "Firma, retiro y validaciones previas.",
  },
  {
    key: "gestoria",
    label: "Gestoría",
    description: "Transferencia registral, CAT y documentación.",
  },
  {
    key: "terminado",
    label: "Terminado",
    description: "Operaciones cerradas y documentación retirada.",
  },
] as const;

const PAGE_SIZE = 20;

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR").format(date);
}

function formatMoney(value: number | null | undefined, currency: string | null | undefined) {
  if (value == null) return "—";
  const formatter = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${(currency ?? "ARS").toUpperCase() === "USD" ? "US$" : "$"} ${formatter.format(value)}`;
}

function getVehicleLabel(tramite: GestoriaTramite) {
  if (tramite.vehiculo) {
    return [tramite.vehiculo.marca, tramite.vehiculo.modelo, tramite.vehiculo.version]
      .filter(Boolean)
      .join(" ");
  }

  if (tramite.venta) {
    return `Venta ${formatDate(tramite.venta.fecha_venta)}`;
  }

  return "Sin vehículo vinculado";
}

function getVehicleMeta(tramite: GestoriaTramite) {
  return [
    tramite.vehiculo?.anio,
    tramite.vehiculo?.dominio,
    tramite.venta?.cliente_nombre,
  ]
    .filter(Boolean)
    .join(" · ");
}

function getClientName(tramite: GestoriaTramite) {
  return tramite.cliente_nombre ?? tramite.venta?.cliente_nombre ?? "Cliente sin cargar";
}

function isOverdue(tramite: GestoriaTramite) {
  if (!tramite.fecha_vencimiento) return false;
  const due = new Date(`${tramite.fecha_vencimiento}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due.getTime() < today.getTime() && (tramite.etapa ?? "") !== "terminado";
}

function statusTone(status: string | null | undefined) {
  const normalized = (status ?? "pendiente").toLowerCase();
  if (normalized === "completado") return "text-emerald-700";
  if (normalized === "observado") return "text-rose-700";
  if (normalized === "en_proceso") return "text-amber-700";
  if (normalized === "no_aplica") return "text-slate-400";
  return "text-slate-500";
}

function SubmitMiniButton({ children = "Guardar" }: { children?: ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-9 items-center justify-center rounded-md bg-[#8A1538] px-3 text-xs font-medium text-white transition hover:bg-[#6F102D] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Guardando..." : children}
    </button>
  );
}

function SelectField({
  name,
  defaultValue,
  children,
  className = "",
}: {
  name: string;
  defaultValue?: string | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? ""}
      className={[
        "h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-xs text-[#111827] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]",
        className,
      ].join(" ")}
    >
      {children}
    </select>
  );
}

function InputField({
  name,
  type = "text",
  defaultValue,
  placeholder,
}: {
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  placeholder?: string;
}) {
  return (
    <input
      name={name}
      type={type}
      defaultValue={defaultValue ?? ""}
      placeholder={placeholder}
      step={type === "number" ? "0.01" : undefined}
      min={type === "number" ? "0" : undefined}
      className="h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-xs text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]"
    />
  );
}

function MilestoneRow({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value: string | null | undefined;
}) {
  const [currentValue, setCurrentValue] = useState(value ?? "pendiente");
  const completed = currentValue.toLowerCase() === "completado";
  const Icon = completed ? CheckCircle2 : Circle;
  const nextValue = completed ? "pendiente" : "completado";

  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] py-2 last:border-b-0">
      <span className="inline-flex min-w-0 items-center gap-2 text-xs font-medium text-[#111827]">
        <button
          type="button"
          onClick={() => setCurrentValue(nextValue)}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition hover:bg-[#FDF2F5]"
          aria-label={`${completed ? "Marcar como pendiente" : "Marcar como completado"}: ${label}`}
          title={completed ? "Marcar como pendiente" : "Marcar como completado"}
        >
          <Icon className={["h-4 w-4", statusTone(currentValue)].join(" ")} />
        </button>
        <span className="truncate">{label}</span>
      </span>
      <input type="hidden" name={name} value={currentValue} />
      <span className={["shrink-0 text-[11px]", statusTone(currentValue)].join(" ")}>
        {completed ? "Completado" : "Pendiente"}
      </span>
    </div>
  );
}

function OperationCard({ tramite }: { tramite: GestoriaTramite }) {
  const overdue = isOverdue(tramite);

  return (
    <article className={["rounded-md border bg-white p-4", overdue ? "border-rose-200" : "border-[#E5E7EB]"].join(" ")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#111827]">
            {getVehicleLabel(tramite)}
          </p>
          <p className="mt-1 truncate text-xs text-[#6B7280]">
            {getVehicleMeta(tramite) || tramite.titulo || "Operación de gestoría"}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-xs text-[#6B7280]">
        <div className="flex items-center gap-2">
          <UserRound className="h-3.5 w-3.5" />
          <span className="truncate">{getClientName(tramite)}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <div className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-2">
          <p className="text-[11px] font-medium text-[#6B7280]">Presupuesto</p>
          <p className="mt-1 text-sm font-semibold text-[#111827]">
            {formatMoney(tramite.presupuesto?.total, tramite.presupuesto?.moneda)}
          </p>
          <p className="mt-1 text-xs text-[#6B7280]">
            {tramite.presupuesto_confirmado ? "Confirmado" : tramite.presupuesto?.estado ?? "Pendiente"}
          </p>
        </div>
        <div className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-2">
          <p className="text-[11px] font-medium text-[#6B7280]">Costo final</p>
          <p className="mt-1 text-sm font-semibold text-[#111827]">
            {formatMoney(tramite.costo_final_transferencia, tramite.costo_final_moneda)}
          </p>
          <p className="mt-1 text-xs text-[#6B7280]">
            Vence {formatDate(tramite.fecha_vencimiento)}
          </p>
        </div>
      </div>

      <form action={updateGestoriaOperacionFormAction} className="mt-4 space-y-3 border-t border-[#E5E7EB] pt-3">
        <input type="hidden" name="id" value={tramite.id} />

        <input type="hidden" name="etapa" value={tramite.etapa ?? "presupuesto"} />
        <input type="hidden" name="estado" value={tramite.estado ?? "pendiente"} />
        <input type="hidden" name="responsable_id" value={tramite.responsable?.id ?? ""} />
        <input type="hidden" name="gestion_tipo" value={tramite.gestion_tipo ?? "interna"} />
        <input type="hidden" name="fecha_envio" value={tramite.fecha_envio ?? ""} />
        <input type="hidden" name="fecha_firma" value={tramite.fecha_firma ?? ""} />
        <input type="hidden" name="fecha_vencimiento" value={tramite.fecha_vencimiento ?? ""} />

        <div className="grid gap-2 sm:grid-cols-[1fr_90px]">
          <div>
            <p className="mb-1 text-[11px] font-medium text-[#6B7280]">Costo final de transferencia</p>
            <InputField name="costo_final_transferencia" type="number" defaultValue={tramite.costo_final_transferencia} placeholder="0" />
          </div>
          <div>
            <p className="mb-1 text-[11px] font-medium text-[#6B7280]">Moneda</p>
            <SelectField name="costo_final_moneda" defaultValue={tramite.costo_final_moneda ?? "ARS"}>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </SelectField>
          </div>
        </div>

        <label className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#111827]">
          <input name="presupuesto_confirmado" type="checkbox" defaultChecked={Boolean(tramite.presupuesto_confirmado)} className="h-4 w-4 accent-[#8A1538]" />
          Presupuesto confirmado
        </label>

        <div className="grid gap-2">
          <MilestoneRow label="CAT" name="cat_estado" value={tramite.cat_estado} />
          <MilestoneRow label="Documentación física" name="documentacion_fisica_estado" value={tramite.documentacion_fisica_estado} />
          <MilestoneRow label="Escribanía / retiro" name="escribania_estado" value={tramite.escribania_estado} />
          <MilestoneRow label="Transferencia registral" name="transferencia_registral_estado" value={tramite.transferencia_registral_estado} />
          <MilestoneRow label="Retiro documentación cliente" name="retiro_documentacion_cliente_estado" value={tramite.retiro_documentacion_cliente_estado} />
          <MilestoneRow label="Transferencia municipal" name="transferencia_municipal_estado" value={tramite.transferencia_municipal_estado} />
        </div>

        <input type="hidden" name="cat_fecha" value={tramite.cat_fecha ?? ""} />
        <input type="hidden" name="documentacion_fisica_fecha" value={tramite.documentacion_fisica_fecha ?? ""} />
        <input type="hidden" name="escribania_fecha_retiro" value={tramite.escribania_fecha_retiro ?? ""} />
        <input type="hidden" name="transferencia_registral_fecha" value={tramite.transferencia_registral_fecha ?? ""} />
        <input type="hidden" name="retiro_documentacion_cliente_fecha" value={tramite.retiro_documentacion_cliente_fecha ?? ""} />
        <input type="hidden" name="transferencia_municipal_fecha" value={tramite.transferencia_municipal_fecha ?? ""} />

        <div className="flex flex-wrap items-center justify-end gap-2">
          <SubmitMiniButton>Actualizar</SubmitMiniButton>
        </div>
      </form>

      {(tramite.documentos && JSON.stringify(tramite.documentos) !== "[]") || tramite.presupuesto?.id ? (
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#6B7280]">
          {tramite.presupuesto?.id ? (
            <a href={`/gestoria/presupuestos/${tramite.presupuesto.id}`} className="inline-flex items-center gap-1 rounded-md border border-[#E5E7EB] px-2.5 py-1 transition hover:text-[#8A1538]">
              <FileText className="h-3.5 w-3.5" />
              Ver presupuesto
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function GestoriaKanban({
  tramites,
  gestores,
  toolbarAction,
}: {
  tramites: GestoriaTramite[];
  gestores: Employee[];
  toolbarAction?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [gestorFilter, setGestorFilter] = useState("");
  const [gestionFilter, setGestionFilter] = useState("");
  const [onlyPendingBudget, setOnlyPendingBudget] = useState(false);
  const [stageVisibleCounts, setStageVisibleCounts] = useState<Record<string, number>>({});

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tramites.filter((tramite) => {
      if (gestorFilter && tramite.responsable?.id !== gestorFilter) return false;
      if (gestionFilter && (tramite.gestion_tipo ?? "interna") !== gestionFilter) return false;
      if (onlyPendingBudget && (tramite.presupuesto_confirmado || tramite.presupuesto?.id)) return false;

      if (!normalizedQuery) return true;

      const searchable = [
        tramite.titulo,
        tramite.cliente_nombre,
        tramite.cliente_telefono,
        tramite.cliente_documento,
        tramite.vehiculo?.marca,
        tramite.vehiculo?.modelo,
        tramite.vehiculo?.dominio,
        tramite.venta?.cliente_nombre,
        tramite.responsable?.nombre,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [gestorFilter, gestionFilter, onlyPendingBudget, query, tramites]);

  return (
    <section>
      <div className="border-y border-[#E5E7EB] py-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {toolbarAction ? <div className="shrink-0">{toolbarAction}</div> : null}

            <div className="relative min-w-[260px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar operación, cliente, dominio o gestor"
                className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white pl-9 pr-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]"
              />
            </div>

            <AdvancedFilters>
              <select
                value={gestorFilter}
                onChange={(event) => setGestorFilter(event.target.value)}
                className="h-10 min-w-[190px] rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]"
              >
                <option value="">Todos los gestores</option>
                {gestores.map((gestor) => (
                  <option key={gestor.id} value={gestor.id}>
                    {gestor.nombre ?? gestor.email ?? "Gestor"}
                  </option>
                ))}
              </select>

              <select
                value={gestionFilter}
                onChange={(event) => setGestionFilter(event.target.value)}
                className="h-10 min-w-[170px] rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]"
              >
                <option value="">Tipo de gestión</option>
                <option value="interna">Interna</option>
                <option value="cliente">Cliente</option>
                <option value="mixta">Mixta</option>
              </select>

              <label className="inline-flex h-10 items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#111827]">
                <input
                  type="checkbox"
                  checked={onlyPendingBudget}
                  onChange={(event) => setOnlyPendingBudget(event.target.checked)}
                  className="h-4 w-4 accent-[#8A1538]"
                />
                Presupuesto pendiente
              </label>
            </AdvancedFilters>
          </div>

          <p className="text-xs text-[#6B7280]">Mostrando {filtered.length} de {tramites.length}</p>
        </div>
      </div>

      {filtered.length ? (
        <div className="grid gap-4 py-4 xl:grid-cols-4">
          {stages.map((stage) => {
            const stageItems = filtered.filter((tramite) => (tramite.etapa ?? "presupuesto") === stage.key);
            const visibleCount = stageVisibleCounts[stage.key] ?? PAGE_SIZE;
            const visibleStageItems = stageItems.slice(0, visibleCount);

            return (
              <section key={stage.key} className="flex h-[calc(100vh-280px)] min-h-[560px] min-w-0 flex-col rounded-md border border-[#E5E7EB] bg-[#FAFAFA]">
                <div className="border-b border-[#E5E7EB] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-[#111827]">{stage.label}</h2>
                      <p className="mt-1 text-xs leading-5 text-[#6B7280]">{stage.description}</p>
                    </div>
                    <span className="rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs font-semibold text-[#111827]">
                      {stageItems.length}
                    </span>
                  </div>
                </div>
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
                  {stageItems.length ? (
                    visibleStageItems.map((tramite) => (
                      <OperationCard key={tramite.id} tramite={tramite} />
                    ))
                  ) : (
                    <div className="rounded-md border border-dashed border-[#E5E7EB] bg-white px-4 py-8 text-center text-sm text-[#6B7280]">
                      Sin operaciones en esta etapa.
                    </div>
                  )}
                </div>
                {stageItems.length > visibleCount ? (
                  <div className="border-t border-[#E5E7EB] px-4 py-3 text-center">
                    <p className="mb-2 text-xs text-[#6B7280]">
                      Mostrando {visibleStageItems.length} de {stageItems.length}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setStageVisibleCounts((current) => ({
                          ...current,
                          [stage.key]: visibleCount + PAGE_SIZE,
                        }))
                      }
                      className="text-sm font-medium text-[#8A1538] transition hover:text-[#6F102D]"
                    >
                      Ver más
                    </button>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="px-5 py-14 text-center">
          <p className="text-sm font-medium text-[#111827]">
            {tramites.length ? "No encontramos operaciones con esos filtros" : "Todavía no hay operaciones de gestoría"}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
            {tramites.length
              ? "Probá ajustar búsqueda, gestor, tipo de gestión o presupuesto pendiente."
              : "Creá el primer trámite para empezar a seguir presupuesto, escribanía, CAT y documentación."}
          </p>
        </div>
      )}
    </section>
  );
}
