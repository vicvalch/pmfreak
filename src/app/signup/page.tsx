import Link from "next/link";
import { signupAction } from "./actions";
import AuthSubmitButton from "@/components/auth-submit-button";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black px-6 py-16 text-white">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
          PMFreak AI
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Create your workspace
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Set up your company tenant and role access.
        </p>

        {params.error ? (
          <p className="mt-4 text-sm text-rose-200">{params.error}</p>
        ) : null}

        <form action={signupAction} className="mt-8 space-y-4">
          <input
            name="fullName"
            placeholder="Full name"
            required
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:ring focus:ring-cyan-300/60"
          />

          <input
            name="companyName"
            placeholder="Company name"
            required
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:ring focus:ring-cyan-300/60"
          />

          <select
            name="role"
            defaultValue="admin"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:ring focus:ring-cyan-300/60"
          >
            <option value="admin">admin</option>
            <option value="pm">pm</option>
            <option value="viewer">viewer</option>
          </select>

          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:ring focus:ring-cyan-300/60"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            minLength={8}
            required
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:ring focus:ring-cyan-300/60"
          />

          <AuthSubmitButton
            idleLabel="Sign up"
            pendingLabel="Creating account..."
          />
        </form>

        <p className="mt-6 text-sm text-slate-300">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-cyan-200 hover:text-cyan-100"
          >
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
