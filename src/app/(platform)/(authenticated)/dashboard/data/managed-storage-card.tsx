import { SettingsSection } from "@/components/platform/settings-section";

const SUPABASE_AFFILIATE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_AFFILIATE_URL?.trim() || "https://supabase.com/dashboard/sign-up";

/**
 * ALINKS does NOT host or manage tenant customer databases.
 * Tenants use Google Sheets or their own Supabase (affiliate signup).
 */
export function ManagedStorageCard() {
  return (
    <SettingsSection
      step="C · Our stance"
      title="We don’t host your customer database"
      description="Orders and bookings always live in storage you control. That keeps ALINKS simple and keeps your client data under your account — not ours."
    >
      <ul className="space-y-1.5 text-[12px] leading-relaxed text-brand-muted">
        <li>
          · <strong className="text-brand-ink">Google Sheets</strong> — default, free, easy
        </li>
        <li>
          · <strong className="text-brand-ink">Your own Supabase</strong> — you sign up, you pay
          Supabase, you connect the project above
        </li>
        <li>
          · <strong className="text-brand-ink">No “ALINKS-managed DB”</strong> — we won’t run or
          support a database of your customers on our side
        </li>
      </ul>

      <a
        href={SUPABASE_AFFILIATE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded-full border border-brand-ink/15 bg-brand-mist/60 px-4 py-2.5 text-sm font-semibold text-brand-ink transition hover:bg-brand-mist"
      >
        Create a free Supabase account →
      </a>
      <p className="text-[10px] leading-relaxed text-brand-muted">
        Opens Supabase in a new tab. After your project exists, paste the URL and key under “Your own
        Supabase” above.
      </p>
    </SettingsSection>
  );
}
