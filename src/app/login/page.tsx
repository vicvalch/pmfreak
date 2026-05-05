"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { AuthShell } from "@/components/auth/auth-shell";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env";

export default function LoginPage() {
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const success = params.get("success");

    if (error) setMessage({ type: "error", text: error });
    if (success) setMessage({ type: "success", text: success });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!hasSupabaseEnv) {
      setMessage({ type: "error", text: "Configure Supabase environment variables" });
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setMessage({ type: "error", text: "Email and password are required" });
      return;
    }

    setIsSubmitting(true);

    const { url, anonKey } = getSupabaseEnv();
    const supabase = createBrowserClient(url, anonKey);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage({ type: "error", text: error.message });
      setIsSubmitting(false);
      return;
    }

    window.location.href = "/projects";
  };

  return (
    <AuthShell title="Welcome back" subtitle="Continue fixing your execution.">
      {message ? (
        <p className={`mb-4 text-sm ${message.type === "error" ? "text-red-600" : "text-green-700"}`}>
          {message.text}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="email" type="email" placeholder="Email" required className="w-full rounded-xl border-2 border-black px-4 py-3 text-sm" />
        <input name="password" type="password" placeholder="Password" required className="w-full rounded-xl border-2 border-black px-4 py-3 text-sm" />

        <button type="submit" disabled={isSubmitting} className="w-full rounded-xl border-2 border-black bg-pink-500 px-4 py-3 text-sm font-black text-white shadow-[4px_4px_0_#161616] disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-4 text-sm">
        <Link href="/forgot-password" className="font-bold">Forgot password?</Link>
      </p>

      <p className="mt-6 text-sm">
        No account? <Link href="/signup" className="font-bold">Create one</Link>
      </p>
    </AuthShell>
  );
}
