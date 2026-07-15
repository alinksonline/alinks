"use client";

import { SettingsSection } from "@/components/platform/settings-section";
import { DataSupabaseByoForm } from "./data-supabase-byo-form";

const SUPABASE_AFFILIATE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_AFFILIATE_URL?.trim() || "https://supabase.com/dashboard/sign-up";

/**
 * C · Your own Supabase + stance: ALINKS never hosts customer DB.
 */
export function SupabaseDataSection({
  businessId,
  projectUrl,
  connected,
  storageBackend,
}: {
  businessId: string;
  projectUrl: string;
  connected: boolean;
  storageBackend: string;
}) {
  return (
    <SettingsSection
      step="C · Your own Supabase"
      title="Your own Supabase"
      description="Optional database for orders if you’ve outgrown Sheets. You own the project and pay Supabase — not ALINKS."
    >
      <div className="rounded-xl border border-brand-ink/10 bg-brand-mist/40 px-3 py-2.5 text-[12px] leading-relaxed text-brand-muted">
        <p className="font-semibold text-brand-ink">We don’t host your customer database</p>
        <p className="mt-1">
          ALINKS is website software only. Customer order data stays in <strong>your</strong> Sheet or{" "}
          <strong>your</strong> Supabase. We will not run a managed database of your clients for you.
        </p>
      </div>

      <a
        href={SUPABASE_AFFILIATE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded-full border border-brand-ink/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-brand-ink transition hover:bg-brand-mist dark:bg-white/5"
      >
        Create a free Supabase account →
      </a>
      <p className="text-[10px] text-brand-muted">
        Affiliate / partner signup when configured. After you have a project, connect it below.
      </p>

      <div className="border-t border-brand-ink/10 pt-3">
        <p className="mb-2 text-[11px] font-semibold text-brand-ink">Connect project</p>
        <DataSupabaseByoForm
          businessId={businessId}
          projectUrl={projectUrl}
          connected={connected}
          storageBackend={storageBackend}
        />
      </div>
    </SettingsSection>
  );
}
