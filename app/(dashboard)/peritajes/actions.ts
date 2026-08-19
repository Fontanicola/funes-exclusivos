"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DEFAULT_PERITAJE_PANELS, type PeritajeItem, type PeritajePanel, type PeritajeRepair, type PeritajeStatus } from "@/lib/peritajes/types";

type ActionResult = { error?: string; success?: string; peritajeId?: string };

async function getOperator() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró. Volvé a ingresar." as const };

  const { data: employee } = await supabase
    .from("empleados")
    .select("id,rol,activo")
    .eq("id", user.id)
    .maybeSingle();

  if (!employee || employee.activo === false) return { error: "No tenés permisos para realizar esta acción." as const };
  const role = String(employee.rol ?? "").toLowerCase();
  if (role !== "admin" && role !== "gestor") return { error: "No tenés permisos para realizar esta acción." as const };
  return { supabase, user, employee };
}

function parseNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export async function createPeritajeAction(formData: FormData): Promise<ActionResult> {
  if (isDemoMode) return { error: "Modo demo activo: conectá Supabase para guardar peritajes reales." };
  const operator = await getOperator();
  if ("error" in operator) return operator;

  const vehiculoId = String(formData.get("vehiculo_id") ?? "").trim();
  if (!vehiculoId) return { error: "Seleccioná un vehículo para iniciar el peritaje." };

  const { data: vehicle } = await operator.supabase.from("vehiculos").select("id").eq("id", vehiculoId).maybeSingle();
  if (!vehicle) return { error: "No encontramos el vehículo seleccionado." };

  const { data: template } = await operator.supabase
    .from("peritaje_plantillas")
    .select("id")
    .eq("activo", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: peritaje, error } = await operator.supabase
    .from("peritajes")
    .insert({
      vehiculo_id: vehiculoId,
      plantilla_id: template?.id ?? null,
      estado: "borrador",
      fecha_peritaje: String(formData.get("fecha_peritaje") ?? "") || new Date().toISOString().slice(0, 10),
      cliente_nombre: String(formData.get("cliente_nombre") ?? "").trim() || null,
      cliente_telefono: String(formData.get("cliente_telefono") ?? "").trim() || null,
      tasador_id: operator.user.id,
      created_by: operator.user.id,
      updated_by: operator.user.id,
    })
    .select("id")
    .single();

  if (error || !peritaje) return { error: error?.message ?? "No pudimos iniciar el peritaje." };

  if (template?.id) {
    const { data: templateSections } = await operator.supabase
      .from("peritaje_plantilla_secciones")
      .select("id,nombre")
      .eq("plantilla_id", template.id)
      .eq("activo", true);
    const sectionIds = (templateSections ?? []).map((section) => section.id);
    const { data: templateItems } = sectionIds.length
      ? await operator.supabase
          .from("peritaje_plantilla_items")
          .select("id,seccion_id,codigo,nombre,tipo,orden")
          .eq("activo", true)
          .in("seccion_id", sectionIds)
          .order("orden", { ascending: true })
      : { data: [] };

    if (templateItems?.length) {
      const sectionNames = new Map((templateSections ?? []).map((section) => [section.id, section.nombre]));
      const items = templateItems.map((item) => ({
        peritaje_id: peritaje.id,
        plantilla_item_id: item.id,
        codigo: item.codigo,
        nombre: item.nombre,
        seccion: sectionNames.get(item.seccion_id) ?? null,
        tipo: item.tipo,
        orden: item.orden,
      }));
      const { error: itemsError } = await operator.supabase.from("peritaje_items").insert(items);
      if (itemsError) return { error: itemsError.message || "No pudimos preparar el checklist del peritaje." };
    }
  }

  const { error: panelsError } = await operator.supabase.from("peritaje_paneles").insert(DEFAULT_PERITAJE_PANELS.map((panel) => ({ ...panel, peritaje_id: peritaje.id })));
  if (panelsError) return { error: panelsError.message || "No pudimos preparar el mapa de paneles." };
  revalidatePath(`/inventario/${vehiculoId}/peritaje`);
  revalidatePath("/peritajes");
  return { success: "Peritaje iniciado.", peritajeId: peritaje.id };
}

