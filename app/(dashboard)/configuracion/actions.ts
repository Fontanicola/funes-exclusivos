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

function toNumberValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toIntegerValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

function toBooleanValue(value: FormDataEntryValue | null) {
  return value !== null;
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

  if (!(employee && employee.activo === true && employee.rol === "admin")) {
    return { error: "No tenés permisos para modificar la configuración general." } as const;
  }

  return { user } as const;
}

export async function updateConfiguracionGeneralAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar configuración real." };
  }

  const supabase = createSupabaseServerClient();
  const authResult = await ensureAdmin(supabase);

  if ("error" in authResult) {
    return { error: authResult.error };
  }

  const empresaNombre = toStringValue(formData.get("empresa_nombre"));
  const empresaRazonSocial = toStringValue(formData.get("empresa_razon_social")) || null;
  const empresaCuit = toStringValue(formData.get("empresa_cuit")) || null;
  const empresaDireccion = toStringValue(formData.get("empresa_direccion")) || null;
  const empresaTelefono = toStringValue(formData.get("empresa_telefono")) || null;
  const empresaEmail = toStringValue(formData.get("empresa_email")) || null;
  const empresaWebsite = toStringValue(formData.get("empresa_website")) || null;
  const monedaPrincipal = toStringValue(formData.get("moneda_principal"));
  const monedaSecundaria = toStringValue(formData.get("moneda_secundaria"));
  const porcentajeComisionDefault = toNumberValue(formData.get("porcentaje_comision_default"));
  const diasAlertaGestoria = toIntegerValue(formData.get("dias_alerta_gestoria"));
  const diasAlertaLeads = toIntegerValue(formData.get("dias_alerta_leads"));
  const whatsappAlertasActivas = toBooleanValue(formData.get("whatsapp_alertas_activas"));
  const catalogoAutoPublicarStock = toBooleanValue(formData.get("catalogo_auto_publicar_stock"));

  if (!empresaNombre) {
    return { error: "El nombre de la empresa es obligatorio." };
  }

  if (!["USD", "ARS"].includes(monedaPrincipal)) {
    return { error: "La moneda principal no es válida." };
  }

  if (!["USD", "ARS"].includes(monedaSecundaria)) {
    return { error: "La moneda secundaria no es válida." };
  }

  if (monedaPrincipal === monedaSecundaria) {
    return { error: "La moneda principal y secundaria no pueden ser iguales." };
  }

  if (porcentajeComisionDefault == null || porcentajeComisionDefault < 0) {
    return { error: "La comisión default debe ser un número válido mayor o igual a 0." };
  }

  if (diasAlertaGestoria == null || diasAlertaGestoria < 0) {
    return { error: "Los días de alerta de gestoría deben ser un entero mayor o igual a 0." };
  }

  if (diasAlertaLeads == null || diasAlertaLeads < 0) {
    return { error: "Los días de alerta de leads deben ser un entero mayor o igual a 0." };
  }

  const { error } = await supabase
    .from("configuracion_general")
    .upsert(
      {
        id: true,
        empresa_nombre: empresaNombre,
        empresa_razon_social: empresaRazonSocial,
        empresa_cuit: empresaCuit,
        empresa_direccion: empresaDireccion,
        empresa_telefono: empresaTelefono,
        empresa_email: empresaEmail,
        empresa_website: empresaWebsite,
        moneda_principal: monedaPrincipal,
        moneda_secundaria: monedaSecundaria,
        porcentaje_comision_default: porcentajeComisionDefault,
        dias_alerta_gestoria: diasAlertaGestoria,
        dias_alerta_leads: diasAlertaLeads,
        whatsapp_alertas_activas: whatsappAlertasActivas,
        catalogo_auto_publicar_stock: catalogoAutoPublicarStock,
      },
      { onConflict: "id" }
    );

  if (error) {
    return { error: "No pudimos guardar la configuración general." };
  }

  revalidatePath("/configuracion");
  return { success: true };
}
