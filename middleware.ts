import { NextResponse, type NextRequest } from "next/server";
import { isDemoMode } from "./lib/demo-mode";
import { canAccessRoute } from "./lib/auth/permissions";
import { updateSession } from "./lib/supabase/middleware";

const protectedRoutes = [
  "/dashboard",
  "/inventario",
  "/ventas",
  "/caja",
  "/comisiones",
  "/gestoria",
  "/dashboard/catalogo",
  "/crm",
  "/whatsapp",
  "/empleados",
  "/configuracion",
];

function isProtectedPath(pathname: string) {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isDemoMode) {
    if (pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!hasSupabaseConfig) {
    if (isProtectedPath(pathname)) {
      return NextResponse.redirect(new URL("/login?error=config", request.url));
    }

    return NextResponse.next();
  }

  const { response, user, supabase, syncCookies } = await updateSession(request);

  if (!user) {
    if (isProtectedPath(pathname)) {
      return syncCookies(
        response,
        NextResponse.redirect(new URL("/login", request.url))
      );
    }

    return response;
  }

  const { data: employee } = await supabase
    .from("empleados")
    .select("id,rol,activo")
    .eq("id", user.id)
    .maybeSingle<{ id: string; rol: string | null; activo: boolean | null }>();

  if (!employee || employee.activo !== true) {
    if (isProtectedPath(pathname)) {
      return syncCookies(
        response,
        NextResponse.redirect(new URL("/login?error=inactive", request.url))
      );
    }

    return response;
  }

  if (pathname === "/login" && user) {
    return syncCookies(
      response,
      NextResponse.redirect(new URL("/dashboard", request.url))
    );
  }

  if (pathname !== "/login" && !canAccessRoute(employee.rol, pathname)) {
    return syncCookies(
      response,
      NextResponse.redirect(new URL("/dashboard", request.url))
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inventario/:path*",
    "/ventas/:path*",
    "/caja/:path*",
    "/comisiones/:path*",
    "/gestoria/:path*",
    "/dashboard/catalogo/:path*",
    "/crm/:path*",
    "/whatsapp/:path*",
    "/empleados/:path*",
    "/configuracion/:path*",
    "/login",
  ],
};
