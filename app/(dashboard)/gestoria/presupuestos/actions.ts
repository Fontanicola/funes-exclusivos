"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
  success?: boolean;
};

const allowedItemTypes = new Set([
  "valor_tabla_dnrpa",
  "valor_tabla_api",
  "ceta_factura",
  "aranceles",
  "impuesto_sellos",
  "certificaciones",
  "formularios",
  "honorarios",
  "registro",
  "patentes",
  "otro",
]);

const allowedStates = new Set([
  "borrador",
  "enviado",
  "aprobado",
  "rechazado",
  "facturado",
  "anulado",
]);

function toOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function toLowerTrimmed(value: FormDataEntryValue | null) {
  return toOptionalString(value).toLowerCase();
}

function toUpperTrimmed(value: FormDataEntryValue | null) {
  return toOptionalString(value).toUpperCase();
}

function toOptionalNumber(value: FormDataEntryValue | null) {
  const raw = toOptionalString(value);
  if (!raw) return null;
  const parsed = Number(raw.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeNullableString(value: FormDataEntryValue | null) {
  const trimmed = toOptionalString(value);
  return trimmed || null;
}

function parseItems(formData: FormData) {
  const rows: Array<{
    tipo: string;
    descripcion: string | null;
    monto: number;
    moneda: string;
    orden: number;
  }> = [];

  for (let index = 0; index < 10; index += 1) {
    const tipo = toLowerTrimmed(formData.get(`item_tipo_${index}`));
    const descripcion = normalizeNullableString(formData.get(`item_descripcion_${index}`));
    const monto = toOptionalNumber(formData.get(`item_monto_${index}`));
    const moneda = toUpperTrimmed(formData.get(`item_moneda_${index}`)) || "ARS";

    if (!tipo && monto == null && !descripcion) continue;
    if (!allowedItemTypes.has(tipo)) {
      throw new Error("Uno de los ítems del presupuesto no es válido.");
    }
    if (monto == null) {
      throw new Error("Todos los ítems del presupuesto deben tener monto.");
    }
    if (!["ARS", "USD"].includes(moneda)) {
      throw new Error("La moneda de los ítems debe ser ARS o USD.");
    }

    rows.push({
      tipo,
      descripcion,
      monto,
      moneda,
      orden: index + 1,
    });
  }

  return rows;
}

function getFileCurrency(value: FormDataEntryValue | null) {
  const currency = toUpperTrimmed(value);
  return ["ARS", "USD"].includes(currency) ? currency : null;
}

function ensureAdminOrGestor(role: string | null | undefined) {
  const normalized = (role ?? "").toLowerCase();
  return normalized === "admin" || normalized === "gestor";
}

async function getCurrentUserContext() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión expiró. Volvé a iniciar sesión." as const };
  }

  const { data: empleado } = await supabase
    .from("empleados")
    .select("id,rol,activo")
    .eq("id", user.id)
    .maybeSingle();

  if (!empleado || !empleado.activo || !ensureAdminOrGestor(empleado.rol)) {
    return { error: "No tenés permisos para administrar presupuestos." as const };
  }

  return { supabase, user, empleado };
}

