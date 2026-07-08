"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
  success?: boolean;
  signedUrl?: string;
};

const ALLOWED_TYPES = new Set([
  "titulo",
  "cedula",
  "factura",
  "boleto",
  "permiso",
  "comprobante_pago",
  "informe_dominio",
  "verificacion_policial",
  "seguro",
  "patente",
  "formulario",
  "otro",
]);

const ALLOWED_STATES = new Set([
  "pendiente",
  "recibido",
  "observado",
  "vencido",
  "archivado",
]);

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function toOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function toNullableString(value: FormDataEntryValue | null) {
  const trimmed = toOptionalString(value);
  return trimmed || null;
}

function sanitizeFileName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "") || "archivo";
}

function getFileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName) return fromName;
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "bin";
}

async function getCurrentEmployee() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión expiró. Volvé a iniciar sesión." as const };
  }

  const { data: employee, error } = await supabase
    .from("empleados")
    .select("id,nombre,email,rol,activo")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return { error: "No pudimos validar tu perfil operativo." as const };
  }

  if (!employee || employee.activo === false) {
    return { error: "El usuario está inactivo o no tiene perfil operativo." as const };
  }

  return { user, employee };
}

function hasManageAccess(role: string | null | undefined) {
  const normalized = (role ?? "").toLowerCase();
  return normalized === "admin" || normalized === "gestor";
}

function hasDeleteAccess(role: string | null | undefined) {
  return (role ?? "").toLowerCase() === "admin";
}

export async function createVehiculoDocumentoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar documentos reales." };
  }

  const current = await getCurrentEmployee();
  if ("error" in current) return { error: current.error };
  if (!hasManageAccess(current.employee.rol)) {
    return { error: "No tenés permisos para administrar documentos de vehículos." };
  }

  const vehiculoId = toOptionalString(formData.get("vehiculo_id"));
  const tipo = toOptionalString(formData.get("tipo")).toLowerCase();
  const estado = toOptionalString(formData.get("estado")).toLowerCase();
  const titulo = toOptionalString(formData.get("titulo"));
  const descripcion = toNullableString(formData.get("descripcion"));
  const fechaEmision = toNullableString(formData.get("fecha_emision"));
  const fechaVencimiento = toNullableString(formData.get("fecha_vencimiento"));
  const observaciones = toNullableString(formData.get("observaciones"));
  const file = formData.get("archivo");

  if (!vehiculoId) return { error: "El vehículo es obligatorio." };
  if (!tipo || !ALLOWED_TYPES.has(tipo)) return { error: "El tipo de documento no es válido." };
  if (!estado || !ALLOWED_STATES.has(estado)) return { error: "El estado del documento no es válido." };
  if (!titulo) return { error: "El título del documento es obligatorio." };

  const admin = createSupabaseAdminClient();
  let archivoPath: string | null = null;
  let archivoNombre: string | null = null;
  let archivoMimeType: string | null = null;
  let archivoSizeBytes: number | null = null;

  if (file instanceof File && file.size > 0) {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return { error: "Solo se permiten archivos PDF, JPG, PNG o WEBP." };
    }

    archivoNombre = file.name;
    archivoMimeType = file.type;
    archivoSizeBytes = file.size;
    const safeName = sanitizeFileName(file.name);
    const storagePath = `${vehiculoId}/${crypto.randomUUID()}-${safeName}`;

    const { error: uploadError } = await admin.storage
      .from("vehiculo-documentos")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: "No pudimos subir el archivo. Intentá de nuevo." };
    }

    archivoPath = storagePath;
  }

  const { error } = await admin.from("vehiculo_documentos").insert({
    vehiculo_id: vehiculoId,
    tipo,
    estado,
    titulo,
    descripcion,
    archivo_path: archivoPath,
    archivo_nombre: archivoNombre,
    archivo_mime_type: archivoMimeType,
    archivo_size_bytes: archivoSizeBytes,
    fecha_emision: fechaEmision,
    fecha_vencimiento: fechaVencimiento,
    observaciones,
  });

  if (error) {
    if (archivoPath) {
      await admin.storage.from("vehiculo-documentos").remove([archivoPath]);
    }
    return { error: "No pudimos guardar el documento. Revisá los datos e intentá de nuevo." };
  }

  revalidatePath("/inventario");
  revalidatePath(`/inventario/${vehiculoId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateVehiculoDocumentoEstadoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para modificar documentos reales." };
  }

  const current = await getCurrentEmployee();
  if ("error" in current) return { error: current.error };
  if (!hasManageAccess(current.employee.rol)) {
    return { error: "No tenés permisos para modificar documentos de vehículos." };
  }

  const documentoId = toOptionalString(formData.get("documento_id"));
  const vehiculoId = toOptionalString(formData.get("vehiculo_id"));
  const estado = toOptionalString(formData.get("estado")).toLowerCase();

  if (!documentoId || !vehiculoId) return { error: "No pudimos identificar el documento." };
  if (!ALLOWED_STATES.has(estado)) return { error: "El estado del documento no es válido." };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("vehiculo_documentos")
    .update({ estado })
    .eq("id", documentoId);

  if (error) {
    return { error: "No pudimos actualizar el estado del documento." };
  }

  revalidatePath("/inventario");
  revalidatePath(`/inventario/${vehiculoId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteVehiculoDocumentoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para eliminar documentos reales." };
  }

  const current = await getCurrentEmployee();
  if ("error" in current) return { error: current.error };
  if (!hasDeleteAccess(current.employee.rol)) {
    return { error: "Solo un administrador puede eliminar documentos." };
  }

  const documentoId = toOptionalString(formData.get("documento_id"));
  if (!documentoId) return { error: "No pudimos identificar el documento." };

  const admin = createSupabaseAdminClient();
  const { data: documentRecord, error: documentError } = await admin
    .from("vehiculo_documentos")
    .select("vehiculo_id,archivo_path")
    .eq("id", documentoId)
    .maybeSingle();

  if (documentError || !documentRecord) {
    return { error: "No pudimos obtener el documento para eliminar." };
  }

  if (documentRecord.archivo_path) {
    const { error: storageError } = await admin.storage
      .from("vehiculo-documentos")
      .remove([documentRecord.archivo_path]);

    if (storageError) {
      return { error: "No pudimos eliminar el archivo asociado." };
    }
  }

  const { error } = await admin.from("vehiculo_documentos").delete().eq("id", documentoId);

  if (error) {
    return { error: "No pudimos eliminar el documento." };
  }

  revalidatePath("/inventario");
  revalidatePath(`/inventario/${documentRecord.vehiculo_id}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getVehiculoDocumentoSignedUrlAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para abrir documentos reales." };
  }

  const current = await getCurrentEmployee();
  if ("error" in current) return { error: current.error };

  const documentoId = toOptionalString(formData.get("documento_id"));
  if (!documentoId) return { error: "No pudimos identificar el documento." };

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("vehiculo_documentos")
    .select("archivo_path")
    .eq("id", documentoId)
    .maybeSingle();

  if (error) {
    return { error: "No pudimos obtener el archivo del documento." };
  }

  if (!data?.archivo_path) {
    return { error: "El documento no tiene archivo adjunto." };
  }

  const { data: signedUrlData, error: signedUrlError } = await admin.storage
    .from("vehiculo-documentos")
    .createSignedUrl(data.archivo_path, 300);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    return { error: "No pudimos generar el enlace seguro del archivo." };
  }

  return { success: true, signedUrl: signedUrlData.signedUrl };
}
