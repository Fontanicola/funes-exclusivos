"use client";

import { useFormState, useFormStatus } from "react-dom";
import { uploadCatalogoHeroAction } from "@/app/(dashboard)/catalogo/actions";

type ActionState = {
  error?: string;
  success?: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-9 items-center justify-center rounded-md bg-[#8A1538] px-3 text-xs font-medium text-white transition hover:bg-[#6F102D] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Subiendo..." : "Guardar portada"}
    </button>
  );
}

export function CatalogoHeroUploadForm({ heroImageUrl }: { heroImageUrl: string | null }) {
  const [state, formAction] = useFormState<ActionState, FormData>(uploadCatalogoHeroAction, {});

  return (
    <form action={formAction} className="mt-4 rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold text-[#111827]">Portada panorámica</p>
          <p className="text-[11px] leading-5 text-[#6B7280]">JPG, PNG o WEBP, hasta 8 MB. Recomendado: formato horizontal.</p>
          <input name="hero_image" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full max-w-xs text-xs text-[#6B7280] file:mr-2 file:rounded-md file:border-0 file:bg-white file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-[#111827]" />
        </div>
        <SubmitButton />
      </div>
      {heroImageUrl ? <p className="mt-2 text-[11px] font-medium text-[#166534]">Portada guardada y visible en el catálogo.</p> : null}
      {state?.error ? <p className="mt-2 text-xs text-[#B45309]">{state.error}</p> : null}
      {state.success ? <p className="mt-2 text-xs text-[#166534]">Portada guardada.</p> : null}
    </form>
  );
}
