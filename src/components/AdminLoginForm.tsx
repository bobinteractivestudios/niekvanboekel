"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/beheer/actions";

const initialState: LoginState = {};

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <h1 className="font-serif text-2xl text-foreground">Beheer</h1>
      <p className="mt-2 text-sm text-muted">
        Log in om gedeelde herinneringen te bekijken en goed te keuren.
      </p>
      <form action={formAction} className="mt-8 space-y-4">
        <input
          type="password"
          name="password"
          placeholder="Wachtwoord"
          autoFocus
          className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent"
        />
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {isPending ? "Bezig..." : "Inloggen"}
        </button>
      </form>
    </div>
  );
}
