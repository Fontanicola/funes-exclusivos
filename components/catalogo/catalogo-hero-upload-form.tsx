"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { uploadCatalogoHeroAction } from "@/app/(dashboard)/catalogo/actions";

type ActionState = {
  error?: string;
  success?: boolean;
};

function SubmitButton({ disabled = false }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="inline-flex h-9 items-center justify-center rounded-md bg-[#8A1538] px-3 text-xs font-medium text-white transition hover:bg-[#6F102D] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Subiendo..." : disabled ? "Preparando..." : "Guardar portada"}
    </button>
  );
}

export function CatalogoHeroUploadForm({ heroImageUrl }: { heroImageUrl: string | null }) {
  const [state, formAction] = useFormState<ActionState, FormData>(uploadCatalogoHeroAction, {});
  const [preparing, setPreparing] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function prepareImage(file: File) {
    setFileError(null);
    setPreparing(true);

    try {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.src = objectUrl;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("No se pudo leer la imagen."));
      });

      const maxWidth = 2400;
      const scale = Math.min(1, maxWidth / image.naturalWidth);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("No se pudo preparar la imagen.");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
      if (!blob) throw new Error("No se pudo comprimir la imagen.");

      const compressed = new File([blob], "hero.jpg", { type: "image/jpeg" });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(compressed);
      if (inputRef.current) inputRef.current.files = dataTransfer.files;
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "No se pudo preparar la imagen.");
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setPreparing(false);
    }
  }

  return (
    <form action={formAction} className="mt-4 rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold text-[#111827]">Portada panorámica</p>
          <p className="text-[11px] leading-5 text-[#6B7280]">JPG, PNG o WEBP, hasta 8 MB. Recomendado: formato horizontal.</p>
          <input
            ref={inputRef}
            name="hero_image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void prepareImage(file);
            }}
            className="block w-full max-w-xs text-xs text-[#6B7280] file:mr-2 file:rounded-md file:border-0 file:bg-white file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-[#111827]"
          />
        </div>
        <SubmitButton disabled={preparing} />
      </div>
      {heroImageUrl ? <p className="mt-2 text-[11px] font-medium text-[#166534]">Portada guardada y visible en el catálogo.</p> : null}
      {preparing ? <p className="mt-2 text-xs text-[#6B7280]">Preparando imagen para subir...</p> : null}
      {fileError ? <p className="mt-2 text-xs text-[#B45309]">{fileError}</p> : null}
      {state?.error ? <p className="mt-2 text-xs text-[#B45309]">{state.error}</p> : null}
      {state?.success ? <p className="mt-2 text-xs text-[#166534]">Portada guardada.</p> : null}
    </form>
  );
}
