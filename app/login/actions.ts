"use server";

import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
};

function mapSupabaseAuthError(message?: string | null) {
  if (!message) {
    return "No pudimos iniciar sesión.";
  }

  if (isConfigError(message)) {
    return "Falta configurar Supabase en .env.local.";
  }

  if (message.includes("Email not confirmed")) {
    return "El email todavía no está confirmado en Supabase Auth.";
  }

  if (message.includes("Invalid login credentials")) {
    return "Credenciales inválidas. Revisá email y contraseña.";
  }

  return message;
}

function isConfigError(message?: string | null) {
  if (!message) return false;

  const normalized = message.toLowerCase();
  return (
    normalized.includes("invalid url") ||
    normalized.includes("missing") ||
    normalized.includes("fetch") ||
    normalized.includes("supabase") ||
    normalized.includes("configuration")
  );
}

export async function login(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Completá tu email y contraseña." };
  }

  if (!hasSupabaseEnv()) {
    return { error: "Falta configurar Supabase en .env.local." };
  }

  let supabase;

  try {
    supabase = createSupabaseServerClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : null;
    return {
      error: isConfigError(message)
        ? "Falta configurar Supabase en .env.local."
        : message ?? "No pudimos iniciar sesión.",
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase Auth login error", {
        message: error.message,
        status: error.status,
        code: (error as { code?: string | number | undefined }).code,
      });

      return { error: mapSupabaseAuthError(error.message) };
    }

    const user = data.user;

    if (!user) {
      return { error: "No pudimos validar el usuario autenticado." };
    }

    const { data: employee, error: employeeError } = await supabase
      .from("empleados")
      .select("id, activo")
      .eq("id", user.id)
      .maybeSingle<{ id: string; activo: boolean | null }>();

    if (employeeError) {
      console.error("Supabase empleados lookup error", {
        message: employeeError.message,
        status: (employeeError as { status?: number }).status,
        code: (employeeError as { code?: string | number | undefined }).code,
      });

      return { error: employeeError.message };
    }

    if (!employee) {
      await supabase.auth.signOut();
      return { error: "El usuario existe en Auth pero no tiene perfil en empleados." };
    }

    if (employee.activo === false) {
      await supabase.auth.signOut();
      return { error: "El usuario está inactivo." };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : null;
    console.error("Login action unexpected error", message);

    return {
      error: isConfigError(message)
        ? "Falta configurar Supabase en .env.local."
        : message ?? "No pudimos iniciar sesión.",
    };
  }

  redirect("/dashboard");
}
