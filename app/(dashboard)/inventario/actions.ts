"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canManageInventory } from "@/lib/auth/permissions";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
};

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function toOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function toOptionalNumber(value: FormDataEntryValue | null) {
  const raw = toOptionalString(value);
  if (!raw) return null;
  const parsed = Number(raw.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function toRequiredNumber(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = toOptionalNumber(value);
  return parsed ?? fallback;
}

function toUpperTrimmed(value: FormDataEntryValue | null) {
  return toOptionalString(value).toUpperCase();
}

function toBoolean(value: FormDataEntryValue | null) {
  if (typeof value === "string") {
    return ["on", "true", "1", "yes"].includes(value.trim().toLowerCase());
  }

  return false;
}

function getFileExtension(file: File) {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() : "jpg";
}

function parseExistingFotos(formData: FormData) {
  return formData
    .getAll("existing_fotos")
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);
}

function parseExistingFotosFromDb(fotos: unknown) {
  if (Array.isArray(fotos)) {
    return fotos.filter((item): item is string => typeof item === "string");
  }

  if (typeof fotos === "string") {
    try {
      const parsed = JSON.parse(fotos);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      return fotos ? [fotos] : [];
    }
  }

  return [];
}

function collectVehicleData(formData: FormData) {
  const marca = toOptionalString(formData.get("marca"));
  const modelo = toOptionalString(formData.get("modelo"));
  const version = toOptionalString(formData.get("version"));
  const anio = toOptionalNumber(formData.get("anio"));
  const color = toOptionalString(formData.get("color"));
  const km = toRequiredNumber(formData.get("km"), 0);
  const dominio = toUpperTrimmed(formData.get("dominio"));
  const motor = toOptionalString(formData.get("motor"));
  const ubicacion = toOptionalString(formData.get("ubicacion"));
  const nroOperacion = toOptionalString(formData.get("nro_operacion"));
  const proveedorId = toOptionalString(formData.get("proveedor_id"));
  const fechaCompraInput = toOptionalString(formData.get("fecha_compra"));
  const fechaCompra = fechaCompraInput || null;
  const costoAdquisicion = toOptionalNumber(formData.get("costo_adquisicion"));
  const costoMoneda = toUpperTrimmed(formData.get("costo_moneda"));
  const precioVenta = toOptionalNumber(formData.get("precio_venta"));
  const precioMoneda = toUpperTrimmed(formData.get("precio_moneda"));
  const precioInfoautoCompra = toOptionalNumber(formData.get("precio_infoauto_compra"));
  const precioInfoautoActual = toOptionalNumber(formData.get("precio_infoauto_actual"));
  const precioInfoautoAnterior = toOptionalNumber(formData.get("precio_infoauto_anterior"));
  const precioPermuta = toOptionalNumber(formData.get("precio_permuta"));
  const precioContado = toOptionalNumber(formData.get("precio_contado"));
  const costoReposicion = toOptionalNumber(formData.get("costo_reposicion"));
  const estado = toUpperTrimmed(formData.get("estado")).toLowerCase();
  const estadoPreparacion = toOptionalString(formData.get("estado_preparacion"));
  const chapero = toOptionalString(formData.get("chapero"));
  const preparacionComentarios = toOptionalString(formData.get("preparacion_comentarios"));
  const publicadoMercadolibre = toBoolean(formData.get("publicado_mercadolibre"));
  const publicadoRodadosGoogle = toBoolean(formData.get("publicado_rodados_google"));
  const descripcion = toOptionalString(formData.get("descripcion"));
  const observaciones = toOptionalString(formData.get("observaciones"));
  const fechaIngresoInput = toOptionalString(formData.get("fecha_ingreso"));
  const fechaIngreso = fechaIngresoInput || new Date().toISOString().slice(0, 10);

  return {
    marca,
    modelo,
    version,
    anio,
    color,
    km,
    dominio,
    motor,
    ubicacion,
    nroOperacion,
    proveedorId,
    fechaCompra,
    costoAdquisicion,
    costoMoneda,
    precioVenta,
    precioMoneda,
    precioInfoautoCompra,
    precioInfoautoActual,
    precioInfoautoAnterior,
    precioPermuta,
    precioContado,
    costoReposicion,
    estado,
    estadoPreparacion,
    chapero,
    preparacionComentarios,
    publicadoMercadolibre,
    publicadoRodadosGoogle,
    descripcion,
    observaciones,
    fechaIngreso,
  };
}

function validateVehicleData(data: {
  marca: string;
  modelo: string;
  costoMoneda: string;
  precioMoneda: string;
  estado: string;
}) {
  if (!data.marca || !data.modelo) {
    return "Marca y modelo son obligatorios.";
  }

  if (!["ARS", "USD"].includes(data.costoMoneda)) {
    return "La moneda de costo debe ser ARS o USD.";
  }

  if (!["ARS", "USD"].includes(data.precioMoneda)) {
    return "La moneda de venta debe ser ARS o USD.";
  }

  if (!["en_stock", "vendido", "en_consignacion"].includes(data.estado)) {
    return "El estado del vehículo no es válido.";
  }

  return null;
}

async function uploadVehicleFotos({
  supabase,
  userId,
  files,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  userId: string;
  files: File[];
}) {
  const publicUrls: string[] = [];

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return { error: "Solo se permiten imágenes JPG, PNG o WEBP." as const };
    }

    const extension = getFileExtension(file);
    const path = `${userId}/${crypto.randomUUID()}.${extension ?? "jpg"}`;

    const { error: uploadError } = await supabase.storage
      .from("vehiculos")
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: "No pudimos subir una de las fotos. Intentá de nuevo." as const };
    }

    const { data } = supabase.storage.from("vehiculos").getPublicUrl(path);
    publicUrls.push(data.publicUrl);
  }

  return { publicUrls };
}

