import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-[#FAFAF8] text-[#0F172A]">
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-800 bg-emerald-100 rounded-full">
          <span>●</span> SubGuard MVP
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
          SubGuard
        </h1>
        <p className="text-lg text-slate-600">
          AI-powered subscription intelligence and management platform.
          Detect, track, understand, and optimize recurring expenses with precision.
        </p>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Note: This hackathon demonstration utilizes supported PayPal Developer
          Sandbox workflows and safe demo datasets. Live payment credentials are never collected.
        </p>
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition shadow-sm"
          >
            Get Started
          </Link>
          <a
            href="/api/health"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Check Health
          </a>
        </div>
      </div>
    </main>
  );
}
