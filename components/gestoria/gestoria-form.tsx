"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createGestoriaTramiteAction } from "@/app/(dashboard)/gestoria/actions";

type Vehicle = {
  id: string;
  marca: string | null;
  modelo: string | null;
  version: string | null;
  anio: number | null;
  dominio: string | null;
};

type Venta = {
  id: string;
  fecha_venta: string | null;
  cliente_nombre: string | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    dominio: string | null;
  } | null;
};

type Employee = {
  id: string;
  nombre: string | null;
  email: string | null;
  rol: string | null;
};

type ActionState = {
  error?: string;
  success?: boolean;
};

const initialState: ActionState = {};

function FieldLabel({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-[#111827]">
      {children}
    </label>
  );
}

function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]",
        className,
      ].join(" ")}
    />
  );
}

function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[
        "min-h-[100px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]",
        className,
      ].join(" ")}
    />
  );
}

function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[
        "h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]",
        className,
      ].join(" ")}
    >
      {children}
    </select>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Guardando..." : "Guardar trámite"}
    </button>
  );
}

function getVehicleOption(vehicle: Vehicle) {
  return `${vehicle.marca ?? "-"} ${vehicle.modelo ?? ""}${vehicle.version ? ` · ${vehicle.version}` : ""}${vehicle.anio ? ` · ${vehicle.anio}` : ""}${vehicle.dominio ? ` · ${vehicle.dominio}` : ""}`;
}

function getSaleOption(sale: Venta) {
  const vehicle = sale.vehiculo
    ? `${sale.vehiculo.marca ?? "-"} ${sale.vehiculo.modelo ?? ""}`.trim()
    : "Venta";
  const subtitle = sale.vehiculo?.dominio ?? sale.cliente_nombre ?? "Sin detalle";

  return `${sale.fecha_venta ?? "—"} · ${vehicle} · ${subtitle}`;
}

function getEmployeeOption(employee: Employee) {
  return employee.nombre ?? employee.email ?? "Responsable";
}

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

export function GestoriaForm({
  vehicles,
  ventas,
  responsables,
}: {
  vehicles: Vehicle[];
  ventas: Venta[];
  responsables: Employee[];
}) {
  const [state, formAction] = useFormState(createGestoriaTramiteAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {state.error ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-sm text-[#111827]">
          {state.error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Datos del trámite</h2>
        </div>
        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="tipo">Tipo *</FieldLabel>
            <Select id="tipo" name="tipo" defaultValue="transferencia" required>
              <option value="transferencia">Transferencia</option>
              <option value="cedula">Cédula</option>
              <option value="titulo">Título</option>
              <option value="verificacion_policial">Verificación policial</option>
              <option value="informe_dominio">Informe dominio</option>
              <option value="prenda">Prenda</option>
              <option value="seguro">Seguro</option>
              <option value="patente">Patente</option>
              <option value="otro">Otro</option>
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="estado">Estado *</FieldLabel>
            <Select id="estado" name="estado" defaultValue="pendiente" required>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En proceso</option>
              <option value="observado">Observado</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="titulo">Título *</FieldLabel>
            <Input id="titulo" name="titulo" placeholder="Ej. Transferencia BMW X3" required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="descripcion">Descripción</FieldLabel>
            <Textarea id="descripcion" name="descripcion" placeholder="Detalle breve del trámite" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Vínculos</h2>
        </div>
        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="vehiculo_id">Vehículo</FieldLabel>
            <Select id="vehiculo_id" name="vehiculo_id" defaultValue="">
              <option value="">Sin vehículo</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {getVehicleOption(vehicle)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="venta_id">Venta</FieldLabel>
            <Select id="venta_id" name="venta_id" defaultValue="">
              <option value="">Sin venta</option>
              {ventas.map((venta) => (
                <option key={venta.id} value={venta.id}>
                  {getSaleOption(venta)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="responsable_id">Responsable</FieldLabel>
            <Select id="responsable_id" name="responsable_id" defaultValue="">
              <option value="">Sin responsable</option>
              {responsables.map((responsable) => (
                <option key={responsable.id} value={responsable.id}>
                  {getEmployeeOption(responsable)}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Cliente</h2>
        </div>
        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="cliente_nombre">Nombre</FieldLabel>
            <Input id="cliente_nombre" name="cliente_nombre" placeholder="Nombre y apellido" />
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
            <Input id="cliente_documento" name="cliente_documento" placeholder="DNI / CUIT" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Fechas</h2>
        </div>
        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="fecha_inicio">Fecha de inicio *</FieldLabel>
            <Input id="fecha_inicio" name="fecha_inicio" type="date" defaultValue={todayValue()} required />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="fecha_vencimiento">Fecha de vencimiento</FieldLabel>
            <Input id="fecha_vencimiento" name="fecha_vencimiento" type="date" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Documentos</h2>
        </div>
        <div className="space-y-3 px-5 py-5">
          <div className="space-y-2">
            <FieldLabel htmlFor="documentos">Archivos</FieldLabel>
            <Input
              id="documentos"
              name="documentos"
              type="file"
              multiple
              accept="application/pdf,image/jpeg,image/png,image/webp"
            />
          </div>
          <p className="text-xs leading-5 text-[#6B7280]">
            PDF, JPG, PNG o WEBP. Máximo 10 archivos.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Observaciones</h2>
        </div>
        <div className="px-5 py-5">
          <Textarea id="observaciones" name="observaciones" placeholder="Notas internas opcionales" />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/gestoria"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
        >
          Cancelar
        </Link>
        <SubmitButton />
      </div>
    </form>
  );
}
