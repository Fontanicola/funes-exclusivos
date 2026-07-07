import { NextResponse, type NextRequest } from "next/server";
import { isDemoMode } from "./lib/demo-mode";
import { updateSession } from "./lib/supabase/middleware";

const protectedRoutes = [
  "/dashboard",
  "/inventario",
  "/ventas",
  "/caja",
  "/comisiones",
  "/gestoria",
  "/catalogo",
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

  const { response, user, syncCookies } = await updateSession(request);

  if (pathname === "/login" && user) {
    return syncCookies(
      response,
      NextResponse.redirect(new URL("/dashboard", request.url))
    );
  }

  if (isProtectedPath(pathname) && !user) {
    return syncCookies(
      response,
      NextResponse.redirect(new URL("/login", request.url))
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
    "/catalogo/:path*",
    "/crm/:path*",
    "/whatsapp/:path*",
    "/empleados/:path*",
    "/configuracion/:path*",
    "/login",
  ],
};
