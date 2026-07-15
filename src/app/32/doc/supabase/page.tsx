import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ALINKS × Supabase integration",
  description:
    "How ALINKS connects tenant BYO Supabase projects for order and booking storage. Partner and technical documentation.",
  /** Unlisted reference — not for marketing SEO */
  robots: { index: false, follow: false },
};

export default function SupabaseDocsPage() {
  return (
    <article className="prose-invert space-y-10 text-[15px] leading-relaxed text-zinc-300">
      <header className="space-y-3 border-b border-white/10 pb-8">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-400/90">
          Integration docs
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          ALINKS + Supabase (BYO)
        </h1>
        <p className="max-w-2xl text-zinc-400">
          Technical overview for connecting a tenant-owned Supabase project to ALINKS for customer
          order and booking storage. ALINKS does not host customer databases.
        </p>
        <p className="font-mono text-[11px] text-zinc-500">
          Reference · partner use · not linked from the marketing site
        </p>
      </header>

      <Section id="overview" title="1. Overview">
        <p>
          <strong className="text-white">ALINKS</strong> is an India-first multi-tenant mini-website
          SaaS (salons, clinics, retail). Platform Postgres stores <em>tenant config only</em>{" "}
          (pages, theme, billing metadata). End-customer PII (orders, bookings, customers) is written
          only to storage the business controls:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-zinc-400">
          <li>
            <strong className="text-zinc-200">Google Sheets</strong> (default)
          </li>
          <li>
            <strong className="text-zinc-200">Supabase (BYO)</strong> — tenant&apos;s own project
          </li>
        </ul>
        <p className="mt-3">
          Supabase integration is <strong className="text-white">bring-your-own</strong>: the business
          creates and pays for their Supabase account. ALINKS stores a connection reference and routes
          writes through a storage adapter. We do <strong className="text-white">not</strong> provision
          or manage customer databases for tenants.
        </p>
      </Section>

      <Section id="architecture" title="2. Architecture">
        <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/50 p-4 font-mono text-[12px] text-zinc-300">
          {`Tenant mini-site / checkout / booking
        │
        ▼
ALINKS app (Vercel) — StorageAdapter
        │
        ├── google_sheets → tenant spreadsheet (platform service account write)
        └── supabase      → tenant project (BYO URL + key ref)
        
Platform Postgres (Neon)
  └── businesses, pages, supabase_connectors (refs only)
  └── no end-customer order/patient rows`}
        </pre>
        <p className="mt-3 text-zinc-400">
          Connector table stores <code className="text-teal-300/90">project_url</code>, an{" "}
          <code className="text-teal-300/90">anon_key_ref</code> (hash reference, not a long-lived
          plaintext dump in logs), and <code className="text-teal-300/90">is_active</code>. Business{" "}
          <code className="text-teal-300/90">storage_backend</code> is set to{" "}
          <code className="text-teal-300/90">supabase</code> when connected.
        </p>
      </Section>

      <Section id="prerequisites" title="3. Prerequisites">
        <ul className="list-disc space-y-2 pl-5 text-zinc-400">
          <li>ALINKS tenant account on Pro/Enterprise where applicable for advanced storage</li>
          <li>
            Supabase project owned by the tenant (
            <a
              className="text-teal-400 underline"
              href="https://supabase.com/dashboard/sign-up"
              target="_blank"
              rel="noreferrer"
            >
              supabase.com
            </a>
            )
          </li>
          <li>Project URL (e.g. <code className="text-zinc-200">https://xyz.supabase.co</code>)</li>
          <li>Anon / publishable key from Supabase Project Settings → API</li>
          <li>Dashboard path: <strong className="text-white">Data → Your own Supabase</strong></li>
        </ul>
      </Section>

      <Section id="connect" title="4. How to connect ALINKS to Supabase">
        <ol className="list-decimal space-y-2 pl-5 text-zinc-400">
          <li>Sign in to ALINKS dashboard (tenant).</li>
          <li>
            Open <strong className="text-white">Data</strong> (
            <code className="text-zinc-200">/dashboard/data</code>).
          </li>
          <li>
            Under <strong className="text-white">C · Your own Supabase</strong>, optionally create a
            Supabase account via the affiliate/signup link.
          </li>
          <li>Paste Project URL and anon key → <strong className="text-white">Connect my Supabase</strong>.</li>
          <li>
            ALINKS validates session ownership of the business, stores connection refs, sets{" "}
            <code className="text-zinc-200">storage_backend = supabase</code>.
          </li>
          <li>
            Subsequent order/booking writes use the Supabase storage path for that business (same
            application code path as Sheets via <code className="text-zinc-200">StorageAdapter</code>
            ).
          </li>
        </ol>
      </Section>

      <Section id="env" title="5. Environment variables (platform)">
        <p className="text-zinc-400">
          Platform deployment (Vercel) does <strong className="text-white">not</strong> require
          Supabase env vars for BYO. Tenant credentials are entered in the dashboard and stored as
          connection references.
        </p>
        <p className="mt-3 text-zinc-400">Relevant platform vars (non-exhaustive):</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 font-mono text-[12px] text-zinc-400">
          <li>DATABASE_URL — platform Neon Postgres</li>
          <li>GOOGLE_SERVICE_ACCOUNT_JSON — Sheets backend only</li>
          <li>NEXT_PUBLIC_SUPABASE_AFFILIATE_URL — optional signup/affiliate link</li>
          <li>PAYMENTS_ENCRYPTION_KEY — tenant Razorpay secrets (payments, not Supabase)</li>
        </ul>
      </Section>

      <Section id="auth" title="6. Authentication">
        <ul className="list-disc space-y-2 pl-5 text-zinc-400">
          <li>
            <strong className="text-white">Tenant dashboard:</strong> ALINKS session (phone/email OTP).
            Only the business owner can attach a Supabase connector.
          </li>
          <li>
            <strong className="text-white">Supabase:</strong> Tenant uses their project anon key for
            client-side patterns as they configure; ALINKS server stores a key reference after connect.
          </li>
          <li>
            <strong className="text-white">End customers:</strong> No Supabase Auth required for
            ALINKS mini-site checkout; they use the public site + shop Razorpay/COD.
          </li>
        </ul>
      </Section>

      <Section id="schema" title="7. Data / schema expectations">
        <p className="text-zinc-400">
          Logical tabs used by ALINKS storage adapters (also used with Google Sheets):
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 font-mono text-[12px] text-zinc-400">
          <li>Orders</li>
          <li>Appointments / bookings</li>
          <li>Customers (as used by the product)</li>
          <li>Other standard tabs defined in the StorageAdapter layer</li>
        </ul>
        <p className="mt-3 text-zinc-400">
          BYO Supabase mode is designed so the same write interface appends structured rows. Full
          production PostgREST table DDL for every vertical may evolve; integrators should treat the
          adapter contract as the source of write shape (JSON row maps), not a fixed public SQL dump.
        </p>
      </Section>

      <Section id="features" title="8. Realtime, Storage, Edge Functions">
        <ul className="list-disc space-y-2 pl-5 text-zinc-400">
          <li>
            <strong className="text-white">Realtime:</strong> Not required for ALINKS MVP order
            writes. Tenants may enable Realtime on their project independently.
          </li>
          <li>
            <strong className="text-white">Storage (files):</strong> ALINKS media uploads use platform
            media pipeline (e.g. Vercel Blob / local); not Supabase Storage by default.
          </li>
          <li>
            <strong className="text-white">Edge Functions:</strong> Not used by ALINKS core for
            tenant order writes. Tenants may add their own functions in their project.
          </li>
        </ul>
      </Section>

      <Section id="security" title="9. Security & data ownership">
        <ul className="list-disc space-y-2 pl-5 text-zinc-400">
          <li>Artix does not store end-customer order/patient PII in platform Postgres.</li>
          <li>Tenant is data controller for customer data in Sheets/Supabase.</li>
          <li>Connect action requires authenticated business ownership checks.</li>
          <li>ALINKS does not offer “managed customer DB” hosting for tenants.</li>
        </ul>
      </Section>

      <Section id="troubleshooting" title="10. Troubleshooting">
        <ul className="list-disc space-y-2 pl-5 text-zinc-400">
          <li>
            <strong className="text-white">Connect fails / unauthorized:</strong> Sign in again; only
            the business owner can connect.
          </li>
          <li>
            <strong className="text-white">Wrong project:</strong> Disconnect and reconnect with the
            correct URL/key from Supabase → Settings → API.
          </li>
          <li>
            <strong className="text-white">Still on Sheets:</strong> Confirm active backend on Data
            page shows Supabase after connect; ensure connector is active.
          </li>
          <li>
            <strong className="text-white">Support:</strong> Platform status via ALINKS dashboard;
            Supabase project billing/support via supabase.com.
          </li>
        </ul>
      </Section>

      <Section id="links" title="11. Product links">
        <ul className="list-disc space-y-1 pl-5 text-zinc-400">
          <li>
            Product:{" "}
            <Link href="https://alinks.online" className="text-teal-400 underline">
              https://alinks.online
            </Link>
          </li>
          <li>
            Tenant Data hub:{" "}
            <code className="text-zinc-200">/dashboard/data</code> (authenticated)
          </li>
          <li>
            This document:{" "}
            <code className="text-zinc-200">/32/doc/supabase</code>
          </li>
        </ul>
      </Section>
    </article>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 space-y-3">
      <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
