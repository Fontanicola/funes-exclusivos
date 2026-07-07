"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
  success?: boolean;
};

function toStringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function toBooleanValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return false;
  return ["true", "1", "on", "yes"].includes(value.toLowerCase());
}

function toNumberValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function getAuthUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, error: "Tu sesión expiró. Volvé a iniciar sesión." } as const;
  }

  return { supabase, user } as const;
}

async function isAdmin(supabase: ReturnType<typeof createSupabaseServerClient>, userId: string) {
  const { data: employee } = await supabase
    .from("empleados")
    .select("id,rol,activo")
    .eq("id", userId)
    .maybeSingle<{ id: string; rol: string | null; activo: boolean | null }>();

  return Boolean(employee && employee.activo === true && employee.rol === "admin");
}

export async function updateEmpleadoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar cambios reales." };
  }

  const auth = await getAuthUser();
  if ("error" in auth) return { error: auth.error };

  if (!(await isAdmin(auth.supabase, auth.user.id))) {
    return { error: "No tenés permisos para editar empleados." };
  }

  const id = toStringValue(formData.get("id"));
  const nombre = toStringValue(formData.get("nombre")) || null;
  const telefono = toStringValue(formData.get("telefono")) || null;
  const rol = toStringValue(formData.get("rol"));
  const activo = toBooleanValue(formData.get("activo"));
  const cargo = toStringValue(formData.get("cargo")) || null;
  const fechaIngreso = toStringValue(formData.get("fecha_ingreso")) || null;
  const comisionDefault = toNumberValue(formData.get("comision_default_porcentaje"));
  const notas = toStringValue(formData.get("notas")) || null;

  if (!id) return { error: "El empleado es obligatorio." };
  if (!["admin", "vendedor", "gestor"].includes(rol)) {
    return { error: "El rol seleccionado no es válido." };
  }
  if (comisionDefault == null || comisionDefault < 0) {
    return { error: "La comisión default debe ser un número válido mayor o igual a 0." };
  }

  const { data: currentEmployee } = await auth.supabase
    .from("empleados")
    .select("id,rol,activo")
    .eq("id", auth.user.id)
    .maybeSingle<{ id: string; rol: string | null; activo: boolean | null }>();

  if (id === auth.user.id) {
    if (activo === false) {
      return { error: "No podés desactivar tu propio usuario." };
    }

    if (currentEmployee?.rol === "admin" && rol !== "admin") {
      return { error: "No podés quitarte tu propio rol admin." };
    }
  }

  const { error } = await auth.supabase
    .from("empleados")
    .update({
      nombre,
      telefono,
      rol,
      activo,
      cargo,
      fecha_ingreso: fechaIngreso,
      comision_default_porcentaje: comisionDefault,
      notas,
    })
    .eq("id", id);

  if (error) {
    return { error: "No pudimos guardar los cambios del empleado." };
  }

  revalidatePath("/empleados");
  return { success: true };
}
