"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
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

function looksLikeBase64(value: string) {
  return /^[A-Za-z0-9+/=]+$/.test(value) && value.length > 64;
}

function isLikelyImageDataUrl(value: string | null) {
  return typeof value === "string" && value.startsWith("data:image/");
}

function isLikelyImageBase64(value: string | null) {
  return typeof value === "string" && looksLikeBase64(value);
}

function isLikelyWhatsappQrCode(value: string | null) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (isLikelyImageDataUrl(trimmed) || isLikelyImageBase64(trimmed)) return false;
  return trimmed.startsWith("2@") || trimmed.includes(",") || trimmed.length > 16;
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
  const [qrImageSrc, setQrImageSrc] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
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

  useEffect(() => {
    let cancelled = false;

    async function resolveQr() {
      setQrError(null);
      setQrImageSrc(null);

      const directImage = instance.qr_base64 ?? instance.qr_code;
      const candidates = [instance.qr_base64, instance.qr_code].filter(
        (value): value is string => typeof value === "string" && value.trim().length > 0
      );

      const imageCandidate = candidates.find(
        (value) => isLikelyImageDataUrl(value) || isLikelyImageBase64(value)
      );

      if (imageCandidate) {
        const resolvedSrc = imageCandidate.startsWith("data:image/")
          ? imageCandidate
          : `data:image/png;base64,${imageCandidate}`;
        if (!cancelled) setQrImageSrc(resolvedSrc);
        return;
      }

      const rawCandidate = candidates.find((value) => isLikelyWhatsappQrCode(value));
      if (rawCandidate) {
        try {
          const url = await QRCode.toDataURL(rawCandidate, { margin: 2, width: 220 });
          if (!cancelled) setQrImageSrc(url);
        } catch {
          if (!cancelled) setQrError("No pudimos generar la imagen QR. Probá refrescar QR.");
        }
        return;
      }

      if (!directImage && !cancelled) {
        setQrImageSrc(null);
      }
    }

    resolveQr();

    return () => {
      cancelled = true;
    };
  }, [instance.qr_base64, instance.qr_code]);

  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[#111827]">{getEmployeeName(instance)}</p>
          <p className="text-xs text-[#6B7280]">Cuenta de WhatsApp</p>
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
            {qrError ? (
              <div className="flex h-44 w-44 items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-3 text-center text-xs text-[#6B7280]">
                {qrError}
              </div>
            ) : qrImageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrImageSrc}
                alt="QR de WhatsApp"
                className="h-44 w-44 rounded-2xl border border-[#E5E7EB] bg-white p-2"
              />
            ) : (
              <div className="flex h-44 w-44 items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-3 text-center text-xs text-[#6B7280]">
                QR no disponible. Probá refrescar QR.
              </div>
            )}
            {qrImageSrc ? <p className="text-xs text-[#6B7280]">Escaneá este QR desde WhatsApp para conectar la cuenta.</p> : null}
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
