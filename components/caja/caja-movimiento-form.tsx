"use client";

import { useEffect, useMemo, useRef } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createCajaMovimientoAction } from "@/app/(dashboard)/caja/actions";

type Proveedor = {
  id: string;
  nombre: string | null;
  categoria: string | null;
};

type Activo = {
  id: string;
  tipo: string | null;
  nombre: string | null;
};

type ActionState = {
  error?: string;
  success?: boolean;
};

const initialState: ActionState = {};
const MEDIOS = [
  "efectivo",
  "banco_santander",
  "cheques_terceros",
  "dolares",
  "car_france",
  "renault_credit",
  "kyoto",
  "metz",
  "avec",
  "mg",
  "cta_hab_sol",
  "otro",
] as const;

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
        "h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]",
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
        "min-h-[84px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]",
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
        "h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]",
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
      className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Cargando..." : "Cargar movimiento"}
    </button>
  );
}

function formatProvider(provider: Proveedor | null) {
  if (!provider) return "Sin proveedor";
  return provider.categoria ? `${provider.nombre ?? "Proveedor"} · ${provider.categoria}` : provider.nombre ?? "Proveedor";
}

function formatAsset(asset: Activo) {
  const label = asset.tipo ? `${asset.tipo} · ${asset.nombre ?? "Activo"}` : asset.nombre ?? "Activo";
  return label;
}

function formatMedium(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

export function CajaMovimientoForm({
  proveedores,
  activos,
}: {
  proveedores: Proveedor[];
  activos: Activo[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(createCajaMovimientoAction, initialState);
  const activeProviders = useMemo(() => proveedores.filter((proveedor) => proveedor.nombre), [proveedores]);
  const activeAssets = useMemo(() => activos.filter((activo) => activo.nombre), [activos]);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-[#111827]">Carga rápida</h2>
        <p className="text-sm text-[#6B7280]">
          Ingresos y egresos mínimos para operar sin fricción.
        </p>
      </div>

      {state.error ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-2 text-sm text-[#111827]">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827]">
          Movimiento cargado.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="tipo">Tipo *</FieldLabel>
          <Select id="tipo" name="tipo" defaultValue="ingreso" required>
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
          </Select>
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="medio">Medio *</FieldLabel>
          <Select id="medio" name="medio" defaultValue="efectivo" required>
            {MEDIOS.map((medio) => (
              <option key={medio} value={medio}>
                {formatMedium(medio)}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="importe">Importe *</FieldLabel>
          <Input id="importe" name="importe" type="number" min="0" step="0.01" placeholder="0" required />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="moneda">Moneda *</FieldLabel>
          <Select id="moneda" name="moneda" defaultValue="ARS" required>
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
          </Select>
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="fecha">Fecha *</FieldLabel>
          <Input id="fecha" name="fecha" type="date" defaultValue={todayValue()} required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <FieldLabel htmlFor="concepto">Concepto</FieldLabel>
          <Input id="concepto" name="concepto" placeholder="Reserva, gasto, entrega, cobro..." />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <FieldLabel htmlFor="detalle_1">Detalle 1 *</FieldLabel>
          <Input id="detalle_1" name="detalle_1" placeholder="Pago, cobro, seña..." required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <FieldLabel htmlFor="detalle_2">Detalle 2</FieldLabel>
          <Input id="detalle_2" name="detalle_2" placeholder="Detalle complementario" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <FieldLabel htmlFor="detalle_3">Detalle 3 / Proveedor</FieldLabel>
          <Input id="detalle_3" name="detalle_3" placeholder="Detalle operativo" />
          <div className="space-y-2">
            <FieldLabel htmlFor="proveedor_id">Proveedor</FieldLabel>
            <Select id="proveedor_id" name="proveedor_id" defaultValue="">
              <option value="">Sin proveedor</option>
              {activeProviders.map((proveedor) => (
                <option key={proveedor.id} value={proveedor.id}>
                  {formatProvider(proveedor)}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="periodo">Período</FieldLabel>
          <Input id="periodo" name="periodo" placeholder="2026-07" />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="cuenta">Cuenta</FieldLabel>
          <Select id="cuenta" name="cuenta" defaultValue="">
            <option value="">Sin cuenta</option>
            {MEDIOS.map((medio) => (
              <option key={medio} value={medio}>
                {formatMedium(medio)}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <FieldLabel htmlFor="activo_id">Activo</FieldLabel>
          <Select id="activo_id" name="activo_id" defaultValue="">
            <option value="">Sin activo</option>
            {activeAssets.map((activo) => (
              <option key={activo.id} value={activo.id}>
                {formatAsset(activo)}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <FieldLabel htmlFor="observaciones">Observaciones</FieldLabel>
          <Textarea id="observaciones" name="observaciones" placeholder="Notas internas opcionales" />
        </div>
      </div>

      <SubmitButton />

      <p className="text-xs leading-5 text-[#6B7280]">
        Carga pensada para caja rápida. Podés asociar proveedor o activo sin salir de esta pantalla.
      </p>
    </form>
  );
}
