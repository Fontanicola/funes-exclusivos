"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
  success?: boolean;
};

function toOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function toOptionalBoolean(value: FormDataEntryValue | null) {
  return value !== null;
}

function requireAdminRole(employee: { rol: string | null; activo: boolean | null } | null) {
  return Boolean(employee && employee.activo === true && employee.rol === "admin");
}

async function ensureAdmin(supabase: ReturnType<typeof createSupabaseServerClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión expiró. Volvé a iniciar sesión." } as const;
  }

  const { data: employee } = await supabase
    .from("empleados")
    .select("id,rol,activo")
    .eq("id", user.id)
    .maybeSingle<{ id: string; rol: string | null; activo: boolean | null }>();

  if (!requireAdminRole(employee ?? null)) {
    return { error: "No tenés permisos para administrar el catálogo." } as const;
  }

  return { user } as const;
}

export async function updateCatalogoConfigAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar cambios reales." };
  }

  const supabase = createSupabaseServerClient();
  const authResult = await ensureAdmin(supabase);

  if ("error" in authResult) {
    return { error: authResult.error };
  }

  const activo = toOptionalBoolean(formData.get("activo"));
  const titulo = toOptionalString(formData.get("titulo"));
  const descripcion = toOptionalString(formData.get("descripcion"));
  const whatsappContacto = toOptionalString(formData.get("whatsapp_contacto"));
  const instagramUrl = toOptionalString(formData.get("instagram_url"));
  const mostrarPrecios = toOptionalBoolean(formData.get("mostrar_precios"));
  const mostrarKm = toOptionalBoolean(formData.get("mostrar_km"));
  const mostrarDominio = toOptionalBoolean(formData.get("mostrar_dominio"));

  const { error } = await supabase
    .from("catalogo_config")
    .upsert(
      {
        id: true,
        activo,
        titulo: titulo || null,
        descripcion: descripcion || null,
        whatsapp_contacto: whatsappContacto || null,
        instagram_url: instagramUrl || null,
        mostrar_precios: mostrarPrecios,
        mostrar_km: mostrarKm,
        mostrar_dominio: mostrarDominio,
      },
      { onConflict: "id" }
    );

  if (error) {
    return { error: "No pudimos guardar la configuración del catálogo." };
  }

  revalidatePath("/catalogo");
  return { success: true };
}

export async function updateVehiculoCatalogoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar cambios reales." };
  }

  const supabase = createSupabaseServerClient();
  const authResult = await ensureAdmin(supabase);

  if ("error" in authResult) {
    return { error: authResult.error };
  }

  const vehiculoId = toOptionalString(formData.get("vehiculo_id"));
  const catalogoTitulo = toOptionalString(formData.get("catalogo_titulo"));
  const catalogoDescripcion = toOptionalString(formData.get("catalogo_descripcion"));
  const catalogoOrdenRaw = toOptionalString(formData.get("catalogo_orden"));
  const catalogoOrden = catalogoOrdenRaw ? Number(catalogoOrdenRaw) : null;

  if (!vehiculoId) {
    return { error: "El vehículo es obligatorio." };
  }

  if (catalogoOrdenRaw && !Number.isFinite(catalogoOrden)) {
    return { error: "El orden del catálogo debe ser un número válido." };
  }

  const { error } = await supabase
    .from("vehiculos")
    .update({
      catalogo_publicado: toOptionalBoolean(formData.get("catalogo_publicado")),
      catalogo_destacado: toOptionalBoolean(formData.get("catalogo_destacado")),
      catalogo_titulo: catalogoTitulo || null,
      catalogo_descripcion: catalogoDescripcion || null,
      catalogo_orden: catalogoOrden,
    })
    .eq("id", vehiculoId);

  if (error) {
    return { error: "No pudimos guardar la publicación de este vehículo." };
  }

  revalidatePath("/catalogo");
  return { success: true };
}
