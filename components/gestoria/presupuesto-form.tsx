"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createGestoriaPresupuestoAction } from "@/app/(dashboard)/gestoria/presupuestos/actions";

type ItemType =
  | ""
  | "valor_tabla_dnrpa"
  | "valor_tabla_api"
  | "ceta_factura"
  | "aranceles"
  | "impuesto_sellos"
  | "certificaciones"
  | "formularios"
  | "honorarios"
  | "registro"
  | "patentes"
  | "otro";

type ItemRow = {
  tipo: ItemType;
  descripcion: string;
  monto: string;
  moneda: "ARS" | "USD";
};

type Tramite = {
  id: string;
  titulo: string | null;
  tipo: string | null;
  estado: string | null;
  cliente_nombre: string | null;
  cliente_telefono: string | null;
  cliente_email: string | null;
  cliente_documento: string | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    dominio: string | null;
  } | null;
};

type Venta = {
  id: string;
  fecha_venta: string | null;
  cliente_nombre: string | null;
  cliente_telefono: string | null;
  cliente_email: string | null;
  cliente_documento: string | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    dominio: string | null;
  } | null;
};

type Vehiculo = {
  id: string;
  marca: string | null;
  modelo: string | null;
  version: string | null;
  anio: number | null;
  dominio: string | null;
  precio_venta: number | null;
  precio_contado: number | null;
  precio_permuta: number | null;
};

type ActionState = {
  error?: string;
  success?: boolean;
};

const initialState: ActionState = {};

const ITEM_LABELS: Record<Exclude<ItemType, "">, string> = {
  valor_tabla_dnrpa: "Tabla DNRPA",
  valor_tabla_api: "Tabla API",
  ceta_factura: "CETA / Factura",
  aranceles: "Aranceles",
  impuesto_sellos: "Impuesto de sellos",
  certificaciones: "Certificaciones",
  formularios: "Formularios",
  honorarios: "Honorarios",
  registro: "Registro",
  patentes: "Patentes",
  otro: "Otro",
};

const ITEM_TYPES = ["", ...Object.keys(ITEM_LABELS)] as const;

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return <label htmlFor={htmlFor} className="text-sm font-medium text-[#111827]">{children}</label>;
}

function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={["h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]", className].join(" ")} />;
}

function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={["min-h-[110px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]", className].join(" ")} />;
}

function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={["h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]", className].join(" ")}>{children}</select>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="inline-flex h-10 items-center justify-center rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A] disabled:cursor-not-allowed disabled:opacity-70">
      {pending ? "Guardando..." : "Guardar presupuesto"}
    </button>
  );
}

function emptyRows(): ItemRow[] {
  return Array.from({ length: 10 }, () => ({
    tipo: "",
    descripcion: "",
    monto: "",
    moneda: "ARS",
  }));
}

