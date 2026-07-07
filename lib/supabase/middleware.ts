import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabaseEnv } from "./env";

function syncCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie.name, cookie.value, cookie as never);
  });

  return target;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const env = getSupabaseEnv();

  if (!env) {
    throw new Error("Falta configurar Supabase en .env.local.");
  }

  const supabase = createServerClient(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options: Parameters<typeof response.cookies.set>[2];
          }>
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    supabase,
    response,
    user,
    syncCookies,
  };
}
