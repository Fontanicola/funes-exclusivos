import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

export function createSupabaseServerClient() {
  const env = getSupabaseEnv();

  if (!env) {
    throw new Error("Falta configurar Supabase en .env.local.");
  }

  const cookieStore = cookies();

  return createServerClient(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options: Parameters<typeof cookieStore.set>[2];
          }>
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components can only read cookies; actions and routes can write them.
          }
        },
      },
    }
  );
}
