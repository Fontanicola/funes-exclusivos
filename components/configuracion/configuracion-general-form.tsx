"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateConfiguracionGeneralAction } from "@/app/(dashboard)/configuracion/actions";

type ConfiguracionGeneral = {
  id: boolean;
  empresa_nombre: string | null;
  empresa_razon_social: string | null;
  empresa_cuit: string | null;
  empresa_direccion: string | null;
  empresa_telefono: string | null;
  empresa_email: string | null;
  empresa_website: string | null;
  moneda_principal: string | null;
  moneda_secundaria: string | null;
  porcentaje_comision_default: number | null;
  dias_alerta_gestoria: number | null;
  dias_alerta_leads: number | null;
  whatsapp_alertas_activas: boolean | null;
  catalogo_auto_publicar_stock: boolean | null;
};

type ActionState = {
  error?: string;
  success?: boolean;
};

const initialState: ActionState = {};

function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-[#111827]">
      {children}
    </label>
  );
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6] disabled:cursor-not-allowed disabled:bg-[#F9FAFB]",
        className,
      ].join(" ")}
    />
  );
}

function Select({ className = "", ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[
        "h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6] disabled:cursor-not-allowed disabled:bg-[#F9FAFB]",
        className,
      ].join(" ")}
    />
  );
}

function CheckboxField({
  id,
  name,
  label,
  defaultChecked,
  helpText,
  disabled = false,
}: {
  id: string;
  name: string;
  label: string;
  defaultChecked?: boolean;
  helpText?: string;
  disabled?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className={[
        "flex items-start gap-3 rounded-xl border border-[#E5E7EB] px-3 py-3",
        disabled ? "bg-[#F9FAFB] opacity-80" : "bg-[#FAFAFA]",
      ].join(" ")}
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="mt-1 h-4 w-4 rounded border-[#D1D5DB] text-[#18181B] focus:ring-[#D1D5DB] disabled:cursor-not-allowed"
      />
      <span className="space-y-1">
        <span className="block text-sm font-medium text-[#111827]">{label}</span>
        {helpText ? <span className="block text-xs text-[#6B7280]">{helpText}</span> : null}
      </span>
    </label>
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
      {pending ? "Guardando..." : "Guardar configuración"}
    </button>
  );
}

function toText(value: string | null | undefined) {
  return value ?? "";
}

