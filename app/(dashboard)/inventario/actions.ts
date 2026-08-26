"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canManageInventory, canViewCosts } from "@/lib/auth/permissions";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
};

export async function createVehiculoGastoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) return { error: "Modo demo activo: conectá el entorno real para guardar cambios." };
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró. Volvé a iniciar sesión." };
  const { data: employee } = await supabase.from("empleados").select("rol,activo").eq("id", user.id).maybeSingle();
  if (!employee?.activo || !canManageInventory(employee.rol)) return { error: "No tenés permisos para cargar gastos." };

  const vehiculoId = toOptionalString(formData.get("vehiculo_id"));
  const monto = toOptionalNumber(formData.get("monto"));
  const fecha = toOptionalString(formData.get("fecha")) || new Date().toISOString().slice(0, 10);
  const moneda = toUpperTrimmed(formData.get("moneda"));
  const tipo = toOptionalString(formData.get("tipo")) || "otro";
  const detalle = toOptionalString(formData.get("detalle")) || null;
  if (!vehiculoId || monto == null || monto <= 0) return { error: "Indicá un monto válido para el gasto." };
  if (!["ARS", "USD"].includes(moneda)) return { error: "La moneda debe ser ARS o USD." };

  const { error } = await supabase.from("vehiculo_gastos").insert({
    vehiculo_id: vehiculoId,
    tipo,
    monto,
    moneda,
    fecha,
    detalle,
    created_by: user.id,
    updated_by: user.id,
  });
  if (error) return { error: "No pudimos cargar el gasto. Revisá los datos e intentá de nuevo." };
  revalidatePath(`/inventario/${vehiculoId}`);
  revalidatePath("/inventario");
  return {};
}

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
  // Inputs type=number send decimal points; accept comma decimals without
  // corrupting values such as 1.5 into 15.
  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;
  const parsed = Number(normalized);
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
  // Las consignaciones pueden ingresar sin costo de adquisición. En ese caso
  // usamos la moneda comercial como referencia para no bloquear el alta.
  const costoMoneda = toUpperTrimmed(formData.get("costo_moneda")) || "ARS";
  const precioVenta = toOptionalNumber(formData.get("precio_venta"));
  const precioMoneda = toUpperTrimmed(formData.get("precio_moneda"));
  const precioInfoautoCompra = toOptionalNumber(formData.get("precio_infoauto_compra"));
  const precioInfoautoActual = toOptionalNumber(formData.get("precio_infoauto_actual"));
  const precioInfoautoAnterior = toOptionalNumber(formData.get("precio_infoauto_anterior"));
  const precioPermuta = toOptionalNumber(formData.get("precio_permuta"));
  const precioContado = toOptionalNumber(formData.get("precio_contado"));
  const costoReposicion = toOptionalNumber(formData.get("costo_reposicion"));
  const estado = toUpperTrimmed(formData.get("estado")).toLowerCase();
  const estadoPreparacion = toOptionalString(formData.get("estado_preparacion")) || "sin_preparar";
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
    return { error: "Modo demo activo: conectá el entorno real para guardar cambios." };
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
    return { error: "Modo demo activo: conectá el entorno real para guardar cambios." };
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

  const { data: existingVehicle, error: existingVehicleError } = await supabase
    .from("vehiculos")
    .select(
      "motor,ubicacion,nro_operacion,proveedor_id,fecha_compra,costo_adquisicion,costo_moneda,precio_infoauto_compra,precio_infoauto_actual,precio_infoauto_anterior,costo_reposicion"
    )
    .eq("id", id)
    .maybeSingle<{
      motor: string | null;
      ubicacion: string | null;
      nro_operacion: string | null;
      proveedor_id: string | null;
      fecha_compra: string | null;
      costo_adquisicion: number | null;
      costo_moneda: string | null;
      precio_infoauto_compra: number | null;
      precio_infoauto_actual: number | null;
      precio_infoauto_anterior: number | null;
      costo_reposicion: number | null;
    }>();

  if (existingVehicleError || !existingVehicle) {
    return { error: "No encontramos el vehículo para actualizarlo." };
  }

  const data = collectVehicleData(formData);

  // Vendedores y gestores no reciben los campos internos en el formulario.
  // Preservarlos evita validaciones incompletas y no borra costos existentes.
  if (!canViewCosts(employee.rol)) {
    data.motor = existingVehicle.motor ?? data.motor;
    data.ubicacion = existingVehicle.ubicacion ?? data.ubicacion;
    data.nroOperacion = existingVehicle.nro_operacion ?? data.nroOperacion;
    data.proveedorId = existingVehicle.proveedor_id ?? data.proveedorId;
    data.fechaCompra = existingVehicle.fecha_compra ?? data.fechaCompra;
    data.costoAdquisicion = existingVehicle.costo_adquisicion ?? data.costoAdquisicion;
    data.costoMoneda = (existingVehicle.costo_moneda ?? data.costoMoneda) || "ARS";
    data.precioInfoautoCompra = existingVehicle.precio_infoauto_compra ?? data.precioInfoautoCompra;
    data.precioInfoautoActual = existingVehicle.precio_infoauto_actual ?? data.precioInfoautoActual;
    data.precioInfoautoAnterior = existingVehicle.precio_infoauto_anterior ?? data.precioInfoautoAnterior;
    data.costoReposicion = existingVehicle.costo_reposicion ?? data.costoReposicion;
  }

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
  const primaryFotoKey = toOptionalString(formData.get("primary_foto_key"));
  const primaryUrl = primaryFotoKey.startsWith("existing:")
    ? primaryFotoKey.slice("existing:".length)
    : primaryFotoKey.startsWith("new:")
      ? uploadResult.publicUrls[Number(primaryFotoKey.slice("new:".length))]
      : null;
  const orderedFotos = primaryUrl && finalFotos.includes(primaryUrl)
    ? [primaryUrl, ...finalFotos.filter((foto) => foto !== primaryUrl)]
    : finalFotos;

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
      fotos: orderedFotos,
      fecha_ingreso: data.fechaIngreso,
      descripcion: data.descripcion || null,
      observaciones: data.observaciones || null,
      updated_by: user.id,
    })
    .eq("id", id);

  if (updateError) {
    console.error("[Inventario] update vehicle failed", {
      vehicleId: id,
      code: updateError.code,
      message: updateError.message,
      details: updateError.details,
      hint: updateError.hint,
    });

    if (updateError.code === "23502") {
      return { error: "Falta completar un dato obligatorio del vehículo." };
    }

    if (updateError.code === "23514" || updateError.code === "22P02") {
      return { error: "Uno de los valores del vehículo no es válido. Revisá preparación, estado y precios." };
    }

    return { error: "No pudimos guardar los cambios. Revisá los datos e intentá de nuevo." };
  }

  revalidatePath("/inventario");
  revalidatePath(`/inventario/${id}/editar`);
  redirect("/inventario");
}

