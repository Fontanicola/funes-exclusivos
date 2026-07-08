"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, InputHTMLAttributes } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  markConversationAsReadAction,
  updateConversationFollowUpAction,
} from "@/app/(dashboard)/whatsapp/actions";
import { AiSummaryCard } from "./ai-summary-card";
import { ConversacionInterestBadge } from "./conversacion-interest-badge";
import { ConversacionStatusBadge } from "./conversacion-status-badge";

type Conversation = {
  id: string;
  contacto_nombre: string | null;
  contacto_telefono: string | null;
  contacto_numero_normalizado: string | null;
  contacto_email: string | null;
  estado: string | null;
  interes_compra: string | null;
  unread_count: number | null;
  resumen_ia: string | null;
  ia_estado: string | null;
  ia_resumen: string | null;
  ia_interes_compra: string | null;
  ia_score: number | null;
  ia_intencion: string | null;
  ia_proximo_paso: string | null;
  ia_procesado_at: string | null;
  ia_modelo: string | null;
  ia_error: string | null;
  intencion_detectada: string | null;
  proxima_accion_sugerida: string | null;
  requiere_atencion: boolean | null;
  whatsapp_instancia_id: string | null;
  lead_id: string | null;
  vendedor_id: string | null;
  vehiculo_interes_id: string | null;
  instancia: {
    id: string;
    instance_name: string | null;
    estado: string | null;
    telefono_conectado: string | null;
  } | null;
  lead: {
    id: string;
    nombre: string | null;
    telefono: string | null;
    email: string | null;
    estado: string | null;
    origen: string | null;
  } | null;
  vendedor: {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
  } | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    version: string | null;
    anio: number | null;
    dominio: string | null;
  } | null;
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
        "min-h-[100px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#F3F4F6]",
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
      {pending ? "Guardando..." : "Guardar seguimiento"}
    </button>
  );
}

function formatContact(value: string | null) {
  return value ?? "—";
}

function getVehicleTitle(vehicle: Conversation["vehiculo"]) {
  if (!vehicle) return "—";
  return [vehicle.marca, vehicle.modelo].filter(Boolean).join(" ");
}

function getVehicleSubtitle(vehicle: Conversation["vehiculo"]) {
  if (!vehicle) return "—";
  return [vehicle.version, vehicle.anio ? String(vehicle.anio) : null, vehicle.dominio]
    .filter(Boolean)
    .join(" · ");
}

function formatUnreadCount(value: number | null) {
  if (!value || value <= 0) return "Sin leer";
  if (value === 1) return "1 no leído";
  return `${value} no leídos`;
}

function MarkReadButton({ conversationId }: { conversationId: string }) {
  const [state, formAction] = useFormState(markConversationAsReadAction, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="conversation_id" value={conversationId} />
      <button
        type="submit"
        className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
      >
        Marcar como leído / atendido
      </button>
      {state.error ? <p className="text-xs text-[#6B7280]">{state.error}</p> : null}
    </form>
  );
}

export function ConversacionDetail({ conversation }: { conversation: Conversation }) {
  const [state, formAction] = useFormState(updateConversationFollowUpAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-[#111827]">
              {conversation.contacto_nombre ?? conversation.contacto_telefono ?? "Sin contacto"}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <ConversacionStatusBadge status={conversation.estado} />
              <ConversacionInterestBadge interest={conversation.interes_compra} />
            </div>
          </div>

          <Link
            href="/whatsapp"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Volver a WhatsApp
          </Link>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-6">
          <AiSummaryCard conversation={conversation} />

          <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-[#111827]">Datos de la conversación</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Contacto</p>
                <p className="mt-1 text-sm text-[#111827]">{formatContact(conversation.contacto_nombre)}</p>
                <p className="text-sm text-[#6B7280]">
                  {formatContact(conversation.contacto_telefono ?? conversation.contacto_email)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Cuenta / vendedor</p>
                <p className="mt-1 text-sm text-[#111827]">
                  {conversation.instancia?.telefono_conectado ?? "Cuenta vinculada"}
                </p>
                <p className="text-sm text-[#6B7280]">
                  {conversation.vendedor?.nombre ?? conversation.vendedor?.email ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Lead vinculado</p>
                <p className="mt-1 text-sm text-[#111827]">{conversation.lead?.nombre ?? "—"}</p>
                <p className="text-sm text-[#6B7280]">{conversation.lead?.origen ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Vehículo interés</p>
                <p className="mt-1 text-sm text-[#111827]">{getVehicleTitle(conversation.vehiculo)}</p>
                <p className="text-sm text-[#6B7280]">{getVehicleSubtitle(conversation.vehiculo)}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-[#111827]">Seguimiento comercial</h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Resumen IA</p>
                <p className="mt-1 text-sm leading-6 text-[#111827]">
                  {conversation.resumen_ia ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Intención detectada</p>
                <p className="mt-1 text-sm text-[#111827]">{conversation.intencion_detectada ?? "—"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Próxima acción sugerida</p>
                <p className="mt-1 text-sm leading-6 text-[#111827]">
                  {conversation.proxima_accion_sugerida ?? "—"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <MarkReadButton conversationId={conversation.id} />
              <div className="text-xs text-[#6B7280]">
                {formatUnreadCount(conversation.unread_count)}
              </div>
            </div>
          </section>
        </div>

        <form ref={formRef} action={formAction} className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <input type="hidden" name="conversation_id" value={conversation.id} />
          {state.error ? (
            <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-sm text-[#111827]">
              {state.error}
            </div>
          ) : null}

          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#111827]">Editar seguimiento</h3>
            <p className="text-sm text-[#6B7280]">
              Ajustá el estado, el interés y la próxima acción sugerida.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <FieldLabel htmlFor="estado">Estado</FieldLabel>
              <Select id="estado" name="estado" defaultValue={conversation.estado ?? "abierta"}>
                <option value="abierta">Abierta</option>
                <option value="en_seguimiento">En seguimiento</option>
                <option value="cerrada">Cerrada</option>
                <option value="archivada">Archivada</option>
              </Select>
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="interes_compra">Interés</FieldLabel>
              <Select id="interes_compra" name="interes_compra" defaultValue={conversation.interes_compra ?? "no_detectado"}>
                <option value="alto">Alto</option>
                <option value="medio">Medio</option>
                <option value="bajo">Bajo</option>
                <option value="sin_interes">Sin interés</option>
                <option value="no_detectado">No detectado</option>
              </Select>
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="resumen_ia">Resumen IA</FieldLabel>
              <Textarea id="resumen_ia" name="resumen_ia" defaultValue={conversation.resumen_ia ?? ""} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="intencion_detectada">Intención detectada</FieldLabel>
              <Input id="intencion_detectada" name="intencion_detectada" defaultValue={conversation.intencion_detectada ?? ""} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="proxima_accion_sugerida">Próxima acción sugerida</FieldLabel>
              <Textarea
                id="proxima_accion_sugerida"
                name="proxima_accion_sugerida"
                defaultValue={conversation.proxima_accion_sugerida ?? ""}
              />
            </div>
            <label htmlFor="requiere_atencion" className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-3 text-sm text-[#111827]">
              <input
                id="requiere_atencion"
                name="requiere_atencion"
                type="checkbox"
                defaultChecked={Boolean(conversation.requiere_atencion)}
                className="h-4 w-4 rounded border-[#D1D5DB] text-[#18181B] focus:ring-[#D1D5DB]"
              />
              Requiere atención
            </label>
          </div>

          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </div>
    </section>
  );
}