export async function createGestoriaPresupuestoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar presupuestos reales." };
  }

  try {
    const context = await getCurrentUserContext();
    if ("error" in context) {
      return { error: context.error };
    }

    const { supabase, user } = context;

    const tramiteId = normalizeNullableString(formData.get("tramite_id"));
    const ventaId = normalizeNullableString(formData.get("venta_id"));
    const vehiculoId = normalizeNullableString(formData.get("vehiculo_id"));
    const estado = toLowerTrimmed(formData.get("estado")) || "borrador";
    const clienteNombre = normalizeNullableString(formData.get("cliente_nombre"));
    const clienteTelefono = normalizeNullableString(formData.get("cliente_telefono"));
    const clienteEmail = normalizeNullableString(formData.get("cliente_email"));
    const clienteDocumento = normalizeNullableString(formData.get("cliente_documento"));
    const fecha = toOptionalString(formData.get("fecha")) || new Date().toISOString().slice(0, 10);
    const moneda = getFileCurrency(formData.get("moneda")) ?? "ARS";
    const valorVehiculo = toOptionalNumber(formData.get("valor_vehiculo"));
    const valorTablaDnrpa = toOptionalNumber(formData.get("valor_tabla_dnrpa"));
    const valorTablaApi = toOptionalNumber(formData.get("valor_tabla_api"));
    const linkDnrpa = normalizeNullableString(formData.get("link_dnrpa"));
    const linkApi = normalizeNullableString(formData.get("link_api"));
    const observaciones = normalizeNullableString(formData.get("observaciones"));

    if (!allowedStates.has(estado)) {
      return { error: "El estado del presupuesto no es válido." };
    }
    if (!clienteNombre) {
      return { error: "El nombre del cliente es obligatorio." };
    }

    const items = parseItems(formData);
    const subtotal = items.reduce((sum, item) => sum + item.monto, 0);
    const total = subtotal;

    const { data: presupuesto, error } = await supabase
      .from("gestoria_presupuestos")
      .insert({
        tramite_id: tramiteId,
        venta_id: ventaId,
        vehiculo_id: vehiculoId,
        estado,
        cliente_nombre: clienteNombre,
        cliente_telefono: clienteTelefono,
        cliente_email: clienteEmail,
        cliente_documento: clienteDocumento,
        fecha,
        moneda,
        valor_vehiculo: valorVehiculo,
        valor_tabla_dnrpa: valorTablaDnrpa,
        valor_tabla_api: valorTablaApi,
        subtotal,
        total,
        link_dnrpa: linkDnrpa,
        link_api: linkApi,
        observaciones,
        created_by: user.id,
        updated_by: user.id,
      })
      .select("id")
      .single();

    if (error || !presupuesto?.id) {
      return { error: "No pudimos guardar el presupuesto. Intentá de nuevo." };
    }

    if (items.length) {
      const itemRows = items.map((item) => ({
        presupuesto_id: presupuesto.id,
        tipo: item.tipo,
        descripcion: item.descripcion,
        monto: item.monto,
        moneda: item.moneda,
        orden: item.orden,
        created_by: user.id,
        updated_by: user.id,
      }));

      const { error: itemsError } = await supabase.from("gestoria_presupuesto_items").insert(itemRows);
      if (itemsError) {
        return { error: "No pudimos guardar los ítems del presupuesto. Revisá los datos e intentá de nuevo." };
      }
    }

    revalidatePath("/gestoria/presupuestos");
    revalidatePath("/gestoria/presupuestos/[id]");
    redirect(`/gestoria/presupuestos/${presupuesto.id}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No pudimos guardar el presupuesto.";
    return { error: message };
  }
}

export async function addGestoriaPresupuestoItemAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar presupuestos reales." };
  }

  const context = await getCurrentUserContext();
  if ("error" in context) {
    return { error: context.error };
  }

  const { supabase, user } = context;
  const presupuestoId = normalizeNullableString(formData.get("presupuesto_id"));
  const tipo = toLowerTrimmed(formData.get("tipo"));
  const descripcion = normalizeNullableString(formData.get("descripcion"));
  const monto = toOptionalNumber(formData.get("monto"));
  const moneda = getFileCurrency(formData.get("moneda")) ?? "ARS";

  if (!presupuestoId) return { error: "Falta el presupuesto." };
  if (!allowedItemTypes.has(tipo)) return { error: "El tipo de ítem no es válido." };
  if (monto == null) return { error: "El monto del ítem es obligatorio." };
  if (!["ARS", "USD"].includes(moneda)) return { error: "La moneda del ítem no es válida." };

  const { error } = await supabase.from("gestoria_presupuesto_items").insert({
    presupuesto_id: presupuestoId,
    tipo,
    descripcion,
    monto,
    moneda,
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    return { error: "No pudimos agregar el ítem." };
  }

  revalidatePath(`/gestoria/presupuestos/${presupuestoId}`);
  return { success: true };
}

export async function deleteGestoriaPresupuestoItemAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar presupuestos reales." };
  }

  const context = await getCurrentUserContext();
  if ("error" in context) {
    return { error: context.error };
  }

  const { supabase } = context;
  const itemId = normalizeNullableString(formData.get("item_id"));
  const presupuestoId = normalizeNullableString(formData.get("presupuesto_id"));

  if (!itemId || !presupuestoId) return { error: "Faltan datos para borrar el ítem." };

  const { error } = await supabase.from("gestoria_presupuesto_items").delete().eq("id", itemId);
  if (error) {
    return { error: "No pudimos borrar el ítem." };
  }

  revalidatePath(`/gestoria/presupuestos/${presupuestoId}`);
  return { success: true };
}

export async function updateGestoriaPresupuestoEstadoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar presupuestos reales." };
  }

  const context = await getCurrentUserContext();
  if ("error" in context) {
    return { error: context.error };
  }

  const { supabase, user } = context;
  const presupuestoId = normalizeNullableString(formData.get("presupuesto_id"));
  const estado = toLowerTrimmed(formData.get("estado"));

  if (!presupuestoId) return { error: "Falta el presupuesto." };
  if (!allowedStates.has(estado)) return { error: "El estado no es válido." };

  const { error } = await supabase
    .from("gestoria_presupuestos")
    .update({ estado, updated_by: user.id })
    .eq("id", presupuestoId);

  if (error) {
    return { error: "No pudimos actualizar el estado." };
  }

  revalidatePath("/gestoria/presupuestos");
  revalidatePath(`/gestoria/presupuestos/${presupuestoId}`);
  return { success: true };
}