export async function deleteVehiculoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState & { success?: boolean }> {
  if (isDemoMode) return { error: "Modo demo activo: conectá el entorno real para eliminar vehículos." };

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró. Volvé a iniciar sesión." };

  const { data: employee } = await supabase
    .from("empleados")
    .select("rol,activo")
    .eq("id", user.id)
    .maybeSingle<{ rol: string | null; activo: boolean | null }>();

  if (!employee?.activo || employee.rol !== "admin") {
    return { error: "Solo un administrador puede eliminar vehículos." };
  }

  const id = toOptionalString(formData.get("id"));
  if (!id) return { error: "No pudimos identificar el vehículo." };

  const [{ count: leadCount }, { count: conversationCount }, { count: saleCount }] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("vehiculo_interes_id", id),
    supabase.from("conversaciones").select("id", { count: "exact", head: true }).eq("vehiculo_interes_id", id),
    supabase.from("ventas").select("id", { count: "exact", head: true }).eq("vehiculo_id", id),
  ]);

  if ((saleCount ?? 0) > 0) {
    return { error: "No se puede eliminar: el vehículo tiene una venta vinculada." };
  }

  // El CRM y WhatsApp se conservan: solo se quita el vínculo al vehículo eliminado.
  if ((leadCount ?? 0) > 0) {
    const { error: leadsError } = await supabase.from("leads").update({ vehiculo_interes_id: null }).eq("vehiculo_interes_id", id);
    if (leadsError) return { error: "No pudimos desvincular el vehículo de sus leads." };
  }
  if ((conversationCount ?? 0) > 0) {
    const { error: conversationsError } = await supabase.from("conversaciones").update({ vehiculo_interes_id: null }).eq("vehiculo_interes_id", id);
    if (conversationsError) return { error: "No pudimos desvincular el vehículo de sus conversaciones." };
  }

  const { error } = await supabase.from("vehiculos").delete().eq("id", id);
  if (error) {
    console.error("[Inventario] delete vehicle failed", { vehicleId: id, code: error.code, message: error.message });
    return { error: "No pudimos eliminar el vehículo. Puede tener información operativa vinculada." };
  }

  revalidatePath("/inventario");
  revalidatePath("/dashboard/catalogo");
  return { success: true };
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
