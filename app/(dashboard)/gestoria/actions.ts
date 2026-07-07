"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
  success?: boolean;
};

const allowedTypes = new Set([
  "transferencia",
  "cedula",
  "titulo",
  "verificacion_policial",
  "informe_dominio",
  "prenda",
  "seguro",
  "patente",
  "otro",
]);

const allowedStates = new Set([
  "pendiente",
  "en_proceso",
  "observado",
  "completado",
  "cancelado",
]);

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function toOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function toLowerTrimmed(value: FormDataEntryValue | null) {
  return toOptionalString(value).toLowerCase();
}

function normalizeNullableString(value: FormDataEntryValue | null) {
  const trimmed = toOptionalString(value);
  return trimmed || null;
}

function getFileExtension(file: File) {
  const byMimeType: Record<string, string> = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  const fromName = file.name.split(".").pop()?.toLowerCase() ?? "";
  return byMimeType[file.type] ?? (fromName || "bin");
}

export async function createGestoriaTramiteAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar trámites reales." };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión expiró. Volvé a iniciar sesión." };
  }

  const tipo = toLowerTrimmed(formData.get("tipo"));
  const estado = toLowerTrimmed(formData.get("estado")) || "pendiente";
  const titulo = toOptionalString(formData.get("titulo"));
  const descripcion = normalizeNullableString(formData.get("descripcion"));
  const vehiculoId = normalizeNullableString(formData.get("vehiculo_id"));
  const ventaId = normalizeNullableString(formData.get("venta_id"));
  const responsableId = normalizeNullableString(formData.get("responsable_id"));
  const clienteNombre = normalizeNullableString(formData.get("cliente_nombre"));
  const clienteTelefono = normalizeNullableString(formData.get("cliente_telefono"));
  const clienteEmail = normalizeNullableString(formData.get("cliente_email"));
  const clienteDocumento = normalizeNullableString(formData.get("cliente_documento"));
  const fechaInicio = toOptionalString(formData.get("fecha_inicio")) || new Date().toISOString().slice(0, 10);
  const fechaVencimiento = normalizeNullableString(formData.get("fecha_vencimiento"));
  const observaciones = normalizeNullableString(formData.get("observaciones"));
  const documentos = formData
    .getAll("documentos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!tipo) return { error: "El tipo de trámite es obligatorio." };
  if (!allowedTypes.has(tipo)) return { error: "El tipo de trámite no es válido." };
  if (!allowedStates.has(estado)) return { error: "El estado del trámite no es válido." };
  if (!titulo) return { error: "El título del trámite es obligatorio." };
  if (documentos.length > 10) {
    return { error: "Podés subir como máximo 10 documentos." };
  }

  for (const documento of documentos) {
    if (!allowedMimeTypes.has(documento.type)) {
      return { error: "Solo se permiten archivos PDF, JPG, PNG o WEBP." };
    }
  }

  const storagePaths: string[] = [];

  for (const documento of documentos) {
    const extension = getFileExtension(documento);
    const storagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("gestoria")
      .upload(storagePath, documento, {
        contentType: documento.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: "No pudimos subir uno de los documentos. Intentá de nuevo." };
    }

    storagePaths.push(storagePath);
  }

  const { error } = await supabase.from("gestoria_tramites").insert({
    tipo,
    estado,
    titulo,
    descripcion,
    vehiculo_id: vehiculoId,
    venta_id: ventaId,
    responsable_id: responsableId,
    cliente_nombre: clienteNombre,
    cliente_telefono: clienteTelefono,
    cliente_email: clienteEmail,
    cliente_documento: clienteDocumento,
    fecha_inicio: fechaInicio,
    fecha_vencimiento: fechaVencimiento,
    observaciones,
    documentos: storagePaths,
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    return { error: "No pudimos guardar el trámite. Revisá los datos e intentá de nuevo." };
  }

  revalidatePath("/gestoria");
  redirect("/gestoria");
}
