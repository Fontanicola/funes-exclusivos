"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { convertLeadToVentaAction } from "@/app/(dashboard)/crm/actions";
import { PermutaFields } from "@/components/ventas/permuta-fields";

type Vehicle = {
  id: string;
  marca: string | null;
  modelo: string | null;
  version: string | null;
  anio: number | null;
  dominio: string | null;
  precio_venta: number | null;
  precio_moneda: string | null;
  estado: string | null;
};

type Seller = {
  id: string;
  nombre: string | null;
  email: string | null;
  rol: string | null;
  activo: boolean | null;
};

type Lead = {
  id: string;
  nombre: string | null;
  telefono?: string | null;
  email?: string | null;
  documento?: string | null;
  estado?: string | null;
  origen?: string | null;
  vehiculo_interes_id?: string | null;
  vendedor_id?: string | null;
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
        "min-h-[110px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]",
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
      {pending ? "Convirtiendo..." : "Convertir en venta"}
    </button>
  );
}

function formatVehicleLabel(vehicle: Vehicle) {
  return [
    vehicle.marca ?? "-",
    vehicle.modelo ?? "",
    vehicle.version ? `· ${vehicle.version}` : "",
    vehicle.anio ? `· ${vehicle.anio}` : "",
    vehicle.dominio ? `· ${vehicle.dominio}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function LeadConvertSaleForm({
  lead,
  vehicles,
  sellers,
}: {
  lead: Lead;
  vehicles: Vehicle[];
  sellers: Seller[];
}) {
  const [state, formAction] = useFormState(convertLeadToVentaAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const initialVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === lead.vehiculo_interes_id) ?? null,
    [lead.vehiculo_interes_id, vehicles]
  );
  const initialSellerId = lead.vendedor_id && sellers.some((seller) => seller.id === lead.vendedor_id)
    ? lead.vendedor_id
    : "";
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicle?.id ?? "");
  const [selectedSellerId, setSelectedSellerId] = useState(initialSellerId);
  const [selectedMethod, setSelectedMethod] = useState("transferencia");
  const [priceValue, setPriceValue] = useState(initialVehicle?.precio_venta != null ? String(initialVehicle.precio_venta) : "");
  const [currencyValue, setCurrencyValue] = useState(initialVehicle?.precio_moneda ?? "ARS");
  const [usedAmount, setUsedAmount] = useState("");

  useEffect(() => {
    const foundVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null;
    if (foundVehicle?.precio_venta != null) {
      setPriceValue(String(foundVehicle.precio_venta));
    }
    if (foundVehicle?.precio_moneda) {
      setCurrencyValue(foundVehicle.precio_moneda);
    }
  }, [selectedVehicleId, vehicles]);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  const showPermutaFields = selectedMethod === "permuta" || Number(usedAmount || 0) > 0;

  return (
    <form ref={formRef} action={formAction} className="space-y-5 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <input type="hidden" name="lead_id" value={lead.id} />

      {state.error ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-sm text-[#111827]">
          {state.error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-[#111827]">Cliente</h3>
          <p className="text-xs text-[#6B7280]">Se precargan los datos del lead y podés ajustarlos antes de convertir.</p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="cliente_nombre">Nombre *</FieldLabel>
            <Input id="cliente_nombre" name="cliente_nombre" defaultValue={lead.nombre ?? ""} required />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="cliente_telefono">Teléfono</FieldLabel>
            <Input id="cliente_telefono" name="cliente_telefono" defaultValue={lead.telefono ?? ""} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="cliente_email">Email</FieldLabel>
            <Input id="cliente_email" name="cliente_email" type="email" defaultValue={lead.email ?? ""} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="cliente_documento">Documento</FieldLabel>
            <Input id="cliente_documento" name="cliente_documento" defaultValue={lead.documento ?? ""} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-[#111827]">Operación</h3>
          <p className="text-xs text-[#6B7280]">La venta se registrará con las integraciones automáticas activas.</p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="fecha_venta">Fecha de venta *</FieldLabel>
            <Input id="fecha_venta" name="fecha_venta" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="vehiculo_id">Vehículo *</FieldLabel>
            <Select
              id="vehiculo_id"
              name="vehiculo_id"
              value={selectedVehicleId}
              onChange={(event) => setSelectedVehicleId(event.target.value)}
              required
            >
              <option value="">Seleccionar vehículo</option>
              {vehicles.length ? (
                vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {formatVehicleLabel(vehicle)}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No hay vehículos en stock
                </option>
              )}
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="vendedor_id">Vendedor *</FieldLabel>
            <Select
              id="vendedor_id"
              name="vendedor_id"
              value={selectedSellerId}
              onChange={(event) => setSelectedSellerId(event.target.value)}
              required
            >
              <option value="">Seleccionar vendedor</option>
              {sellers.length ? (
                sellers.map((seller) => (
                  <option key={seller.id} value={seller.id}>
                    {seller.nombre ?? seller.email ?? "Vendedor"}{seller.rol ? ` · ${seller.rol}` : ""}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No hay vendedores activos
                </option>
              )}
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="moneda">Moneda *</FieldLabel>
            <Select
              id="moneda"
              name="moneda"
              value={currencyValue}
              onChange={(event) => setCurrencyValue(event.target.value)}
              required
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="precio_venta">Precio venta *</FieldLabel>
            <Input
              id="precio_venta"
              name="precio_venta"
              type="number"
              min="0"
              step="0.01"
              value={priceValue}
              onChange={(event) => setPriceValue(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="metodo_pago">Método de pago *</FieldLabel>
            <Select
              id="metodo_pago"
              name="metodo_pago"
              value={selectedMethod}
              onChange={(event) => setSelectedMethod(event.target.value)}
              required
            >
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
              <option value="dolares">Dólares</option>
              <option value="pesos">Pesos</option>
              <option value="permuta">Permuta</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-[#111827]">Pagos iniciales</h3>
          <p className="text-xs text-[#6B7280]">
            Los pagos monetarios se cargarán automáticamente en Caja. El usado recibido no genera caja.
          </p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <FieldLabel htmlFor="pago_senia">Seña</FieldLabel>
            <Input id="pago_senia" name="pago_senia" type="number" min="0" step="0.01" placeholder="0" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="pago_efectivo">Efectivo</FieldLabel>
            <Input id="pago_efectivo" name="pago_efectivo" type="number" min="0" step="0.01" placeholder="0" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="pago_transferencia">Transferencia</FieldLabel>
            <Input id="pago_transferencia" name="pago_transferencia" type="number" min="0" step="0.01" placeholder="0" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="pago_credito">Crédito</FieldLabel>
            <Input id="pago_credito" name="pago_credito" type="number" min="0" step="0.01" placeholder="0" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="pago_usado">Usado recibido</FieldLabel>
            <Input
              id="pago_usado"
              name="pago_usado"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={usedAmount}
              onChange={(event) => setUsedAmount(event.target.value)}
            />
          </div>
          <div className="lg:col-span-3">
            <p className="text-xs leading-5 text-[#6B7280]">
              Si ingresás un usado recibido, se desplegará la captura del vehículo de permuta para completar su alta.
            </p>
          </div>
        </div>
      </div>

      {showPermutaFields ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-[#111827]">Vehículo recibido</h3>
            <p className="text-xs text-[#6B7280]">
              Al convertir el lead, se registrará la venta y se ejecutarán las integraciones automáticas de caja, comisión y pendiente de entrega.
            </p>
          </div>
          <div className="mt-4">
            <PermutaFields />
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
        <div className="space-y-2">
          <FieldLabel htmlFor="observaciones">Observaciones</FieldLabel>
          <Textarea id="observaciones" name="observaciones" placeholder="Notas internas sobre la conversión..." />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] pt-2 sm:flex-row sm:items-center sm:justify-end">
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
