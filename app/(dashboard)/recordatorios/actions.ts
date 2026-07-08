"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
  success?: boolean;
};

const allowedTypes = new Set([
  "seguimiento_crm",
  "gestoria",
  "entrega",
  "whatsapp",
  "caja",
  "comision",
  "inventario",
  "otro",
]);

const allowedPriorities = new Set(["baja", "media", "alta", "critica"]);
const finalStates = new Set(["completado", "cancelado"]);
const allowedStates = new Set(["pendiente", "pospuesto", "completado", "cancelado"]);

function toStringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function toLowerValue(value: FormDataEntryValue | null) {
  return toStringValue(value).toLowerCase();
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function buildUserMessage(label: string) {
  return `No podés modificar un recordatorio de ${label} que no te corresponde.`;
}

async function getCurrentEmployee(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión expiró. Volvé a iniciar sesión." } as const;
  }

  const { data: employee, error } = await supabase
    .from("empleados")
    .select("id,rol,activo")
    .eq("id", user.id)
    .maybeSingle<{ id: string; rol: string | null; activo: boolean | null }>();

  if (error || !employee || employee.activo !== true) {
    return { error: "Usuario inactivo o sin perfil operativo." } as const;
  }

  return {
    user,
    employee,
  } as const;
}

async function fetchRecordatorio(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  id: string
) {
  const { data, error } = await supabase
    .from("recordatorios")
    .select("id,estado,asignado_a")
    .eq("id", id)
    .maybeSingle<{ id: string; estado: string | null; asignado_a: string | null }>();

  if (error || !data) {
    return { error: "No pudimos encontrar el recordatorio." } as const;
  }

  return { recordatorio: data } as const;
}

export async function createRecordatorioAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar recordatorios reales." };
  }

  const supabase = createSupabaseServerClient();
  const authResult = await getCurrentEmployee(supabase);

  if ("error" in authResult) {
    return { error: authResult.error };
  }

  const tipo = toLowerValue(formData.get("tipo"));
  const prioridad = toLowerValue(formData.get("prioridad")) || "media";
  const titulo = toStringValue(formData.get("titulo"));
  const descripcion = toStringValue(formData.get("descripcion")) || null;
  const fechaVencimiento = toStringValue(formData.get("fecha_vencimiento"));
  const asignadoA = toStringValue(formData.get("asignado_a")) || authResult.user.id;

  if (!tipo) return { error: "El tipo de recordatorio es obligatorio." };
  if (!allowedTypes.has(tipo)) return { error: "El tipo de recordatorio no es válido." };
  if (!allowedPriorities.has(prioridad)) return { error: "La prioridad no es válida." };
  if (!titulo) return { error: "El título del recordatorio es obligatorio." };
  if (!fechaVencimiento) return { error: "La fecha de vencimiento es obligatoria." };

  if (authResult.employee.rol !== "admin" && asignadoA !== authResult.user.id) {
    return { error: "Solo podés asignarte recordatorios a vos mismo." };
  }

  const { error } = await supabase.from("recordatorios").insert({
    tipo,
    estado: "pendiente",
    prioridad,
    titulo,
    descripcion,
    fecha_vencimiento: fechaVencimiento,
    asignado_a: asignadoA,
  });

  if (error) {
    return { error: "No pudimos guardar el recordatorio. Revisá los datos e intentá de nuevo." };
  }

  revalidatePath("/recordatorios");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function completeRecordatorioAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar cambios reales." };
  }

  const supabase = createSupabaseServerClient();
  const authResult = await getCurrentEmployee(supabase);

  if ("error" in authResult) {
    return { error: authResult.error };
  }

  const id = toStringValue(formData.get("id"));
  if (!id) return { error: "Falta el recordatorio." };

  const current = await fetchRecordatorio(supabase, id);
  if ("error" in current) return { error: current.error };

  if (authResult.employee.rol !== "admin" && current.recordatorio.asignado_a !== authResult.user.id) {
    return { error: buildUserMessage("recordatorio") };
  }

  if (finalStates.has(toLowerValue(current.recordatorio.estado))) {
    return { error: "El recordatorio ya está cerrado." };
  }

  const { error } = await supabase
    .from("recordatorios")
    .update({
      estado: "completado",
      fecha_completado: todayIso(),
    })
    .eq("id", id);

  if (error) {
    return { error: "No pudimos completar el recordatorio." };
  }

  revalidatePath("/recordatorios");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function postponeRecordatorioAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar cambios reales." };
  }

  const supabase = createSupabaseServerClient();
  const authResult = await getCurrentEmployee(supabase);

  if ("error" in authResult) {
    return { error: authResult.error };
  }

  const id = toStringValue(formData.get("id"));
  const nuevaFecha = toStringValue(formData.get("nueva_fecha"));

  if (!id) return { error: "Falta el recordatorio." };
  if (!nuevaFecha) return { error: "Debés indicar una nueva fecha." };

  const current = await fetchRecordatorio(supabase, id);
  if ("error" in current) return { error: current.error };

  if (authResult.employee.rol !== "admin" && current.recordatorio.asignado_a !== authResult.user.id) {
    return { error: buildUserMessage("recordatorio") };
  }

  if (finalStates.has(toLowerValue(current.recordatorio.estado))) {
    return { error: "El recordatorio ya está cerrado." };
  }

  const { error } = await supabase
    .from("recordatorios")
    .update({
      estado: "pospuesto",
      fecha_pospuesto: todayIso(),
      fecha_vencimiento: nuevaFecha,
    })
    .eq("id", id);

  if (error) {
    return { error: "No pudimos posponer el recordatorio." };
  }

  revalidatePath("/recordatorios");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function cancelRecordatorioAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar cambios reales." };
  }

  const supabase = createSupabaseServerClient();
  const authResult = await getCurrentEmployee(supabase);

  if ("error" in authResult) {
    return { error: authResult.error };
  }

  const id = toStringValue(formData.get("id"));
  if (!id) return { error: "Falta el recordatorio." };

  const current = await fetchRecordatorio(supabase, id);
  if ("error" in current) return { error: current.error };

  if (authResult.employee.rol !== "admin" && current.recordatorio.asignado_a !== authResult.user.id) {
    return { error: buildUserMessage("recordatorio") };
  }

  if (finalStates.has(toLowerValue(current.recordatorio.estado))) {
    return { error: "El recordatorio ya está cerrado." };
  }

  const { error } = await supabase
    .from("recordatorios")
    .update({
      estado: "cancelado",
    })
    .eq("id", id);

  if (error) {
    return { error: "No pudimos cancelar el recordatorio." };
  }

  revalidatePath("/recordatorios");
  revalidatePath("/dashboard");
  return { success: true };
}
