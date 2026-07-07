"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  createVehiculoAction,
  updateVehiculoAction,
} from "@/app/(dashboard)/inventario/actions";

type VehiculoFormMode = "create" | "edit";

type VehiculoFormValue = {
  id: string;
  marca: string | null;
  modelo: string | null;
  version: string | null;
  anio: number | null;
  color: string | null;
  km: number | null;
  dominio: string | null;
  motor: string | null;
  ubicacion: string | null;
  nro_operacion: string | null;
  proveedor_id: string | null;
  fecha_compra: string | null;
  costo_adquisicion: number | null;
  costo_moneda: string | null;
  precio_venta: number | null;
  precio_moneda: string | null;
  precio_infoauto_compra: number | null;
  precio_infoauto_actual: number | null;
  precio_infoauto_anterior: number | null;
  precio_permuta: number | null;
  precio_contado: number | null;
  costo_reposicion: number | null;
  estado: string | null;
  estado_preparacion: string | null;
  chapero: string | null;
  preparacion_comentarios: string | null;
  publicado_mercadolibre: boolean | null;
  publicado_rodados_google: boolean | null;
  fotos: string[] | string | null;
  fecha_ingreso: string | null;
  descripcion?: string | null;
  observaciones?: string | null;
};

type Proveedor = {
  id: string;
  nombre: string | null;
  categoria: string | null;
};

