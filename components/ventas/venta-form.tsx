"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createVentaAction } from "@/app/(dashboard)/ventas/actions";
import { PermutaFields } from "./permuta-fields";
import { Search, X } from "lucide-react";

type VehiculoDisponible = {
  id: string;
  marca: string | null;
  modelo: string | null;
  version: string | null;
  anio: number | null;
  dominio: string | null;
  precio_venta: number | null;
  precio_moneda: string | null;
  precio_contado?: number | null;
  precio_permuta?: number | null;
  precio_infoauto_actual?: number | null;
  costo_reposicion?: number | null;
  fotos: string[] | string | null;
};

type ActionState = {
  error?: string;
};

type Vendedor = { id: string; nombre: string | null; email: string | null; rol: string | null };

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
        "h-11 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]",
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
        "min-h-[110px] w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]",
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
        "h-11 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]",
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
      className="inline-flex h-11 items-center justify-center rounded-md bg-[#8A1538] px-4 text-sm font-medium text-white transition hover:bg-[#6F102D] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Registrando..." : "Registrar venta"}
    </button>
  );
}

function parseFotos(fotos: VehiculoDisponible["fotos"]) {
  if (Array.isArray(fotos)) return fotos;
  if (typeof fotos === "string") {
    try {
      const parsed = JSON.parse(fotos);
      if (Array.isArray(parsed)) return parsed;
      return fotos ? [fotos] : [];
    } catch {
      return fotos ? [fotos] : [];
    }
  }
  return [];
}

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