export function ConfiguracionGeneralForm({ config }: { config: ConfiguracionGeneral }) {
  const [state, formAction] = useFormState(updateConfiguracionGeneralAction, initialState);
  const [localError, setLocalError] = useState<string | null>(null);

  const monedaPrincipal = config.moneda_principal ?? "USD";
  const monedaSecundaria = config.moneda_secundaria ?? "ARS";

  useEffect(() => {
    if (monedaPrincipal !== monedaSecundaria) {
      setLocalError(null);
    }
  }, [monedaPrincipal, monedaSecundaria]);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (monedaPrincipal === monedaSecundaria) {
          event.preventDefault();
          setLocalError("La moneda principal y secundaria no pueden ser iguales.");
        }
      }}
      className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm"
    >
      <div className="border-b border-[#E5E7EB] px-5 py-4">
        <h2 className="text-base font-semibold text-[#111827]">Configuración general</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Estos parámetros afectan valores por defecto y alertas operativas del sistema.
        </p>
      </div>

      <div className="space-y-6 px-5 py-5">
        {state.error ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-sm text-[#111827]">
            {state.error}
          </div>
        ) : null}

        {localError ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-sm text-[#111827]">
            {localError}
          </div>
        ) : null}

        {state.success ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827]">
            Configuración guardada.
          </div>
        ) : null}

        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[#111827]">Empresa</h3>
            <p className="mt-1 text-xs text-[#6B7280]">Datos legales y de contacto visibles en el sistema.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <FieldLabel htmlFor="empresa_nombre">Nombre de empresa</FieldLabel>
              <Input id="empresa_nombre" name="empresa_nombre" defaultValue={toText(config.empresa_nombre)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <FieldLabel htmlFor="empresa_razon_social">Razón social</FieldLabel>
              <Input id="empresa_razon_social" name="empresa_razon_social" defaultValue={toText(config.empresa_razon_social)} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="empresa_cuit">CUIT</FieldLabel>
              <Input id="empresa_cuit" name="empresa_cuit" defaultValue={toText(config.empresa_cuit)} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="empresa_telefono">Teléfono</FieldLabel>
              <Input id="empresa_telefono" name="empresa_telefono" defaultValue={toText(config.empresa_telefono)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <FieldLabel htmlFor="empresa_direccion">Dirección</FieldLabel>
              <Input id="empresa_direccion" name="empresa_direccion" defaultValue={toText(config.empresa_direccion)} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="empresa_email">Email</FieldLabel>
              <Input id="empresa_email" name="empresa_email" type="email" defaultValue={toText(config.empresa_email)} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="empresa_website">Website</FieldLabel>
              <Input id="empresa_website" name="empresa_website" defaultValue={toText(config.empresa_website)} />
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t border-[#E5E7EB] pt-5">
          <div>
            <h3 className="text-sm font-semibold text-[#111827]">Monedas</h3>
            <p className="mt-1 text-xs text-[#6B7280]">Definí la moneda principal y la secundaria del panel.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="moneda_principal">Moneda principal</FieldLabel>
              <Select id="moneda_principal" name="moneda_principal" defaultValue={monedaPrincipal}>
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
              </Select>
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="moneda_secundaria">Moneda secundaria</FieldLabel>
              <Select id="moneda_secundaria" name="moneda_secundaria" defaultValue={monedaSecundaria}>
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
              </Select>
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t border-[#E5E7EB] pt-5">
          <div>
            <h3 className="text-sm font-semibold text-[#111827]">Comisiones</h3>
            <p className="mt-1 text-xs text-[#6B7280]">Valor sugerido para nuevas liquidaciones.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:max-w-xs">
              <FieldLabel htmlFor="porcentaje_comision_default">Comisión default (%)</FieldLabel>
              <Input
                id="porcentaje_comision_default"
                name="porcentaje_comision_default"
                type="number"
                min="0"
                step="0.01"
                defaultValue={config.porcentaje_comision_default ?? 0}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t border-[#E5E7EB] pt-5">
          <div>
            <h3 className="text-sm font-semibold text-[#111827]">Alertas operativas</h3>
            <p className="mt-1 text-xs text-[#6B7280]">Umbrales de seguimiento para gestoría y leads.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="dias_alerta_gestoria">Días alerta gestoría</FieldLabel>
              <Input
                id="dias_alerta_gestoria"
                name="dias_alerta_gestoria"
                type="number"
                min="0"
                step="1"
                defaultValue={config.dias_alerta_gestoria ?? 0}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="dias_alerta_leads">Días alerta leads</FieldLabel>
              <Input
                id="dias_alerta_leads"
                name="dias_alerta_leads"
                type="number"
                min="0"
                step="1"
                defaultValue={config.dias_alerta_leads ?? 0}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t border-[#E5E7EB] pt-5">
          <div>
            <h3 className="text-sm font-semibold text-[#111827]">Automatizaciones</h3>
            <p className="mt-1 text-xs text-[#6B7280]">Interruptores para futuras automatizaciones operativas.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <CheckboxField
              id="whatsapp_alertas_activas"
              name="whatsapp_alertas_activas"
              label="WhatsApp alertas activas"
              defaultChecked={Boolean(config.whatsapp_alertas_activas)}
              helpText="Habilita alertas asociadas a conversaciones y conexiones."
            />
            <CheckboxField
              id="catalogo_auto_publicar_stock"
              name="catalogo_auto_publicar_stock"
              label="Auto-publicar stock en catálogo (Próximamente)"
              defaultChecked={Boolean(config.catalogo_auto_publicar_stock)}
              helpText="Disponible próximamente."
              disabled
            />
          </div>
        </section>

        <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] pt-5">
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}
