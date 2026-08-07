"use client";

import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateCatalogoConfigAction } from "@/app/(dashboard)/catalogo/actions";

type CatalogoConfig = {
  id: boolean;
  activo: boolean | null;
  titulo: string | null;
  descripcion: string | null;
  whatsapp_contacto: string | null;
  instagram_url: string | null;
  mostrar_precios: boolean | null;
  mostrar_km: boolean | null;
  mostrar_dominio: boolean | null;
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
        "min-h-[100px] w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]",
        className,
      ].join(" ")}
    />
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
      {pending ? "Guardando..." : "Guardar configuración"}
    </button>
  );
}

function CheckboxField({
  id,
  name,
  label,
  defaultChecked,
  helpText,
}: {
  id: string;
  name: string;
  label: string;
  defaultChecked?: boolean;
  helpText?: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-start gap-3 rounded-md border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-3"
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 rounded border-[#D1D5DB] text-[#18181B] focus:ring-[#D1D5DB]"
      />
      <span className="space-y-1">
        <span className="block text-sm font-medium text-[#111827]">{label}</span>
        {helpText ? <span className="block text-xs text-[#6B7280]">{helpText}</span> : null}
      </span>
    </label>
  );
}

function todayFallback(value: string | null, fallback: string) {
  return value ?? fallback;
}

export function CatalogoSettingsForm({ config }: { config: CatalogoConfig }) {
  const [state, formAction] = useFormState(updateCatalogoConfigAction, initialState);

  return (
    <form action={formAction} className="rounded-md border border-[#E5E7EB] bg-white">
      <div className="border-b border-[#E5E7EB] px-5 py-4">
        <h2 className="text-base font-semibold text-[#111827]">Configuración global</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Estos datos se usan en el catálogo público. El switch global controla si el catálogo completo queda visible online.
        </p>
      </div>

      <div className="space-y-4 px-5 py-5">
        {state.error ? (
          <div className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-sm text-[#111827]">
            {state.error}
          </div>
        ) : null}

        {state.success ? (
          <div className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827]">
            Configuración guardada.
          </div>
        ) : null}

        <div className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#111827]">Catálogo activo</p>
              <p className="mt-1 text-xs text-[#6B7280]">
                Cuando está desactivado, el catálogo público muestra una pantalla de no disponible.
              </p>
            </div>
            <label htmlFor="activo" className="flex items-center gap-3 rounded-full border border-[#E5E7EB] bg-white px-3 py-2">
              <input
                id="activo"
                name="activo"
                type="checkbox"
                defaultChecked={Boolean(config.activo)}
                className="h-4 w-4 rounded border-[#D1D5DB] text-[#18181B] focus:ring-[#D1D5DB]"
              />
              <span className="text-sm font-medium text-[#111827]">Activo</span>
            </label>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="titulo">Título del catálogo</FieldLabel>
            <Input
              id="titulo"
              name="titulo"
              defaultValue={todayFallback(config.titulo, "")}
              placeholder="Funes Exclusivos"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="descripcion">Descripción</FieldLabel>
            <Textarea
              id="descripcion"
              name="descripcion"
              defaultValue={todayFallback(config.descripcion, "")}
              placeholder="Selección premium online"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="whatsapp_contacto">WhatsApp de contacto</FieldLabel>
            <Input
              id="whatsapp_contacto"
              name="whatsapp_contacto"
              defaultValue={todayFallback(config.whatsapp_contacto, "")}
              placeholder="+54 9 ..."
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="instagram_url">Instagram URL</FieldLabel>
            <Input
              id="instagram_url"
              name="instagram_url"
              defaultValue={todayFallback(config.instagram_url, "")}
              placeholder="https://instagram.com/..."
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <CheckboxField
            id="mostrar_precios"
            name="mostrar_precios"
            label="Mostrar precios"
            defaultChecked={Boolean(config.mostrar_precios)}
          />
          <CheckboxField
            id="mostrar_km"
            name="mostrar_km"
            label="Mostrar KM"
            defaultChecked={Boolean(config.mostrar_km)}
          />
          <CheckboxField
            id="mostrar_dominio"
            name="mostrar_dominio"
            label="Mostrar dominio"
            defaultChecked={Boolean(config.mostrar_dominio)}
          />
        </div>

        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}
