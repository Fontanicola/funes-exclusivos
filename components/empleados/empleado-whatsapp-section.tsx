"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createWhatsappInstanceAction } from "@/app/(dashboard)/whatsapp/actions";
import type { WhatsappInstance } from "@/components/whatsapp/whatsapp-instance-card";
import { WhatsappInstanceCard } from "@/components/whatsapp/whatsapp-instance-card";

type ActionState = {
  error?: string;
  success?: boolean;
};

const initialState: ActionState = {};

function ConnectButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-9 items-center justify-center rounded-md bg-[#8A1538] px-3 text-xs font-medium text-white transition hover:bg-[#6F102D] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Generando..." : "Conectar WhatsApp"}
    </button>
  );
}

export function EmpleadoWhatsappSection({
  employeeId,
  instance,
}: {
  employeeId: string;
  instance: WhatsappInstance | null;
}) {
  const [state, formAction] = useFormState(createWhatsappInstanceAction, initialState);

  return (
    <section className="mt-5 space-y-3 rounded-md border border-[#E5E7EB] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-[#111827]">WhatsApp del empleado</h4>
          <p className="text-xs leading-5 text-[#6B7280]">
            Conectá la cuenta desde acá y escaneá el QR cuando esté disponible.
          </p>
        </div>
        {instance ? <span className="text-xs text-[#6B7280]">La conexión ya está creada</span> : null}
      </div>

      {state.error ? (
        <p className="rounded-md border border-[#F3D1D9] bg-[#FFF7F8] px-3 py-2 text-xs leading-5 text-[#8A1538]">
          {state.error}
        </p>
      ) : null}

      {instance ? (
        <WhatsappInstanceCard instance={instance} canManageAll />
      ) : (
        <form action={formAction} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed border-[#D8A1B2] bg-[#FDF7F8] px-3 py-3">
          <p className="text-xs text-[#6B7280]">Todavía no hay una cuenta de WhatsApp asociada.</p>
          <input type="hidden" name="empleado_id" value={employeeId} />
          <ConnectButton />
        </form>
      )}
    </section>
  );
}
