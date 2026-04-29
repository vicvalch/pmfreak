import Link from "next/link";

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black px-6 py-16 text-white">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
          ScopeGuard AI
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          We sent a confirmation link to{" "}
          <span className="font-semibold text-white">
            {params.email ?? "your inbox"}
          </span>
          . Confirm your email, then sign in.
        </p>
        <p className="mt-4 text-xs text-slate-400">
          Tip: check spam/promotions folders if the message is delayed.
        </p>

        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex rounded-xl bg-cyan-300/90 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            Go to login
          </Link>
        </div>
      </section>
    </main>
  );
}
