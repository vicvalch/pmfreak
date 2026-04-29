"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.replace("/login?success=Password+updated.+Please+sign+in.");
    } catch {
      setErrorMessage("Unable to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black px-6 py-16 text-white">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">ScopeGuard AI</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Reset password</h1>
        <p className="mt-2 text-sm text-slate-300">Set a new password for your account.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="password"
            placeholder="New password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:ring focus:ring-cyan-300/60"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:ring focus:ring-cyan-300/60"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-cyan-300/90 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>

        {errorMessage ? <p className="mt-4 text-sm text-rose-200">{errorMessage}</p> : null}
      </section>
    </main>
  );
}
