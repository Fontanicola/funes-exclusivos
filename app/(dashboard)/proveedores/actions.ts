"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = { error?: string; success?: boolean };

export async function createProveedorAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  if (isDemoMode) return { error: "Modo demo activo: conectá el entorno real para guardar proveedores." };

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró. Volvé a iniciar sesión." };

  const { data: employee } = await supabase.from("empleados").select("rol,activo").eq("id", user.id).maybeSingle<{ rol: string | null; activo: boolean | null }>();
  if (!employee?.activo || !["admin", "gestor"].includes(employee.rol ?? "")) {
    return { error: "No tenés permisos para crear proveedores." };
  }

  const nombre = String(formData.get("nombre") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  if (!nombre) return { error: "El nombre del proveedor es obligatorio." };

  const { error } = await supabase.from("proveedores").insert({
    nombre,
    categoria: categoria || null,
    telefono: telefono || null,
    activo: true,
  });

  if (error) return { error: "No pudimos crear el proveedor. Revisá los datos e intentá de nuevo." };
  revalidatePath("/caja");
  revalidatePath("/compras/nueva");
  revalidatePath("/inventario");
  return { success: true };
}
