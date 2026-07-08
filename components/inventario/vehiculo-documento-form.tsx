"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createVehiculoDocumentoAction } from "@/app/(dashboard)/inventario/[id]/documentos/actions";

type ActionState = {
  error?: string;
  success?: boolean;
};

const initialState: ActionState = {};

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-[#111827]">
      {children}
    </label>
  );
}

function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
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

function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[
        "min-h-[110px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]",
        className,
      ].join(" ")}
    />
  );
}

function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
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
      {pending ? "Guardando..." : "Agregar documento"}
    </button>
  );
}

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

export function VehiculoDocumentoForm({ vehiculoId }: { vehiculoId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(createVehiculoDocumentoAction, initialState);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6" encType="multipart/form-data">
      <input type="hidden" name="vehiculo_id" value={vehiculoId} />

      <div className="rounded-[32px] border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Nuevo documento</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Títulos, permisos, facturas, comprobantes y documentación operativa.
          </p>
        </div>

        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="tipo">Tipo *</FieldLabel>
            <Select id="tipo" name="tipo" defaultValue="titulo" required>
              <option value="titulo">Título</option>
              <option value="cedula">Cédula</option>
              <option value="factura">Factura</option>
              <option value="boleto">Boleto</option>
              <option value="permiso">Permiso</option>
              <option value="comprobante_pago">Comprobante de pago</option>
              <option value="informe_dominio">Informe de dominio</option>
              <option value="verificacion_policial">Verificación policial</option>
              <option value="seguro">Seguro</option>
              <option value="patente">Patente</option>
              <option value="formulario">Formulario</option>
              <option value="otro">Otro</option>
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="estado">Estado *</FieldLabel>
            <Select id="estado" name="estado" defaultValue="pendiente" required>
              <option value="pendiente">Pendiente</option>
              <option value="recibido">Recibido</option>
              <option value="observado">Observado</option>
              <option value="vencido">Vencido</option>
              <option value="archivado">Archivado</option>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="titulo">Título *</FieldLabel>
            <Input id="titulo" name="titulo" placeholder="Ej. Título Porsche Macan" required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="descripcion">Descripción</FieldLabel>
            <Textarea id="descripcion" name="descripcion" placeholder="Detalle breve del documento" />
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Fechas y archivo</h2>
        </div>

        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="fecha_emision">Fecha de emisión</FieldLabel>
            <Input id="fecha_emision" name="fecha_emision" type="date" defaultValue={todayValue()} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="fecha_vencimiento">Fecha de vencimiento</FieldLabel>
            <Input id="fecha_vencimiento" name="fecha_vencimiento" type="date" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="archivo">Archivo</FieldLabel>
            <Input
              id="archivo"
              name="archivo"
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
            />
          </div>
          <p className="md:col-span-2 text-xs leading-5 text-[#6B7280]">
            PDF, JPG, PNG o WEBP. El archivo se guarda en un bucket privado y se abre con enlace firmado.
          </p>
        </div>
      </div>

      <div className="rounded-[32px] border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Observaciones</h2>
        </div>
        <div className="px-5 py-5">
          <Textarea id="observaciones" name="observaciones" placeholder="Notas internas opcionales" />
        </div>
      </div>

      {state.error ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-sm text-[#111827]">
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/inventario/${vehiculoId}`}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
        >
          Volver al vehículo
        </Link>
        <SubmitButton />
      </div>
    </form>
  );
}
