"use client";

import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth.client";
import { useState } from "react";

import { Container } from "@/components/ui/container";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/admin");
      router.refresh();
    }

    setPending(false);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-5 py-12">
      <Container className="w-full max-w-sm">
        <div className="rounded-2xl border border-line bg-surface p-7 shadow-sm">
          <div className="mb-7 text-center">
            <p className="eyebrow">Admin</p>
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">
              Sign in
            </h1>
          </div>

          <form action={handleSubmit} className="grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium text-ink-soft">
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="h-11 rounded-xl border border-line bg-paper/50 px-3.5 text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-primary"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-ink-soft">
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="h-11 rounded-xl border border-line bg-paper/50 px-3.5 text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-primary"
              />
            </label>

            {error && (
              <p
                className="rounded-lg border border-danger/30 bg-danger/5 px-3.5 py-2.5 text-sm text-danger"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-1 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-surface transition-colors hover:bg-primary-deep disabled:opacity-60"
            >
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </Container>
    </main>
  );
}