type ActionState = {
  error?: string;
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

function Checkbox({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      {...props}
      className={[
        "h-4 w-4 rounded border-[#D1D5DB] text-[#18181B] outline-none focus:ring-2 focus:ring-[#F3F4F6]",
        className,
      ].join(" ")}
    />
  );
}

function SubmitButton({ mode }: { mode: VehiculoFormMode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Guardando..." : mode === "edit" ? "Guardar cambios" : "Guardar vehículo"}
    </button>
  );
}

function parseFotosValue(
  fotos: VehiculoFormValue["fotos"] | undefined
) {
  if (Array.isArray(fotos)) return fotos;
  if (typeof fotos === "string") {
    try {
      const parsed = JSON.parse(fotos);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
      return fotos ? [fotos] : [];
    } catch {
      return fotos ? [fotos] : [];
    }
  }
  return [];
}

function formatDateValue(value: string | null) {
  if (!value) return "";
  return value.includes("T") ? value.slice(0, 10) : value;
}

function getInitials(marca: string | null, modelo: string | null) {
  const first = marca?.trim().charAt(0) ?? "";
  const second = modelo?.trim().charAt(0) ?? "";
  const initials = `${first}${second}`.trim();
  return initials ? initials.toUpperCase() : "VE";
}

export function VehiculoForm({
  mode,
  proveedores,
  vehiculo,
}: {
  mode: VehiculoFormMode;
  proveedores: Proveedor[];
  vehiculo?: VehiculoFormValue;
}) {
  const [keptFotos, setKeptFotos] = useState<string[]>(
    () => parseFotosValue(vehiculo?.fotos)
  );
  const action = mode === "edit" ? updateVehiculoAction : createVehiculoAction;
  const [state, formAction] = useFormState(action, initialState);

  const initialPhotos = useMemo(() => parseFotosValue(vehiculo?.fotos), [vehiculo?.fotos]);

  const effectiveKeptFotos = mode === "edit" ? keptFotos : [];

  return (
    <form action={formAction} className="space-y-6" encType="multipart/form-data">
      {mode === "edit" && vehiculo?.id ? (
        <input type="hidden" name="id" value={vehiculo.id} />
      ) : null}

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">
            Datos del vehículo
          </h2>
        </div>

        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="marca">Marca *</FieldLabel>
            <Input
              id="marca"
              name="marca"
              placeholder="Toyota"
              required
              defaultValue={vehiculo?.marca ?? ""}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="modelo">Modelo *</FieldLabel>
            <Input
              id="modelo"
              name="modelo"
              placeholder="Corolla"
              required
              defaultValue={vehiculo?.modelo ?? ""}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="version">Versión</FieldLabel>
            <Input
              id="version"
              name="version"
              placeholder="XEI 2.0 CVT"
              defaultValue={vehiculo?.version ?? ""}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="anio">Año</FieldLabel>
            <Input
              id="anio"
              name="anio"
              type="number"
              min="1900"
              step="1"
              placeholder="2022"
              defaultValue={vehiculo?.anio ?? ""}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="color">Color</FieldLabel>
            <Input
              id="color"
              name="color"
              placeholder="Blanco"
              defaultValue={vehiculo?.color ?? ""}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="km">KM *</FieldLabel>
            <Input
              id="km"
              name="km"
              type="number"
              min="0"
              step="1"
              required
              defaultValue={vehiculo?.km ?? 0}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="dominio">Dominio</FieldLabel>
            <Input
              id="dominio"
              name="dominio"
              placeholder="AB123CD"
              defaultValue={vehiculo?.dominio ?? ""}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Compra y proveedor</h2>
        </div>

        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="proveedor_id">Proveedor</FieldLabel>
            <Select id="proveedor_id" name="proveedor_id" defaultValue={vehiculo?.proveedor_id ?? ""}>
              <option value="">Sin proveedor</option>
              {proveedores.map((proveedor) => (
                <option key={proveedor.id} value={proveedor.id}>
                  {proveedor.nombre ?? "Proveedor"}
                  {proveedor.categoria ? ` · ${proveedor.categoria}` : ""}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="fecha_compra">Fecha compra</FieldLabel>
            <Input
              id="fecha_compra"
              name="fecha_compra"
              type="date"
              defaultValue={formatDateValue(vehiculo?.fecha_compra ?? null)}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="motor">Motor</FieldLabel>
            <Input id="motor" name="motor" placeholder="2.0 TSI / V6" defaultValue={vehiculo?.motor ?? ""} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="ubicacion">Ubicación</FieldLabel>
            <Input id="ubicacion" name="ubicacion" placeholder="Base / depósito / showroom" defaultValue={vehiculo?.ubicacion ?? ""} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="nro_operacion">Nro. operación</FieldLabel>
            <Input id="nro_operacion" name="nro_operacion" placeholder="OC-2026-001" defaultValue={vehiculo?.nro_operacion ?? ""} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Pricing</h2>
        </div>

        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="costo_adquisicion">Costo adquisición</FieldLabel>
            <Input
              id="costo_adquisicion"
              name="costo_adquisicion"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              defaultValue={vehiculo?.costo_adquisicion ?? ""}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="costo_moneda">Moneda costo *</FieldLabel>
            <Select
              id="costo_moneda"
              name="costo_moneda"
              defaultValue={vehiculo?.costo_moneda ?? "ARS"}
              required
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="precio_venta">Precio venta</FieldLabel>
            <Input
              id="precio_venta"
              name="precio_venta"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              defaultValue={vehiculo?.precio_venta ?? ""}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="precio_moneda">Moneda venta *</FieldLabel>
            <Select
              id="precio_moneda"
              name="precio_moneda"
              defaultValue={vehiculo?.precio_moneda ?? "ARS"}
              required
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="precio_contado">Precio contado</FieldLabel>
            <Input id="precio_contado" name="precio_contado" type="number" min="0" step="0.01" placeholder="0" defaultValue={vehiculo?.precio_contado ?? ""} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="precio_permuta">Precio permuta</FieldLabel>
            <Input id="precio_permuta" name="precio_permuta" type="number" min="0" step="0.01" placeholder="0" defaultValue={vehiculo?.precio_permuta ?? ""} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="precio_infoauto_actual">Infoauto actual</FieldLabel>
            <Input id="precio_infoauto_actual" name="precio_infoauto_actual" type="number" min="0" step="0.01" placeholder="0" defaultValue={vehiculo?.precio_infoauto_actual ?? ""} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="precio_infoauto_compra">Infoauto compra</FieldLabel>
            <Input id="precio_infoauto_compra" name="precio_infoauto_compra" type="number" min="0" step="0.01" placeholder="0" defaultValue={vehiculo?.precio_infoauto_compra ?? ""} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="precio_infoauto_anterior">Infoauto anterior</FieldLabel>
            <Input id="precio_infoauto_anterior" name="precio_infoauto_anterior" type="number" min="0" step="0.01" placeholder="0" defaultValue={vehiculo?.precio_infoauto_anterior ?? ""} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="costo_reposicion">Costo reposición</FieldLabel>
            <Input id="costo_reposicion" name="costo_reposicion" type="number" min="0" step="0.01" placeholder="0" defaultValue={vehiculo?.costo_reposicion ?? ""} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Preparación</h2>
        </div>

        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="estado">Estado *</FieldLabel>
            <Select
              id="estado"
              name="estado"
              defaultValue={vehiculo?.estado ?? "en_stock"}
              required
            >
              <option value="en_stock">En stock</option>
              <option value="vendido">Vendido</option>
              <option value="en_consignacion">Consignación</option>
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="fecha_ingreso">Fecha de ingreso *</FieldLabel>
            <Input
              id="fecha_ingreso"
              name="fecha_ingreso"
              type="date"
              defaultValue={formatDateValue(vehiculo?.fecha_ingreso ?? null)}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="estado_preparacion">Estado preparación</FieldLabel>
            <Input
              id="estado_preparacion"
              name="estado_preparacion"
              placeholder="Pendiente / en proceso / listo"
              defaultValue={vehiculo?.estado_preparacion ?? ""}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="chapero">Chapero</FieldLabel>
            <Input id="chapero" name="chapero" placeholder="Nombre o taller" defaultValue={vehiculo?.chapero ?? ""} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="preparacion_comentarios">Comentarios de preparación</FieldLabel>
            <Textarea
              id="preparacion_comentarios"
              name="preparacion_comentarios"
              placeholder="Observaciones internas sobre chapa, detailing o puesta a punto."
              defaultValue={vehiculo?.preparacion_comentarios ?? ""}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Publicación externa</h2>
        </div>

        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3">
            <Checkbox
              name="publicado_mercadolibre"
              defaultChecked={Boolean(vehiculo?.publicado_mercadolibre)}
            />
            <span className="text-sm text-[#111827]">Publicado en MercadoLibre</span>
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3">
            <Checkbox
              name="publicado_rodados_google"
              defaultChecked={Boolean(vehiculo?.publicado_rodados_google)}
            />
            <span className="text-sm text-[#111827]">Publicado en Rodados Google</span>
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Fotos</h2>
        </div>

        <div className="space-y-4 px-5 py-5">
          {mode === "edit" && initialPhotos.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#111827]">
                  Fotos actuales
                </p>
                <p className="text-xs text-[#6B7280]">
                  {effectiveKeptFotos.length} de {initialPhotos.length} fotos
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {initialPhotos.map((url, index) => {
                  const checked = effectiveKeptFotos.includes(url);

                  return (
                    <label
                      key={`${url}-${index}`}
                      className={[
                        "group flex cursor-pointer flex-col gap-2 rounded-2xl border p-3 transition",
                        checked
                          ? "border-[#D1D5DB] bg-[#FAFAFA]"
                          : "border-[#E5E7EB] bg-white opacity-75 hover:bg-[#F9FAFB]",
                      ].join(" ")}
                    >
                      <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FAFAFA]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Foto actual ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            setKeptFotos((current) =>
                              event.target.checked
                                ? Array.from(new Set([...current, url]))
                                : current.filter((photo) => photo !== url)
                            );
                          }}
                          className="h-4 w-4 rounded border-[#D1D5DB] text-[#18181B] focus:ring-[#F3F4F6]"
                        />
                        <span className="text-sm text-[#111827]">
                          Conservar foto
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

              {effectiveKeptFotos.map((url) => (
                <input key={url} type="hidden" name="existing_fotos" value={url} />
              ))}
            </div>
          ) : null}

          <div className="space-y-2">
            <FieldLabel htmlFor="fotos">Subir fotos</FieldLabel>
            <Input
              id="fotos"
              name="fotos"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
            />
          </div>
          <p className="text-sm text-[#6B7280]">
            JPG, PNG o WEBP. Máximo 8 imágenes.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111827]">Observaciones</h2>
        </div>

        <div className="grid gap-4 px-5 py-5">
          <div className="space-y-2">
            <FieldLabel htmlFor="descripcion">Descripción</FieldLabel>
            <Textarea
              id="descripcion"
              name="descripcion"
              placeholder="Detalles generales de la unidad"
              defaultValue={vehiculo?.descripcion ?? ""}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="observaciones">Observaciones</FieldLabel>
            <Textarea
              id="observaciones"
              name="observaciones"
              placeholder="Notas internas, estado de papeles, accesorios, etc."
              defaultValue={vehiculo?.observaciones ?? ""}
            />
          </div>
        </div>
      </div>

      {state.error ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-5 py-4 text-sm text-[#111827]">
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] pt-2 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href="/inventario"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
        >
          Cancelar
        </Link>
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}
