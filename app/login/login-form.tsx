"use client";

import { useFormState, useFormStatus } from "react-dom";
import { login } from "./actions";

type ActionState = {
  error?: string;
};

const initialState: ActionState = {
  error: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#111827] px-4 text-sm font-medium text-white transition hover:bg-[#1F2937] disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "Ingresando..." : "Entrar"}
    </button>
  );
}

export function LoginForm({ initialErrorMessage }: { initialErrorMessage?: string | null }) {
  const [state, formAction] = useFormState(login, {
    ...initialState,
    error: initialErrorMessage ?? undefined,
  });

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-sm text-[#111827]">
          {state.error}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-[#111827]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#9CA3AF] focus:ring-2 focus:ring-[#E5E7EB]"
          placeholder="tu@email.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-[#111827]">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#9CA3AF] focus:ring-2 focus:ring-[#E5E7EB]"
          placeholder="••••••••"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
