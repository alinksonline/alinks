import Link from "next/link";
import { PageShell } from "@/components/shared/page-shell";
import { getSuperadminOverview } from "@/platform/admin/get-overview";
import { getEnv } from "@/core/config/env";

export default async function SuperadminSystemPage() {
  const overview = await getSuperadminOverview();
  const env = getEnv();

  return (
    <PageShell maxWidth="xl" className="py-10">
      <h1 className="text-3xl font-bold">System</h1>
      <p className="mt-2 text-slate-400">Health, queues, and environment flags.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="font-semibold">API health</h2>
          <Link href="/api/health" className="mt-2 block text-sm text-sky-400 underline" target="_blank">
            GET /api/health
          </Link>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="font-semibold">Write queue processor</h2>
          <p className="mt-2 text-sm text-slate-400">{overview?.writeQueueCount ?? 0} items pending</p>
          <form action="/api/storage/process-queue" method="POST" className="mt-3">
            <button type="submit" className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold hover:bg-slate-600">
              Process queue now
            </button>
          </form>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:col-span-2">
          <h2 className="font-semibold">Environment (non-secret)</h2>
          <ul className="mt-3 space-y-1 font-mono text-xs text-slate-400">
            <li>NODE_ENV: {env.NODE_ENV}</li>
            <li>DATABASE_URL: {env.DATABASE_URL ? "set" : "missing"}</li>
            <li>RAZORPAY_KEY_ID: {env.RAZORPAY_KEY_ID ? "set" : "dev mode"}</li>
            <li>OPENROUTER_API_KEY: {env.OPENROUTER_API_KEY ? "set" : "mock AI"}</li>
            <li>UPSTASH_REDIS: {env.UPSTASH_REDIS_REST_URL ? "set" : "in-memory fallback"}</li>
            <li>STORAGE_DEV_MODE: {env.STORAGE_DEV_MODE ?? "auto"}</li>
          </ul>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Vertical distribution</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {overview &&
            Object.entries(overview.verticalCounts).map(([v, n]) => (
              <span key={v} className="rounded-full bg-slate-800 px-3 py-1">
                {v}: {n}
              </span>
            ))}
        </div>
      </section>
    </PageShell>
  );
}