export async function createVehiculoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar cambios." };
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

  if (!employee || employee.activo !== true || !canManageInventory(employee.rol)) {
    return { error: "No tenés permisos para guardar vehículos." };
  }

  const data = collectVehicleData(formData);
  const validationError = validateVehicleData(data);

  if (validationError) {
    return { error: validationError };
  }

  const fileEntries = formData
    .getAll("fotos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (fileEntries.length > 8) {
    return { error: "Podés subir como máximo 8 fotos." };
  }

  const uploadResult = await uploadVehicleFotos({
    supabase,
    userId: user.id,
    files: fileEntries,
  });

  if ("error" in uploadResult) {
    return { error: uploadResult.error };
  }

  const { error: insertError } = await supabase.from("vehiculos").insert({
    marca: data.marca,
    modelo: data.modelo,
    version: data.version || null,
    anio: data.anio ?? null,
    color: data.color || null,
    km: data.km,
    dominio: data.dominio || null,
    motor: data.motor || null,
    ubicacion: data.ubicacion || null,
    nro_operacion: data.nroOperacion || null,
    proveedor_id: data.proveedorId || null,
    fecha_compra: data.fechaCompra,
    costo_adquisicion: data.costoAdquisicion,
    costo_moneda: data.costoMoneda,
    precio_venta: data.precioVenta,
    precio_moneda: data.precioMoneda,
    precio_infoauto_compra: data.precioInfoautoCompra,
    precio_infoauto_actual: data.precioInfoautoActual,
    precio_infoauto_anterior: data.precioInfoautoAnterior,
    precio_permuta: data.precioPermuta,
    precio_contado: data.precioContado,
    costo_reposicion: data.costoReposicion,
    estado: data.estado,
    estado_preparacion: data.estadoPreparacion || null,
    chapero: data.chapero || null,
    preparacion_comentarios: data.preparacionComentarios || null,
    publicado_mercadolibre: data.publicadoMercadolibre,
    publicado_rodados_google: data.publicadoRodadosGoogle,
    fotos: uploadResult.publicUrls,
    fecha_ingreso: data.fechaIngreso,
    descripcion: data.descripcion || null,
    observaciones: data.observaciones || null,
    created_by: user.id,
    updated_by: user.id,
  });

  if (insertError) {
    return { error: "No pudimos guardar el vehículo. Revisá los datos e intentá de nuevo." };
  }

  revalidatePath("/inventario");
  redirect("/inventario");
}

