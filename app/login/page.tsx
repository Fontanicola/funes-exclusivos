import type { Metadata } from "next";
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
      return "Falta configuración de Supabase.";
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
      <main className="flex min-h-screen items-center justify-center bg-[#F7F7F5] px-4 text-[#111827]">
        <section className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
          <div className="mb-8">
            <div className="flex justify-center">
              <Image
                src="/logo-funes.svg"
                alt="Funes Exclusivos"
                width={180}
                height={56}
                priority
                className="h-14 w-auto"
              />
            </div>
            <h1 className="mt-6 text-2xl font-semibold">Modo demo activo</h1>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Podés navegar el dashboard con datos mock sin conectar Supabase.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#111827] px-4 text-sm font-medium text-white transition hover:bg-[#1F2937]"
          >
            Entrar al dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F7F5] px-4 text-[#111827]">
      <section className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
        <div className="mb-8">
          <div className="flex justify-center">
            <Image
              src="/logo-funes.svg"
              alt="Funes Exclusivos"
              width={180}
              height={56}
              priority
              className="h-14 w-auto"
            />
          </div>
          <div className="mt-6 text-center">
            <h1 className="text-2xl font-semibold">Ingresar al panel</h1>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Acceso privado para empleados habilitados.
            </p>
          </div>
        </div>

        <LoginForm initialErrorMessage={errorMessage} />
      </section>
    </main>
  );
}
