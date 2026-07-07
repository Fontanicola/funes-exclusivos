import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

export function createSupabaseBrowserClient() {
  const env = getSupabaseEnv();

  if (!env) {
    throw new Error("Falta configurar Supabase en .env.local.");
  }

  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
