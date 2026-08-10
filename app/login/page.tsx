import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { isDemoMode } from "@/lib/demo-mode";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Ingresar | Funes Exclusivos",
};

function getErrorMessage(error?: string | string[]) {
  const value = Array.isArray(error) ? error[0] : error;

  switch (value) {
    case "missing_credentials":
      return "Completá tu email y contraseña.";
    case "invalid_credentials":
      return "Credenciales inválidas. Revisá email y contraseña.";
    case "inactive":
      return "Usuario inactivo o sin perfil operativo.";
    case "config":
      return "Falta configurar el entorno.";
    default:
      return null;
  }
}

export default function LoginPage({
  searchParams,
}: {
  searchParams?: {
    error?: string | string[];
  };
}) {
  const errorMessage = getErrorMessage(searchParams?.error);

  if (isDemoMode) {
    return (
      <LoginLayout>
        <div className="w-full max-w-md">
          <LoginBrand />
          <div className="mt-10">
            <p className="text-sm leading-6 text-[#6B7280]">
              Podés navegar el dashboard con datos simulados sin conectar una cuenta real.
            </p>

            <Link
              href="/dashboard"
              className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-md bg-[#8A1538] px-4 text-sm font-medium text-white transition hover:bg-[#6F102D]"
            >
              Entrar al dashboard
            </Link>
          </div>

          <PoweredByBlyndtek />
        </div>
      </LoginLayout>
    );
  }

  return (
    <LoginLayout>
      <div className="w-full max-w-md">
        <LoginBrand />
        <p className="mt-10 text-sm leading-6 text-[#6B7280]">
          Accedé a la plataforma con tu usuario de Funes Exclusivos
        </p>

        <div className="mt-8">
          <LoginForm initialErrorMessage={errorMessage} />
        </div>

        <PoweredByBlyndtek />
      </div>
    </LoginLayout>
  );
}

function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative isolate grid min-h-screen overflow-hidden bg-white text-[#111827] lg:grid-cols-[minmax(0,1.1fr)_minmax(440px,0.9fr)]">
      <Image
        src="/login-hero-porsche.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 scale-105 object-cover opacity-45 blur-sm"
      />
      <div className="absolute inset-0 -z-10 bg-white/35" />
      <LoginHero />
      <section className="flex min-h-screen items-center justify-center bg-white/78 px-6 py-10 backdrop-blur-md lg:px-12">
        {children}
      </section>
    </main>
  );
}

function LoginHero() {
  return (
    <aside className="relative hidden min-h-screen overflow-hidden lg:block">
      <Image
        src="/login-hero-porsche.png"
        alt="Porsche clásico rojo en una avenida arbolada"
        fill
        priority
        sizes="55vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/75 via-[#111827]/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-12 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">
          Funes Exclusivos
        </p>
        <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight">
          Gestión premium para una operación comercial precisa.
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-6 text-white/75">
          Stock, ventas, caja y seguimiento reunidos en una plataforma interna clara y rápida.
        </p>
      </div>
    </aside>
  );
}

function LoginBrand() {
  return (
    <div>
      <Image
        src="/logo-funes.svg"
        alt="Funes Exclusivos"
        width={180}
        height={56}
        priority
        className="h-14 w-auto"
      />
    </div>
  );
}

function PoweredByBlyndtek() {
  return (
    <a
      href="https://blyndtek.com"
      target="_blank"
      rel="noopener noreferrer"
      className="mt-10 inline-flex items-center gap-2 text-xs text-[#6B7280] opacity-70 transition hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#D8A1B2] focus:ring-offset-2"
      aria-label="Powered by Blyndtek"
    >
      <span>Powered by</span>
      <Image
        src="/blyndtek-logo-text.svg"
        alt="Blyndtek"
        width={92}
        height={20}
        className="h-4 w-auto"
      />
    </a>
  );
}