export async function updateVehiculoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar cambios." };
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

  if (!employee || employee.activo !== true || !canManageInventory(employee.rol)) {
    return { error: "No tenés permisos para guardar vehículos." };
  }

  const id = toOptionalString(formData.get("id"));
  if (!id) {
    return { error: "No pudimos identificar el vehículo." };
  }

  const data = collectVehicleData(formData);
  const validationError = validateVehicleData(data);

  if (validationError) {
    return { error: validationError };
  }

  const existingFotos = parseExistingFotos(formData);
  const fileEntries = formData
    .getAll("fotos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (existingFotos.length + fileEntries.length > 8) {
    return { error: "Podés tener como máximo 8 fotos en total." };
  }

  const uploadResult = await uploadVehicleFotos({
    supabase,
    userId: user.id,
    files: fileEntries,
  });

  if ("error" in uploadResult) {
    return { error: uploadResult.error };
  }

  const finalFotos = [...existingFotos, ...uploadResult.publicUrls];

  const { error: updateError } = await supabase
    .from("vehiculos")
    .update({
      marca: data.marca,
      modelo: data.modelo,
      version: data.version || null,
      anio: data.anio ?? null,
      color: data.color || null,
      km: data.km,
      dominio: data.dominio || null,
      motor: data.motor || null,
      ubicacion: data.ubicacion || null,
      nro_operacion: data.nroOperacion || null,
      proveedor_id: data.proveedorId || null,
      fecha_compra: data.fechaCompra,
      costo_adquisicion: data.costoAdquisicion,
      costo_moneda: data.costoMoneda,
      precio_venta: data.precioVenta,
      precio_moneda: data.precioMoneda,
      precio_infoauto_compra: data.precioInfoautoCompra,
      precio_infoauto_actual: data.precioInfoautoActual,
      precio_infoauto_anterior: data.precioInfoautoAnterior,
      precio_permuta: data.precioPermuta,
      precio_contado: data.precioContado,
      costo_reposicion: data.costoReposicion,
      estado: data.estado,
      estado_preparacion: data.estadoPreparacion || null,
      chapero: data.chapero || null,
      preparacion_comentarios: data.preparacionComentarios || null,
      publicado_mercadolibre: data.publicadoMercadolibre,
      publicado_rodados_google: data.publicadoRodadosGoogle,
      fotos: finalFotos,
      fecha_ingreso: data.fechaIngreso,
      descripcion: data.descripcion || null,
      observaciones: data.observaciones || null,
      updated_by: user.id,
    })
    .eq("id", id);

  if (updateError) {
    return { error: "No pudimos guardar los cambios. Revisá los datos e intentá de nuevo." };
  }

  revalidatePath("/inventario");
  revalidatePath(`/inventario/${id}/editar`);
  redirect("/inventario");
}

export async function getVehiculoById(id: string) {
  if (isDemoMode) {
    return null;
  }

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("vehiculos")
    .select(
      "id,marca,modelo,version,anio,color,km,dominio,motor,ubicacion,nro_operacion,proveedor_id,fecha_compra,costo_adquisicion,costo_moneda,precio_venta,precio_moneda,precio_infoauto_compra,precio_infoauto_actual,precio_infoauto_anterior,precio_permuta,precio_contado,costo_reposicion,estado,estado_preparacion,chapero,preparacion_comentarios,publicado_mercadolibre,publicado_rodados_google,fotos,fecha_ingreso,descripcion,observaciones,created_at"
    )
    .eq("id", id)
    .maybeSingle();

  return data;
}

export async function normalizeFotosArray(fotos: unknown) {
  return parseExistingFotosFromDb(fotos);
}
