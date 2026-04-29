"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage("Check your email for a password reset link.");
        setEmail("");
      }
    } catch {
      setErrorMessage("Unable to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black px-6 py-16 text-white">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">ScopeGuard AI</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Forgot password</h1>
        <p className="mt-2 text-sm text-slate-300">Enter your email to receive a password reset link.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:ring focus:ring-cyan-300/60"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-cyan-300/90 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        {successMessage ? <p className="mt-4 text-sm text-emerald-200">{successMessage}</p> : null}
        {errorMessage ? <p className="mt-4 text-sm text-rose-200">{errorMessage}</p> : null}

        <p className="mt-6 text-sm text-slate-300">
          Back to{" "}
          <Link href="/login" className="font-semibold text-cyan-200 hover:text-cyan-100">
            login
          </Link>
        </p>
      </section>
    </main>
  );
}