export async function savePeritajeAction(input: {
  id: string;
  vehiculoId: string;
  estado: PeritajeStatus;
  fechaPeritaje: string;
  clienteNombre: string;
  clienteTelefono: string;
  datosGenerales: Record<string, unknown>;
  equipamiento: Record<string, unknown>;
  observaciones: string;
  gastoTotal: number;
  moneda: "ARS" | "USD";
  valorMercado: number | null;
  valorSitio1: number | null;
  valorSitio2: number | null;
  valorTasado: number | null;
  items: PeritajeItem[];
  paneles: PeritajePanel[];
  reparaciones: PeritajeRepair[];
}): Promise<ActionResult> {
  if (isDemoMode) return { error: "Modo demo activo: los cambios se muestran solo localmente." };
  const operator = await getOperator();
  if ("error" in operator) return operator;

  const { error } = await operator.supabase.from("peritajes").update({
    estado: input.estado,
    fecha_peritaje: input.fechaPeritaje,
    cliente_nombre: input.clienteNombre.trim() || null,
    cliente_telefono: input.clienteTelefono.trim() || null,
    datos_generales: input.datosGenerales,
    equipamiento: input.equipamiento,
    observaciones: input.observaciones.trim() || null,
    gasto_total: Math.max(0, input.gastoTotal || 0),
    moneda: input.moneda,
    valor_mercado: input.valorMercado,
    valor_sitio_1: input.valorSitio1,
    valor_sitio_2: input.valorSitio2,
    valor_tasado: input.valorTasado,
    updated_by: operator.user.id,
    updated_at: new Date().toISOString(),
  }).eq("id", input.id).eq("vehiculo_id", input.vehiculoId);

  if (error) return { error: error.message || "No pudimos guardar el peritaje." };

  const items = input.items.map((item) => ({
    peritaje_id: input.id,
    plantilla_item_id: item.id ?? null,
    codigo: item.codigo,
    nombre: item.nombre,
    seccion: item.seccion,
    tipo: item.tipo,
    estado: item.estado,
    valor: item.valor ?? {},
    nota: item.nota?.trim() || null,
    orden: item.orden,
    updated_at: new Date().toISOString(),
  }));
  if (items.length) {
    const { error: itemsError } = await operator.supabase.from("peritaje_items").upsert(items, { onConflict: "peritaje_id,codigo" });
    if (itemsError) return { error: itemsError.message || "No pudimos guardar el checklist." };
  }

  const panels = input.paneles.map((panel) => ({
    peritaje_id: input.id,
    codigo: panel.codigo,
    nombre: panel.nombre,
    estado: panel.estado,
    nota: panel.nota?.trim() || null,
    orden: panel.orden,
    updated_by: operator.user.id,
    updated_at: new Date().toISOString(),
  }));
  if (panels.length) {
    const { error: panelsError } = await operator.supabase.from("peritaje_paneles").upsert(panels, { onConflict: "peritaje_id,codigo" });
    if (panelsError) return { error: panelsError.message || "No pudimos guardar el estado de los paneles." };
  }

  const { error: deleteRepairsError } = await operator.supabase.from("peritaje_reparaciones").delete().eq("peritaje_id", input.id);
  if (deleteRepairsError) return { error: deleteRepairsError.message || "No pudimos actualizar reparaciones." };
  if (input.reparaciones.length) {
    const { error: repairsError } = await operator.supabase.from("peritaje_reparaciones").insert(input.reparaciones.map((repair, index) => ({
      peritaje_id: input.id,
      orden: index,
      descripcion: repair.descripcion.trim(),
      monto: parseNumber(repair.monto) ?? 0,
      moneda: repair.moneda,
      estado: repair.estado,
    })));
    if (repairsError) return { error: repairsError.message || "No pudimos guardar reparaciones." };
  }

  revalidatePath(`/inventario/${input.vehiculoId}/peritaje`);
  revalidatePath(`/inventario/${input.vehiculoId}`);
  revalidatePath("/peritajes");
  revalidatePath("/dashboard");
  return { success: "Peritaje guardado." };
}