export function VentaForm({ vehiculos, vendedores = [] }: { vehiculos: VehiculoDisponible[]; vendedores?: Vendedor[] }) {
  const [state, formAction] = useFormState(createVentaAction, initialState);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<VehiculoDisponible | null>(null);
  const [metodoPago, setMetodoPago] = useState("transferencia");
  const [precioVenta, setPrecioVenta] = useState("");
  const [moneda, setMoneda] = useState("ARS");
  const [vehicleQuery, setVehicleQuery] = useState("");
  const [vehicleSearchOpen, setVehicleSearchOpen] = useState(false);

  const selectedVehicleOptions = useMemo(
    () =>
      vehiculos.map((vehiculo) => ({
        ...vehiculo,
        photos: parseFotos(vehiculo.fotos),
      })),
    [vehiculos]
  );
  const filteredVehicles = useMemo(() => {
    const query = vehicleQuery.trim().toLowerCase();
    if (!query) return selectedVehicleOptions.slice(0, 12);
    return selectedVehicleOptions.filter((vehicle) =>
      [vehicle.marca, vehicle.modelo, vehicle.version, vehicle.anio, vehicle.dominio]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    ).slice(0, 12);
  }, [selectedVehicleOptions, vehicleQuery]);

  useEffect(() => {
    const found = selectedVehicleOptions.find((vehicle) => vehicle.id === selectedVehicleId) ?? null;
    setSelectedVehicle(found);
    if (found?.precio_venta != null) {
      setPrecioVenta(String(found.precio_venta));
    }
    if (found?.precio_moneda) {
      setMoneda(found.precio_moneda);
    }
  }, [selectedVehicleId, selectedVehicleOptions]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-md border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Vehículo vendido</h2>
        </div>
        <div className="space-y-4 px-5 py-5">
          <div className="space-y-2">
            <FieldLabel htmlFor="vehiculo_id">Vehículo *</FieldLabel>
            <input type="hidden" name="vehiculo_id" value={selectedVehicleId} />
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#9CA3AF]" />
              <Input
                id="vehiculo_busqueda"
                value={selectedVehicle ? `${selectedVehicle.marca ?? ""} ${selectedVehicle.modelo ?? ""} · ${selectedVehicle.dominio ?? "Sin patente"}` : vehicleQuery}
                onChange={(event) => {
                  setVehicleQuery(event.target.value);
                  setSelectedVehicleId("");
                  setVehicleSearchOpen(true);
                }}
                onFocus={() => setVehicleSearchOpen(true)}
                placeholder="Buscar por patente, marca o modelo"
                autoComplete="off"
                required={!selectedVehicleId}
                className="pl-10 pr-10"
              />
              {selectedVehicle ? (
                <button type="button" onClick={() => { setSelectedVehicleId(""); setVehicleQuery(""); setVehicleSearchOpen(true); }} className="absolute right-3 top-3 text-[#6B7280] hover:text-[#111827]" aria-label="Limpiar vehículo">
                  <X className="h-4 w-4" />
                </button>
              ) : null}
              {vehicleSearchOpen && !selectedVehicleId ? (
                <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-[#E5E7EB] bg-white p-1 shadow-lg">
                  {filteredVehicles.length ? filteredVehicles.map((vehiculo) => (
                    <button key={vehiculo.id} type="button" onClick={() => { setSelectedVehicleId(vehiculo.id); setVehicleQuery(""); setVehicleSearchOpen(false); }} className="w-full rounded px-3 py-2 text-left text-sm hover:bg-[#F9FAFB]">
                      <span className="font-medium text-[#111827]">{vehiculo.marca ?? "-"} {vehiculo.modelo ?? ""}</span>
                      <span className="ml-2 text-[#6B7280]">{vehiculo.dominio ?? "Sin patente"}{vehiculo.anio ? ` · ${vehiculo.anio}` : ""}</span>
                    </button>
                  )) : <p className="px-3 py-3 text-sm text-[#6B7280]">No encontramos vehículos.</p>}
                </div>
              ) : null}
            </div>
            <p className="text-xs text-[#6B7280]">Escribí la patente para encontrar el vehículo rápidamente.</p>
          </div>

          {selectedVehicle ? (
            <div className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827]">
              <p className="font-medium">
                {selectedVehicle.marca ?? "-"} {selectedVehicle.modelo ?? ""}
              </p>
              <p className="mt-1 text-[#6B7280]">
                {selectedVehicle.version ? `${selectedVehicle.version} · ` : ""}
                {selectedVehicle.anio ? `${selectedVehicle.anio} · ` : ""}
                {selectedVehicle.dominio ?? "Sin dominio"}
              </p>
              <p className="mt-2 text-xs text-[#6B7280]">
                Contado {selectedVehicle.precio_contado ?? selectedVehicle.precio_venta ?? "—"} · Permuta{" "}
                {selectedVehicle.precio_permuta ?? "—"} · Infoauto{" "}
                {selectedVehicle.precio_infoauto_actual ?? "—"}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-md border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Cliente</h2>
        </div>
        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
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
            <Input id="cliente_documento" name="cliente_documento" placeholder="DNI / CUIT" />
          </div>
        </div>
      </div>

      <div className="rounded-md border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Operación</h2>
        </div>
        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="fecha_venta">Fecha de venta *</FieldLabel>
            <Input id="fecha_venta" name="fecha_venta" type="date" defaultValue={todayValue()} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="vendedor_id">Vendedor</FieldLabel>
            <Select id="vendedor_id" name="vendedor_id" defaultValue="">
              <option value="">Vendedor actual</option>
              {vendedores.map((vendedor) => <option key={vendedor.id} value={vendedor.id}>{vendedor.nombre ?? vendedor.email ?? "Vendedor"}</option>)}
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
              value={precioVenta}
              onChange={(event) => setPrecioVenta(event.target.value)}
              placeholder="0"
              required
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="precio_infoauto">Precio Infoauto</FieldLabel>
            <Input id="precio_infoauto" name="precio_infoauto" type="number" min="0" step="0.01" placeholder="0" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="costo_reposicion">Costo reposición</FieldLabel>
            <Input id="costo_reposicion" name="costo_reposicion" type="number" min="0" step="0.01" placeholder="0" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="costo_historico">Costo histórico</FieldLabel>
            <Input id="costo_historico" name="costo_historico" type="number" min="0" step="0.01" placeholder="0" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="importe_gestoria">Importe gestoría</FieldLabel>
            <Input id="importe_gestoria" name="importe_gestoria" type="number" min="0" step="0.01" placeholder="0" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="importe_escribania">Importe escribanía</FieldLabel>
            <Input id="importe_escribania" name="importe_escribania" type="number" min="0" step="0.01" placeholder="0" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="moneda">Moneda *</FieldLabel>
            <Select
              id="moneda"
              name="moneda"
              value={moneda}
              onChange={(event) => setMoneda(event.target.value)}
              required
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="metodo_pago">Método de pago *</FieldLabel>
            <Select
              id="metodo_pago"
              name="metodo_pago"
              value={metodoPago}
              onChange={(event) => setMetodoPago(event.target.value)}
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

      <div className="rounded-md border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Pagos iniciales</h2>
        </div>
        <div className="grid gap-4 px-5 py-5 md:grid-cols-2 lg:grid-cols-3">
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
            <Input id="pago_usado" name="pago_usado" type="number" min="0" step="0.01" placeholder="0" />
          </div>
          <div className="lg:col-span-3">
            <p className="text-xs leading-5 text-[#6B7280]">
              Los pagos monetarios se cargarán automáticamente en Caja. El usado recibido no genera caja.
            </p>
          </div>
        </div>
      </div>

      {metodoPago === "permuta" ? (
        <div className="rounded-md border border-[#E5E7EB] bg-white">
          <div className="border-b border-[#E5E7EB] px-5 py-4">
            <h2 className="text-base font-semibold text-[#111827]">Permuta</h2>
          </div>
          <div className="px-5 py-5">
            <PermutaFields />
          </div>
        </div>
      ) : null}

      <div className="rounded-md border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Observaciones</h2>
        </div>
        <div className="px-5 py-5">
          <div className="space-y-2">
            <FieldLabel htmlFor="observaciones">Observaciones</FieldLabel>
            <Textarea
              id="observaciones"
              name="observaciones"
              placeholder="Notas internas sobre la operación..."
            />
          </div>
          <div className="space-y-2 pt-4">
            <FieldLabel htmlFor="saldo_preventa">Saldo preventa</FieldLabel>
            <Input id="saldo_preventa" name="saldo_preventa" type="number" min="0" step="0.01" placeholder="0" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="saldo_efectivo">Saldo efectivo</FieldLabel>
            <Input id="saldo_efectivo" name="saldo_efectivo" type="number" min="0" step="0.01" placeholder="0" />
          </div>
        </div>
      </div>

      {state.error ? (
        <div className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-5 py-4 text-sm text-[#111827]">
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] pt-2 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href="/ventas"
          className="inline-flex h-11 items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
        >
          Cancelar
        </Link>
        <SubmitButton />
      </div>
    </form>
  );
}
