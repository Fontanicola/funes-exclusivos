"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/demo-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
  success?: string;
};

function toOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

async function getCurrentEmployee(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tu sesión expiró. Volvé a iniciar sesión." as const };

  const { data: employee } = await supabase
    .from("empleados")
    .select("id,rol,activo")
    .eq("id", user.id)
    .maybeSingle<{ id: string; rol: string | null; activo: boolean | null }>();

  if (!employee || employee.activo !== true) {
    return { error: "No tenés permisos para editar entregas." as const };
  }

  if (!["admin", "gestor"].includes(employee.rol ?? "")) {
    return { error: "No tenés permisos para editar entregas." as const };
  }

  return { user, employee };
}

export async function updateVentaEntregaAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode) {
    return { error: "Modo demo activo: conectá Supabase para guardar entregas reales." };
  }

  const supabase = createSupabaseServerClient();
  const authResult = await getCurrentEmployee(supabase);
  if ("error" in authResult) {
    return { error: authResult.error };
  }

  const id = toOptionalString(formData.get("id"));
  const estado = toOptionalString(formData.get("estado")).toLowerCase();
  const fechaEntrega = toOptionalString(formData.get("fecha_entrega")) || null;
  const statusInformeVu = toOptionalString(formData.get("status_informe_vu")) || null;
  const usadoCredito = toOptionalString(formData.get("usado_credito")) || null;
  const usadoInformeDominio = toOptionalString(formData.get("usado_informe_dominio")) || null;
  const usadoMultas = toOptionalString(formData.get("usado_multas")) || null;
  const usadoPatentes = toOptionalString(formData.get("usado_patentes")) || null;
  const usadoObservaciones = toOptionalString(formData.get("usado_observaciones")) || null;
  const observaciones = toOptionalString(formData.get("observaciones")) || null;

  if (!id) return { error: "Falta el identificador de la entrega." };
  if (
    ![
      "pendiente",
      "en_proceso",
      "lista_para_entregar",
      "entregada",
      "observada",
      "cancelada",
    ].includes(estado)
  ) {
    return { error: "El estado de entrega no es válido." };
  }

  const { error } = await supabase
    .from("ventas_entregas")
    .update({
      estado,
      fecha_entrega: fechaEntrega,
      status_informe_vu: statusInformeVu,
      usado_credito: usadoCredito,
      usado_informe_dominio: usadoInformeDominio,
      usado_multas: usadoMultas,
      usado_patentes: usadoPatentes,
      usado_observaciones: usadoObservaciones,
      observaciones,
      updated_by: authResult.user.id,
    })
    .eq("id", id);

  if (error) {
    return { error: "No pudimos actualizar la entrega. Revisá los datos e intentá de nuevo." };
  }

  revalidatePath("/ventas");
  revalidatePath("/ventas/pendientes-entrega");

  return { success: "Entrega actualizada correctamente." };
}
