"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canManageGestoria } from "@/lib/auth/permissions";
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

const allowedStages = new Set(["presupuesto", "escribania", "gestoria", "terminado"]);
const allowedGestionTypes = new Set(["interna", "cliente", "mixta"]);
const allowedMoneyCurrencies = new Set(["ARS", "USD"]);
const allowedMilestoneStates = new Set([
  "pendiente",
  "en_proceso",
  "completado",
  "observado",
  "no_aplica",
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

function toOptionalNumber(value: FormDataEntryValue | null) {
  const trimmed = toOptionalString(value);
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function isChecked(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1";
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
    return { error: "Modo demo activo: conectá el entorno real para guardar trámites." };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión expiró. Volvé a iniciar sesión." };
  }

  const { data: employee } = await supabase
    .from("empleados")
    .select("id,rol,activo")
    .eq("id", user.id)
    .maybeSingle<{ id: string; rol: string | null; activo: boolean | null }>();

  if (!employee || employee.activo !== true || !canManageGestoria(employee.rol)) {
    return { error: "No tenés permisos para administrar trámites." };
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
  const etapa = toLowerTrimmed(formData.get("etapa")) || "presupuesto";
  const gestionTipo = toLowerTrimmed(formData.get("gestion_tipo")) || "interna";
  const fechaEnvio = normalizeNullableString(formData.get("fecha_envio"));
  const fechaFirma = normalizeNullableString(formData.get("fecha_firma"));
  const costoFinalTransferencia = toOptionalNumber(formData.get("costo_final_transferencia"));
  const costoFinalMoneda = toOptionalString(formData.get("costo_final_moneda")).toUpperCase() || "ARS";
  const observaciones = normalizeNullableString(formData.get("observaciones"));
  const documentos = formData
    .getAll("documentos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!tipo) return { error: "El tipo de trámite es obligatorio." };
  if (!allowedTypes.has(tipo)) return { error: "El tipo de trámite no es válido." };
  if (!allowedStates.has(estado)) return { error: "El estado del trámite no es válido." };
  if (!allowedStages.has(etapa)) return { error: "La etapa del trámite no es válida." };
  if (!allowedGestionTypes.has(gestionTipo)) return { error: "El tipo de gestión no es válido." };
  if (!allowedMoneyCurrencies.has(costoFinalMoneda)) return { error: "La moneda del costo final debe ser ARS o USD." };
  if (Number.isNaN(costoFinalTransferencia)) return { error: "El costo final debe ser un número válido." };
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
    etapa,
    gestion_tipo: gestionTipo,
    fecha_envio: fechaEnvio,
    fecha_firma: fechaFirma,
    costo_final_transferencia: costoFinalTransferencia,
    costo_final_moneda: costoFinalMoneda,
    presupuesto_confirmado: isChecked(formData.get("presupuesto_confirmado")),
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

export async function updateGestoriaOperacionAction(formData: FormData) {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá el entorno real para actualizar gestoría." };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión expiró. Volvé a iniciar sesión." };
  }

  const { data: employee } = await supabase
    .from("empleados")
    .select("id,rol,activo")
    .eq("id", user.id)
    .maybeSingle<{ id: string; rol: string | null; activo: boolean | null }>();

  if (!employee || employee.activo !== true || !canManageGestoria(employee.rol)) {
    return { error: "No tenés permisos para administrar gestoría." };
  }

  const id = normalizeNullableString(formData.get("id"));
  if (!id) return { error: "Falta el trámite a actualizar." };

  const etapa = toLowerTrimmed(formData.get("etapa"));
  const estado = toLowerTrimmed(formData.get("estado"));
  const gestionTipo = toLowerTrimmed(formData.get("gestion_tipo"));
  const responsableId = normalizeNullableString(formData.get("responsable_id"));
  const fechaEnvio = normalizeNullableString(formData.get("fecha_envio"));
  const fechaFirma = normalizeNullableString(formData.get("fecha_firma"));
  const fechaVencimiento = normalizeNullableString(formData.get("fecha_vencimiento"));
  const costoFinalTransferencia = toOptionalNumber(formData.get("costo_final_transferencia"));
  const costoFinalMoneda = toOptionalString(formData.get("costo_final_moneda")).toUpperCase() || "ARS";

  if (etapa && !allowedStages.has(etapa)) return { error: "La etapa no es válida." };
  if (estado && !allowedStates.has(estado)) return { error: "El estado no es válido." };
  if (gestionTipo && !allowedGestionTypes.has(gestionTipo)) return { error: "El tipo de gestión no es válido." };
  if (!allowedMoneyCurrencies.has(costoFinalMoneda)) return { error: "La moneda debe ser ARS o USD." };
  if (Number.isNaN(costoFinalTransferencia)) return { error: "El costo final debe ser un número válido." };

  const milestoneFields = [
    "cat_estado",
    "documentacion_fisica_estado",
    "escribania_estado",
    "transferencia_registral_estado",
    "retiro_documentacion_cliente_estado",
    "transferencia_municipal_estado",
  ] as const;

  const updatePayload: Record<string, unknown> = {
    updated_by: user.id,
    etapa_updated_at: new Date().toISOString(),
  };

  if (etapa) updatePayload.etapa = etapa;
  if (estado) updatePayload.estado = estado;
  if (gestionTipo) updatePayload.gestion_tipo = gestionTipo;
  updatePayload.responsable_id = responsableId;
  updatePayload.fecha_envio = fechaEnvio;
  updatePayload.fecha_firma = fechaFirma;
  updatePayload.fecha_vencimiento = fechaVencimiento;
  updatePayload.costo_final_transferencia = costoFinalTransferencia;
  updatePayload.costo_final_moneda = costoFinalMoneda;
  updatePayload.presupuesto_confirmado = isChecked(formData.get("presupuesto_confirmado"));
  // Las notas ya no se editan desde el tablero; si el campo no llega, se conserva su valor existente.
  if (formData.has("seguimiento_comentarios")) {
    updatePayload.seguimiento_comentarios = normalizeNullableString(formData.get("seguimiento_comentarios"));
  }

  for (const field of milestoneFields) {
    const value = toLowerTrimmed(formData.get(field));
    if (!value) continue;
    if (!allowedMilestoneStates.has(value)) {
      return { error: "Uno de los estados de seguimiento no es válido." };
    }
    updatePayload[field] = value;
  }

  const milestoneDateFields = [
    "cat_fecha",
    "documentacion_fisica_fecha",
    "escribania_fecha_retiro",
    "transferencia_registral_fecha",
    "retiro_documentacion_cliente_fecha",
    "transferencia_municipal_fecha",
  ] as const;

  for (const field of milestoneDateFields) {
    updatePayload[field] = normalizeNullableString(formData.get(field));
  }

  const { error } = await supabase
    .from("gestoria_tramites")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    return { error: "No pudimos actualizar la operación de gestoría." };
  }

  revalidatePath("/gestoria");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateGestoriaOperacionFormAction(formData: FormData): Promise<void> {
  await updateGestoriaOperacionAction(formData);
}
