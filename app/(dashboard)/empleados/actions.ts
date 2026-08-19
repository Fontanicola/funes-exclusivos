"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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

function safeFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "perfil";
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
    return { error: "Modo demo activo: conectá el entorno real para guardar cambios." };
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
  const avatarEntry = formData.get("avatar");

  if (!id) return { error: "El empleado es obligatorio." };
  if (!["admin", "vendedor", "gestor"].includes(rol)) {
    return { error: "El rol seleccionado no es válido." };
  }
  if (comisionDefault == null || comisionDefault < 0) {
    return { error: "La comisión default debe ser un número válido mayor o igual a 0." };
  }

  let avatarUrl: string | undefined;
  if (avatarEntry && typeof avatarEntry !== "string" && avatarEntry.size > 0) {
    if (!avatarEntry.type.startsWith("image/")) {
      return { error: "La foto debe ser JPG, PNG o WEBP." };
    }
    if (avatarEntry.size > 5 * 1024 * 1024) {
      return { error: "La foto no puede superar los 5 MB." };
    }

    try {
      const admin = createSupabaseAdminClient();
      const bucket = "empleados-avatares";
      await admin.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: "5MB",
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      });

      const storagePath = `${id}/${crypto.randomUUID()}-${safeFileName(avatarEntry.name)}`;
      const { error: uploadError } = await admin.storage.from(bucket).upload(storagePath, avatarEntry, {
        contentType: avatarEntry.type,
        upsert: false,
      });

      if (uploadError) {
        console.error("updateEmpleadoAction avatar upload failed", {
          code: uploadError.name,
          message: uploadError.message,
        });
        return { error: "No pudimos guardar la foto de perfil." };
      }

      avatarUrl = admin.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
    } catch (error) {
      console.error("updateEmpleadoAction avatar storage failed", error);
      return { error: "No pudimos guardar la foto de perfil." };
    }
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

  const employeeUpdate = {
    nombre,
    telefono,
    rol,
    activo,
    cargo,
    fecha_ingreso: fechaIngreso,
    comision_default_porcentaje: comisionDefault,
    notas,
    ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
  };

  const { error } = await auth.supabase
    .from("empleados")
    .update(employeeUpdate)
    .eq("id", id);

  if (error) {
    return { error: "No pudimos guardar los cambios del empleado." };
  }

  revalidatePath("/empleados");
  revalidatePath("/whatsapp");
  return { success: true };
}

export async function createEmpleadoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá el entorno real para crear usuarios." };
  }

  const auth = await getAuthUser();
  if ("error" in auth) return { error: auth.error };

  if (!(await isAdmin(auth.supabase, auth.user.id))) {
    return { error: "No tenés permisos para crear empleados." };
  }

  const email = toStringValue(formData.get("email")).toLowerCase();
  const password = toStringValue(formData.get("password"));
  const nombre = toStringValue(formData.get("nombre"));
  const telefono = toStringValue(formData.get("telefono")) || null;
  const rol = toStringValue(formData.get("rol"));
  const cargo = toStringValue(formData.get("cargo")) || null;
  const fechaIngreso = toStringValue(formData.get("fecha_ingreso")) || null;
  const comisionDefault = toNumberValue(formData.get("comision_default_porcentaje"));
  const notas = toStringValue(formData.get("notas")) || null;

  if (!email || !email.includes("@")) {
    return { error: "Ingresá un email válido." };
  }
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }
  if (!nombre) return { error: "El nombre es obligatorio." };
  if (!["admin", "vendedor", "gestor"].includes(rol)) {
    return { error: "El rol seleccionado no es válido." };
  }
  if (comisionDefault == null || comisionDefault < 0) {
    return { error: "La comisión default debe ser un número válido mayor o igual a 0." };
  }

  const { data: existingEmployee } = await auth.supabase
    .from("empleados")
    .select("id")
    .ilike("email", email)
    .maybeSingle<{ id: string }>();

  if (existingEmployee) {
    return { error: "Ya existe un empleado con ese email." };
  }

  let createdUserId: string | null = null;

  try {
    const admin = createSupabaseAdminClient();
    const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre, rol },
    });

    if (createUserError || !createdUser.user) {
      const message = createUserError?.message?.toLowerCase() ?? "";
      if (message.includes("already") || message.includes("registered")) {
        return { error: "Ya existe un usuario con ese email." };
      }
      return { error: "No pudimos crear el usuario. Revisá el email y la contraseña." };
    }

    createdUserId = createdUser.user.id;

    const { error: employeeError } = await admin.from("empleados").upsert({
      id: createdUserId,
      email,
      nombre,
      telefono,
      rol,
      activo: true,
      cargo,
      fecha_ingreso: fechaIngreso,
      comision_default_porcentaje: comisionDefault,
      notas,
    }, { onConflict: "id" });

    if (employeeError) {
      console.error("createEmpleadoAction profile upsert failed", {
        code: employeeError.code,
        message: employeeError.message,
        details: employeeError.details,
        hint: employeeError.hint,
      });
      await admin.auth.admin.deleteUser(createdUserId);
      return { error: "El usuario se creó, pero no pudimos completar su perfil operativo." };
    }
  } catch (error) {
    if (createdUserId) {
      try {
        await createSupabaseAdminClient().auth.admin.deleteUser(createdUserId);
      } catch {
        // Avoid exposing infrastructure details in the form response.
      }
    }

    console.error("createEmpleadoAction failed", error);
    return { error: "No pudimos crear el empleado. Revisá la configuración del entorno." };
  }

  revalidatePath("/empleados");
  return { success: true };
}

export async function deleteEmpleadoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá el entorno real para eliminar usuarios." };
  }

  const auth = await getAuthUser();
  if ("error" in auth) return { error: auth.error };

  if (!(await isAdmin(auth.supabase, auth.user.id))) {
    return { error: "No tenés permisos para eliminar empleados." };
  }

  const id = toStringValue(formData.get("id"));
  if (!id) return { error: "El empleado es obligatorio." };
  if (id === auth.user.id) return { error: "No podés eliminar tu propio usuario." };

  const admin = createSupabaseAdminClient();
  const { data: employee } = await admin
    .from("empleados")
    .select("id,email,nombre,telefono,avatar_url,rol,activo,cargo,fecha_ingreso,comision_default_porcentaje,notas")
    .eq("id", id)
    .maybeSingle();

  if (!employee) return { error: "El empleado ya no existe." };

  const { error: profileError } = await admin.from("empleados").delete().eq("id", id);
  if (profileError) {
    console.error("deleteEmpleadoAction profile delete failed", {
      code: profileError.code,
      message: profileError.message,
      details: profileError.details,
      hint: profileError.hint,
    });
    return { error: "No pudimos eliminar el perfil. Puede tener información operativa vinculada." };
  }

  const { error: authError } = await admin.auth.admin.deleteUser(id);
  if (authError) {
    console.error("deleteEmpleadoAction auth delete failed", {
      code: authError.code,
      message: authError.message,
    });

    const { error: restoreError } = await admin.from("empleados").upsert(employee, { onConflict: "id" });
    if (restoreError) {
      console.error("deleteEmpleadoAction profile restore failed", {
        code: restoreError.code,
        message: restoreError.message,
      });
    }

    return { error: "No pudimos eliminar el acceso del usuario. No se realizaron cambios." };
  }

  revalidatePath("/empleados");
  return { success: true };
}
