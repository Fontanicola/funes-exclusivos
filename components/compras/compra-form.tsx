"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createCompraVehiculoAction } from "@/app/(dashboard)/compras/actions";

type Proveedor = {
  id: string;
  nombre: string | null;
  categoria: string | null;
  telefono: string | null;
};

type ActionState = {
  error?: string;
};

const initialState: ActionState = {};
const MEDIOS_CAJA = [
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

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return <label htmlFor={htmlFor} className="text-sm font-medium text-[#111827]">{children}</label>;
}

function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={["h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]", className].join(" ")} />;
}

function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={["min-h-[110px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]", className].join(" ")} />;
}

function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={["h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]", className].join(" ")}>{children}</select>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A] disabled:cursor-not-allowed disabled:opacity-70">
      {pending ? "Guardando..." : "Guardar compra"}
    </button>
  );
}

export function CompraForm({ proveedores }: { proveedores: Proveedor[] }) {
  const [state, formAction] = useFormState(createCompraVehiculoAction, initialState);
  const providerOptions = useMemo(() => proveedores, [proveedores]);
  const [precioCompra, setPrecioCompra] = useState("");
  const [deudaPendiente, setDeudaPendiente] = useState("");
  const [generarMovimientoCaja, setGenerarMovimientoCaja] = useState(true);
  const [montoPagadoCaja, setMontoPagadoCaja] = useState("");
  const [medioCaja, setMedioCaja] = useState("efectivo");
  const [conceptoCaja, setConceptoCaja] = useState("Compra de vehículo");

  useEffect(() => {
    const compra = Number(String(precioCompra).replace(/\./g, "").replace(",", "."));
    const deuda = Number(String(deudaPendiente).replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(compra)) return;

    if (!montoPagadoCaja || montoPagadoCaja === "0") {
      const suggested = Number.isFinite(deuda) && deuda > 0 ? Math.max(compra - deuda, 0) : compra;
      setMontoPagadoCaja(String(suggested));
    }
  }, [precioCompra, deudaPendiente]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Datos de compra</h2>
        </div>
        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="fecha">Fecha *</FieldLabel>
            <Input id="fecha" name="fecha" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="nro_operacion">Nro operación</FieldLabel>
            <Input id="nro_operacion" name="nro_operacion" placeholder="OP-2026-001" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="proveedor_id">Proveedor</FieldLabel>
            <Select id="proveedor_id" name="proveedor_id" defaultValue="">
              <option value="">Sin proveedor</option>
              {providerOptions.map((proveedor) => (
                <option key={proveedor.id} value={proveedor.id}>
                  {proveedor.nombre ?? "Proveedor"}{proveedor.categoria ? ` · ${proveedor.categoria}` : ""}{proveedor.telefono ? ` · ${proveedor.telefono}` : ""}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Vehículo</h2>
        </div>
        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="marca">Marca *</FieldLabel>
            <Input id="marca" name="marca" placeholder="Toyota" required />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="modelo">Modelo *</FieldLabel>
            <Input id="modelo" name="modelo" placeholder="Hilux" required />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="version">Versión</FieldLabel>
            <Input id="version" name="version" placeholder="SRX 4x4" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="anio">Año</FieldLabel>
            <Input id="anio" name="anio" type="number" min="1900" step="1" placeholder="2022" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="color">Color</FieldLabel>
            <Input id="color" name="color" placeholder="Blanco" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="km">KM *</FieldLabel>
            <Input id="km" name="km" type="number" min="0" step="1" defaultValue={0} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="dominio">Dominio</FieldLabel>
            <Input id="dominio" name="dominio" placeholder="AB123CD" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="motor">Motor</FieldLabel>
            <Input id="motor" name="motor" placeholder="2.8 TDI" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Valores</h2>
        </div>
        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="moneda">Moneda *</FieldLabel>
            <Select id="moneda" name="moneda" defaultValue="ARS" required>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="precio_compra">Precio compra *</FieldLabel>
            <Input
              id="precio_compra"
              name="precio_compra"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={precioCompra}
              onChange={(event) => setPrecioCompra(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="precio_boleto">Precio boleto</FieldLabel>
            <Input id="precio_boleto" name="precio_boleto" type="number" min="0" step="0.01" placeholder="0" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="diferencia_b">Diferencia B</FieldLabel>
            <Input id="diferencia_b" name="diferencia_b" type="number" step="0.01" placeholder="0" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="deuda_pendiente">Deuda pendiente</FieldLabel>
            <Input
              id="deuda_pendiente"
              name="deuda_pendiente"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={deudaPendiente}
              onChange={(event) => setDeudaPendiente(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Impacto en caja</h2>
        </div>
        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 md:col-span-2">
            <input
              type="checkbox"
              name="generar_movimiento_caja"
              checked={generarMovimientoCaja}
              onChange={(event) => setGenerarMovimientoCaja(event.target.checked)}
              className="h-4 w-4 rounded border-[#D1D5DB] text-[#18181B] focus:ring-[#E5E7EB]"
            />
            <div className="space-y-1">
              <span className="block text-sm font-medium text-[#111827]">Generar movimiento de caja</span>
              <p className="text-xs text-[#6B7280]">
                Si activás esta opción, la compra generará automáticamente un egreso en Caja.
              </p>
            </div>
          </label>
          <div className="space-y-2">
            <FieldLabel htmlFor="monto_pagado_caja">Monto pagado en Caja</FieldLabel>
            <Input
              id="monto_pagado_caja"
              name="monto_pagado_caja"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={montoPagadoCaja}
              onChange={(event) => setMontoPagadoCaja(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="medio_caja">Medio Caja</FieldLabel>
            <Select id="medio_caja" name="medio_caja" value={medioCaja} onChange={(event) => setMedioCaja(event.target.value)}>
              {MEDIOS_CAJA.map((medio) => (
                <option key={medio} value={medio}>
                  {medio
                    .split("_")
                    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                    .join(" ")}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="cuenta_caja">Cuenta Caja</FieldLabel>
            <Input id="cuenta_caja" name="cuenta_caja" placeholder="Cuenta o subcuenta" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="concepto_caja">Concepto Caja</FieldLabel>
            <Input
              id="concepto_caja"
              name="concepto_caja"
              placeholder="Compra de vehículo"
              value={conceptoCaja}
              onChange={(event) => setConceptoCaja(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Stock inicial</h2>
        </div>
        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="ubicacion">Ubicación</FieldLabel>
            <Input id="ubicacion" name="ubicacion" placeholder="Showroom / Base / Depósito" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="precio_infoauto_compra">Precio Infoauto compra</FieldLabel>
            <Input id="precio_infoauto_compra" name="precio_infoauto_compra" type="number" min="0" step="0.01" placeholder="0" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="precio_infoauto_actual">Precio Infoauto actual</FieldLabel>
            <Input id="precio_infoauto_actual" name="precio_infoauto_actual" type="number" min="0" step="0.01" placeholder="0" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="precio_permuta">Precio permuta</FieldLabel>
            <Input id="precio_permuta" name="precio_permuta" type="number" min="0" step="0.01" placeholder="0" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="precio_contado">Precio contado</FieldLabel>
            <Input id="precio_contado" name="precio_contado" type="number" min="0" step="0.01" placeholder="0" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="precio_venta">Precio venta</FieldLabel>
            <Input id="precio_venta" name="precio_venta" type="number" min="0" step="0.01" placeholder="0" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="costo_reposicion">Costo reposición</FieldLabel>
            <Input id="costo_reposicion" name="costo_reposicion" type="number" min="0" step="0.01" placeholder="0" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="estado_preparacion">Estado preparación</FieldLabel>
            <Select id="estado_preparacion" name="estado_preparacion" defaultValue="sin_preparar">
              <option value="sin_preparar">Sin preparar</option>
              <option value="pendiente">Pendiente</option>
              <option value="en proceso">En proceso</option>
              <option value="listo">Listo</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Observaciones</h2>
        </div>
        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="observaciones">Observaciones compra</FieldLabel>
            <Textarea id="observaciones" name="observaciones" placeholder="Notas internas sobre la compra..." />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="observaciones_vehiculo">Observaciones vehículo</FieldLabel>
            <Textarea id="observaciones_vehiculo" name="observaciones_vehiculo" placeholder="Notas sobre estado, detalles de ingreso..." />
          </div>
        </div>
      </div>

      {state.error ? (
        <div className="rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">{state.error}</div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <SubmitButton />
        <Link href="/compras" className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