function parseAmount(value: string) {
  const parsed = Number(value.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number, currency: "ARS" | "USD") {
  const symbol = currency === "USD" ? "US$" : "$";
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
  return formatted.replace("US$", symbol).replace("$", symbol);
}

function FormSection({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="border-b border-[#E5E7EB] px-5 py-4">
        <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
        <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

export function PresupuestoForm({
  tramites,
  ventas,
  vehiculos,
}: {
  tramites: Tramite[];
  ventas: Venta[];
  vehiculos: Vehiculo[];
}) {
  const [state, formAction] = useFormState(createGestoriaPresupuestoAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [rows, setRows] = useState<ItemRow[]>(() => emptyRows());

  const totalEstimado = useMemo(
    () =>
      rows.reduce((sum, row) => {
        const amount = parseAmount(row.monto);
        return amount > 0 ? sum + amount : sum;
      }, 0),
    [rows]
  );

  useEffect(() => {
    if (state.error) return;
    if (state.success) {
      formRef.current?.reset();
      setRows(emptyRows());
    }
  }, [state.error, state.success]);

  const updateRow = (index: number, patch: Partial<ItemRow>) => {
    setRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row))
    );
  };

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <FormSection title="Vínculos" subtitle="Asociá el presupuesto a trámite, venta o vehículo.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <FieldLabel htmlFor="tramite_id">Trámite</FieldLabel>
              <Select id="tramite_id" name="tramite_id" defaultValue="">
                <option value="">Sin trámite</option>
                {tramites.map((tramite) => (
                  <option key={tramite.id} value={tramite.id}>
                    {tramite.titulo ?? "Trámite"} · {tramite.tipo ?? "Tipo"} · {tramite.estado ?? "Estado"}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <FieldLabel htmlFor="venta_id">Venta</FieldLabel>
              <Select id="venta_id" name="venta_id" defaultValue="">
                <option value="">Sin venta</option>
                {ventas.map((venta) => (
                  <option key={venta.id} value={venta.id}>
                    {venta.cliente_nombre ?? "Cliente"} · {venta.fecha_venta ?? "Sin fecha"}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <FieldLabel htmlFor="vehiculo_id">Vehículo</FieldLabel>
              <Select id="vehiculo_id" name="vehiculo_id" defaultValue="">
                <option value="">Sin vehículo</option>
                {vehiculos.map((vehiculo) => (
                  <option key={vehiculo.id} value={vehiculo.id}>
                    {vehiculo.marca ?? "Vehículo"} {vehiculo.modelo ?? ""} {vehiculo.dominio ? `· ${vehiculo.dominio}` : ""}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="estado">Estado</FieldLabel>
              <Select id="estado" name="estado" defaultValue="borrador">
                <option value="borrador">Borrador</option>
                <option value="enviado">Enviado</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
                <option value="facturado">Facturado</option>
                <option value="anulado">Anulado</option>
              </Select>
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="fecha">Fecha</FieldLabel>
              <Input id="fecha" name="fecha" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
            </div>
          </div>
        </FormSection>

        <FormSection title="Cliente" subtitle="Datos de contacto para emitir el presupuesto.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <FieldLabel htmlFor="cliente_nombre">Nombre *</FieldLabel>
              <Input id="cliente_nombre" name="cliente_nombre" placeholder="Nombre y apellido" required />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="cliente_telefono">Teléfono</FieldLabel>
              <Input id="cliente_telefono" name="cliente_telefono" placeholder="+54 9 ..." />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="cliente_email">Email</FieldLabel>
              <Input id="cliente_email" name="cliente_email" type="email" placeholder="cliente@email.com" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <FieldLabel htmlFor="cliente_documento">Documento</FieldLabel>
              <Input id="cliente_documento" name="cliente_documento" placeholder="30.111.222" />
            </div>
          </div>
        </FormSection>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <FormSection title="Valores base" subtitle="Datos que suelen venir de la tabla y la consulta externa.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="moneda">Moneda</FieldLabel>
              <Select id="moneda" name="moneda" defaultValue="ARS">
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </Select>
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="valor_vehiculo">Valor vehículo</FieldLabel>
              <Input id="valor_vehiculo" name="valor_vehiculo" type="number" min="0" step="0.01" placeholder="0" />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="valor_tabla_dnrpa">Valor tabla DNRPA</FieldLabel>
              <Input id="valor_tabla_dnrpa" name="valor_tabla_dnrpa" type="number" min="0" step="0.01" placeholder="0" />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="valor_tabla_api">Valor tabla API</FieldLabel>
              <Input id="valor_tabla_api" name="valor_tabla_api" type="number" min="0" step="0.01" placeholder="0" />
            </div>
          </div>
        </FormSection>

        <FormSection title="Total estimado" subtitle="Suma rápida de los ítems cargados antes de guardar.">
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <p className="text-sm font-medium text-[#6B7280]">Total estimado</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[#111827]">
              {formatMoney(totalEstimado, "ARS")}
            </p>
            <p className="mt-2 text-xs text-[#6B7280]">
              El total se calcula desde los ítems y luego el trigger se encarga de consolidarlo.
            </p>
          </div>
        </FormSection>
      </div>

      <FormSection title="Ítems del presupuesto" subtitle="Cargá hasta 10 líneas antes de guardar.">
        <div className="space-y-3">
          {rows.map((row, index) => (
            <div key={index} className="grid gap-3 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-3 xl:grid-cols-[180px_1fr_160px_110px]">
              <div className="space-y-2">
                <FieldLabel htmlFor={`item_tipo_${index}`}>Tipo</FieldLabel>
                <Select
                  id={`item_tipo_${index}`}
                  name={`item_tipo_${index}`}
                  value={row.tipo}
                  onChange={(event) => updateRow(index, { tipo: event.target.value as ItemType })}
                >
                  {ITEM_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type ? ITEM_LABELS[type as Exclude<ItemType, "">] : "Sin tipo"}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor={`item_descripcion_${index}`}>Descripción</FieldLabel>
                <Input
                  id={`item_descripcion_${index}`}
                  name={`item_descripcion_${index}`}
                  value={row.descripcion}
                  onChange={(event) => updateRow(index, { descripcion: event.target.value })}
                  placeholder="Detalle del ítem"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor={`item_monto_${index}`}>Monto</FieldLabel>
                <Input
                  id={`item_monto_${index}`}
                  name={`item_monto_${index}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={row.monto}
                  onChange={(event) => updateRow(index, { monto: event.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor={`item_moneda_${index}`}>Moneda</FieldLabel>
                <Select
                  id={`item_moneda_${index}`}
                  name={`item_moneda_${index}`}
                  value={row.moneda}
                  onChange={(event) => updateRow(index, { moneda: event.target.value as "ARS" | "USD" })}
                >
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection title="Links y observaciones" subtitle="Adjuntá referencias útiles para seguimiento interno.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="link_dnrpa">Link DNRPA</FieldLabel>
            <Input id="link_dnrpa" name="link_dnrpa" placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="link_api">Link API</FieldLabel>
            <Input id="link_api" name="link_api" placeholder="https://..." />
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="observaciones">Observaciones</FieldLabel>
            <Textarea id="observaciones" name="observaciones" placeholder="Notas internas sobre el presupuesto..." />
          </div>
        </div>
      </FormSection>

      {state.error ? (
        <div className="rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <SubmitButton />
        <Link href="/gestoria/presupuestos" className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