export async function createPeritajeTemplateAction(formData: FormData): Promise<ActionResult> {
  if (isDemoMode) return { error: "Modo demo activo: conectá Supabase para administrar plantillas." };
  const operator = await getOperator();
  if ("error" in operator || String(operator.employee.rol).toLowerCase() !== "admin") return { error: "No tenés permisos para administrar plantillas." };
  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) return { error: "Escribí un nombre para la plantilla." };
  const { error } = await operator.supabase.from("peritaje_plantillas").insert({ nombre, descripcion: String(formData.get("descripcion") ?? "").trim() || null, created_by: operator.user.id, updated_by: operator.user.id });
  if (error) return { error: error.message || "No pudimos crear la plantilla." };
  revalidatePath("/peritajes/plantillas");
  return { success: "Plantilla creada." };
}

export async function createPeritajeTemplateSectionAction(formData: FormData): Promise<ActionResult> {
  if (isDemoMode) return { error: "Modo demo activo: conectá Supabase para administrar plantillas." };
  const operator = await getOperator();
  if ("error" in operator || String(operator.employee.rol).toLowerCase() !== "admin") return { error: "No tenés permisos para administrar plantillas." };
  const plantillaId = String(formData.get("plantilla_id") ?? "").trim();
  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!plantillaId || !nombre) return { error: "Completá el nombre de la sección." };
  const { error } = await operator.supabase.from("peritaje_plantilla_secciones").insert({ plantilla_id: plantillaId, nombre, descripcion: String(formData.get("descripcion") ?? "").trim() || null, orden: Number(formData.get("orden") ?? 0) || 0 });
  if (error) return { error: error.message || "No pudimos crear la sección." };
  revalidatePath("/peritajes/plantillas");
  return { success: "Sección agregada." };
}

export async function createPeritajeTemplateItemAction(formData: FormData): Promise<ActionResult> {
  if (isDemoMode) return { error: "Modo demo activo: conectá Supabase para administrar plantillas." };
  const operator = await getOperator();
  if ("error" in operator || String(operator.employee.rol).toLowerCase() !== "admin") return { error: "No tenés permisos para administrar plantillas." };
  const seccionId = String(formData.get("seccion_id") ?? "").trim();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const codigo = String(formData.get("codigo") ?? "").trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_");
  const tipo = String(formData.get("tipo") ?? "estado");
  if (!seccionId || !nombre || !codigo) return { error: "Completá el nombre y código del ítem." };
  const { error } = await operator.supabase.from("peritaje_plantilla_items").insert({ seccion_id: seccionId, nombre, codigo, tipo, orden: Number(formData.get("orden") ?? 0) || 0 });
  if (error) return { error: error.message || "No pudimos agregar el ítem." };
  revalidatePath("/peritajes/plantillas");
  return { success: "Ítem agregado." };
}

export async function deletePeritajeTemplateItemAction(formData: FormData): Promise<ActionResult> {
  if (isDemoMode) return { error: "Modo demo activo: conectá Supabase para administrar plantillas." };
  const operator = await getOperator();
  if ("error" in operator || String(operator.employee.rol).toLowerCase() !== "admin") return { error: "No tenés permisos para administrar plantillas." };
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Ítem inválido." };
  const { error } = await operator.supabase.from("peritaje_plantilla_items").update({ activo: false }).eq("id", id);
  if (error) return { error: error.message || "No pudimos quitar el ítem." };
  revalidatePath("/peritajes/plantillas");
  return { success: "Ítem quitado." };
}
