"use client";

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

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

export function PermutaFields() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="permuta_marca">Marca *</FieldLabel>
          <Input id="permuta_marca" name="permuta_marca" placeholder="Chevrolet" />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="permuta_modelo">Modelo *</FieldLabel>
          <Input id="permuta_modelo" name="permuta_modelo" placeholder="Onix" />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="permuta_version">Versión</FieldLabel>
          <Input id="permuta_version" name="permuta_version" placeholder="LTZ" />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="permuta_anio">Año</FieldLabel>
          <Input id="permuta_anio" name="permuta_anio" type="number" min="1900" step="1" placeholder="2021" />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="permuta_color">Color</FieldLabel>
          <Input id="permuta_color" name="permuta_color" placeholder="Gris" />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="permuta_km">KM *</FieldLabel>
          <Input id="permuta_km" name="permuta_km" type="number" min="0" step="1" defaultValue={0} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <FieldLabel htmlFor="permuta_dominio">Dominio</FieldLabel>
          <Input id="permuta_dominio" name="permuta_dominio" placeholder="AB123CD" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="monto_permuta">Monto permuta *</FieldLabel>
          <Input id="monto_permuta" name="monto_permuta" type="number" min="0" step="0.01" placeholder="0" />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="permuta_precio_venta">Precio estimado</FieldLabel>
          <Input id="permuta_precio_venta" name="permuta_precio_venta" type="number" min="0" step="0.01" placeholder="0" />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="permuta_precio_moneda">Moneda estimada *</FieldLabel>
          <select
            id="permuta_precio_moneda"
            name="permuta_precio_moneda"
            defaultValue="ARS"
            className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]"
          >
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <FieldLabel htmlFor="permuta_observaciones">Observaciones</FieldLabel>
          <Textarea
            id="permuta_observaciones"
            name="permuta_observaciones"
            placeholder="Estado del vehículo recibido, documentación, detalles internos..."
          />
        </div>
      </div>

      <p className="text-sm text-[#6B7280]">
        Al registrar la venta, este vehículo se cargará automáticamente en Inventario como En stock.
      </p>
    </div>
  );
}
