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
import { createLeadAction } from "@/app/(dashboard)/crm/actions";

type Vehicle = {
  id: string;
  marca: string | null;
  modelo: string | null;
  version: string | null;
  anio: number | null;
  dominio: string | null;
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
        "min-h-[120px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]",
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
      {pending ? "Guardando..." : "Guardar lead"}
    </button>
  );
}

function getVehicleOption(vehicle: Vehicle) {
  return `${vehicle.marca ?? "-"} ${vehicle.modelo ?? ""}${vehicle.version ? ` · ${vehicle.version}` : ""}${vehicle.anio ? ` · ${vehicle.anio}` : ""}${vehicle.dominio ? ` · ${vehicle.dominio}` : ""}`;
}

function getEmployeeOption(employee: Employee) {
  return employee.nombre ?? employee.email ?? "Empleado";
}

export function LeadForm({
  vehicles,
  employees,
}: {
  vehicles: Vehicle[];
  employees: Employee[];
}) {
  const [state, formAction] = useFormState(createLeadAction, initialState);
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
          <h2 className="text-base font-semibold text-[#111827]">Datos del lead</h2>
        </div>
        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="nombre">Nombre *</FieldLabel>
            <Input id="nombre" name="nombre" placeholder="Nombre y apellido" required />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="telefono">Teléfono</FieldLabel>
            <Input id="telefono" name="telefono" placeholder="+54 9 ..." />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" name="email" type="email" placeholder="cliente@email.com" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="documento">Documento</FieldLabel>
            <Input id="documento" name="documento" placeholder="DNI / CUIT" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Pipeline</h2>
        </div>
        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="origen">Origen *</FieldLabel>
            <Select id="origen" name="origen" defaultValue="" required>
              <option value="">Seleccionar origen</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="web">Web</option>
              <option value="referido">Referido</option>
              <option value="presencial">Presencial</option>
              <option value="otro">Otro</option>
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="estado">Estado *</FieldLabel>
            <Select id="estado" name="estado" defaultValue="nuevo" required>
              <option value="nuevo">Nuevo</option>
              <option value="contactado">Contactado</option>
              <option value="interesado">Interesado</option>
              <option value="negociacion">Negociación</option>
              <option value="reservado">Reservado</option>
              <option value="ganado">Ganado</option>
              <option value="perdido">Perdido</option>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="vehiculo_interes_id">Vehículo de interés</FieldLabel>
            <Select id="vehiculo_interes_id" name="vehiculo_interes_id" defaultValue="">
              <option value="">Sin vehículo</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {getVehicleOption(vehicle)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="vendedor_id">Vendedor</FieldLabel>
            <Select id="vendedor_id" name="vendedor_id" defaultValue="">
              <option value="">Sin vendedor</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {getEmployeeOption(employee)}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Presupuesto</h2>
        </div>
        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="presupuesto_min">Presupuesto mínimo</FieldLabel>
            <Input id="presupuesto_min" name="presupuesto_min" type="number" min="0" step="0.01" placeholder="0" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="presupuesto_max">Presupuesto máximo</FieldLabel>
            <Input id="presupuesto_max" name="presupuesto_max" type="number" min="0" step="0.01" placeholder="0" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="presupuesto_moneda">Moneda *</FieldLabel>
            <Select id="presupuesto_moneda" name="presupuesto_moneda" defaultValue="ARS" required>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="nivel_interes">Nivel de interés</FieldLabel>
            <Select id="nivel_interes" name="nivel_interes" defaultValue="">
              <option value="">Sin definir</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="proximo_contacto">Próximo contacto</FieldLabel>
            <Input id="proximo_contacto" name="proximo_contacto" type="date" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="notas">Notas</FieldLabel>
            <Textarea id="notas" name="notas" placeholder="Notas internas del lead" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/crm"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
        >
          Cancelar
        </Link>
        <SubmitButton />
      </div>
    </form>
  );
}
