"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  deleteWhatsappInstanceAction,
  disconnectWhatsappInstanceAction,
  syncWhatsappConnectionAction,
  refreshWhatsappQrAction,
} from "@/app/(dashboard)/whatsapp/actions";
import { WhatsappInstanceStatusBadge } from "./whatsapp-instance-status-badge";

type Instance = {
  id: string;
  empleado_id: string | null;
  provider: string | null;
  instance_name: string | null;
  estado: string | null;
  telefono_conectado: string | null;
  nombre_perfil: string | null;
  qr_code: string | null;
  qr_base64: string | null;
  qr_expires_at: string | null;
  last_connection_at: string | null;
  last_disconnection_at: string | null;
  last_sync_at: string | null;
  last_error: string | null;
  activo: boolean | null;
  created_at: string | null;
  empleado: {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
  } | null;
};

type ActionState = {
  error?: string;
  success?: boolean;
};

const initialState: ActionState = {};

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(date);
}

function getEmployeeName(instance: Instance) {
  return instance.empleado?.nombre ?? instance.empleado?.email ?? "Sin vendedor";
}

function getQrPreview(qrCode: string | null, qrBase64: string | null) {
  const rawQr = qrBase64 ?? qrCode;
  if (!rawQr) return null;
  if (rawQr.startsWith("data:image/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={rawQr} alt="QR de WhatsApp" className="h-40 w-40 rounded-2xl border border-[#E5E7EB] bg-white p-2" />
    );
  }

  if (/^[A-Za-z0-9+/=]+$/.test(rawQr) && rawQr.length > 32) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`data:image/png;base64,${rawQr}`}
        alt="QR de WhatsApp"
        className="h-40 w-40 rounded-2xl border border-[#E5E7EB] bg-white p-2"
      />
    );
  }

  if (rawQr.startsWith("http")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={rawQr} alt="QR de WhatsApp" className="h-40 w-40 rounded-2xl border border-[#E5E7EB] bg-white p-2" />
    );
  }

  return (
    <div className="flex h-40 w-40 items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-3 text-center text-xs text-[#6B7280]">
      <span className="break-all font-mono">QR recibido en formato texto</span>
    </div>
  );
}

function ActionButton({
  action,
  instanceId,
  instanceName,
  label,
  tone = "neutral",
}: {
  action:
    | typeof refreshWhatsappQrAction
    | typeof syncWhatsappConnectionAction
    | typeof disconnectWhatsappInstanceAction
    | typeof deleteWhatsappInstanceAction;
  instanceId: string;
  instanceName: string | null;
  label: string;
  tone?: "neutral" | "danger";
}) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="space-y-1">
      <input type="hidden" name="whatsapp_instance_id" value={instanceId} />
      <input type="hidden" name="instancia_id" value={instanceId} />
      <input type="hidden" name="instance_name" value={instanceName ?? ""} />
      <button
        type="submit"
        className={[
          "inline-flex h-9 items-center justify-center rounded-xl border px-3 text-xs font-medium transition",
          tone === "danger"
            ? "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]"
            : "border-[#E5E7EB] bg-[#FAFAFA] text-[#111827] hover:bg-white",
        ].join(" ")}
      >
        {label}
      </button>
      {state.error ? <p className="max-w-[180px] text-[11px] leading-4 text-[#6B7280]">{state.error}</p> : null}
    </form>
  );
}

export function WhatsappInstanceCard({
  instance,
  canManageAll = false,
}: {
  instance: Instance;
  canManageAll?: boolean;
}) {
  const [showQr, setShowQr] = useState(instance.estado === "qr_pendiente");
  const qrPreview = useMemo(() => getQrPreview(instance.qr_code, instance.qr_base64), [instance.qr_base64, instance.qr_code]);
  const qrAvailable = Boolean(instance.qr_code || instance.qr_base64);
  const [qrExpired, setQrExpired] = useState(false);

  useEffect(() => {
    setShowQr(instance.estado === "qr_pendiente");
  }, [instance.estado, instance.qr_base64, instance.qr_code]);

  useEffect(() => {
    if (!instance.qr_expires_at) {
      setQrExpired(false);
      return;
    }

    const expiresAt = new Date(instance.qr_expires_at);
    setQrExpired(!Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() < Date.now());
  }, [instance.qr_expires_at]);

  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[#111827]">{getEmployeeName(instance)}</p>
          <p className="text-xs text-[#6B7280]">{instance.instance_name ?? "Sin instancia"}</p>
        </div>
        <WhatsappInstanceStatusBadge status={instance.estado} />
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Teléfono conectado</p>
          <p className="mt-1 text-sm text-[#111827]">{instance.telefono_conectado ?? "—"}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Perfil</p>
            <p className="mt-1 text-sm text-[#111827]">{instance.nombre_perfil ?? "—"}</p>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Última sync</p>
            <p className="mt-1 text-sm text-[#111827]">{formatDateTime(instance.last_sync_at)}</p>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Última conexión</p>
            <p className="mt-1 text-sm text-[#111827]">{formatDateTime(instance.last_connection_at)}</p>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Vendedor</p>
            <p className="mt-1 text-sm text-[#111827]">{getEmployeeName(instance)}</p>
          </div>
        </div>

        {instance.last_error ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-3 text-xs leading-5 text-[#6B7280]">
            {instance.last_error}
          </div>
        ) : null}

        {showQr ? (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Código QR</p>
              <p className="text-xs text-[#6B7280]">
                {instance.qr_expires_at ? `Expira ${formatDateTime(instance.qr_expires_at)}` : "Sin vencimiento"}
              </p>
              {qrExpired ? <p className="text-xs text-[#6B7280]">QR vencido, refrescalo.</p> : null}
            </div>
            {qrPreview ?? (
              <div className="flex h-40 w-40 items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-3 text-center text-xs text-[#6B7280]">
                {qrAvailable ? "QR disponible" : "Sin QR"}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowQr((current) => !current)}
          className="inline-flex h-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
        >
          Ver QR
        </button>
        <ActionButton
          action={refreshWhatsappQrAction}
          instanceId={instance.id}
          instanceName={instance.instance_name}
          label="Refrescar QR"
        />
        <ActionButton
          action={syncWhatsappConnectionAction}
          instanceId={instance.id}
          instanceName={instance.instance_name}
          label="Sincronizar"
        />
        <ActionButton
          action={disconnectWhatsappInstanceAction}
          instanceId={instance.id}
          instanceName={instance.instance_name}
          label="Desconectar"
          tone="danger"
        />
        {canManageAll ? (
          <ActionButton
            action={deleteWhatsappInstanceAction}
            instanceId={instance.id}
            instanceName={instance.instance_name}
            label="Eliminar"
            tone="danger"
          />
        ) : null}
      </div>
    </article>
  );
}
