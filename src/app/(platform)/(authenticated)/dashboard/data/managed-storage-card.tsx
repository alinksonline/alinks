import Link from "next/link";
import { SettingsSection } from "@/components/platform/settings-section";

/**
 * ALINKS-managed Supabase: Artix pays Supabase, bills tenant cost + margin.
 * Pricing TBD from real overheads — UI states the model clearly.
 */
export function ManagedStorageCard() {
  return (
    <SettingsSection
      step="C · With ALINKS"
      title="Managed database (Supabase)"
      description="We provision and operate a Supabase project for your business. You pay ALINKS a monthly storage add-on (our Supabase cost + a small margin). You still own the data policy for your customers."
    >
      <ul className="space-y-1.5 text-[12px] leading-relaxed text-brand-muted">
        <li>
          · <strong className="text-brand-ink">You don&apos;t</strong> manage keys or dashboards if you
          don&apos;t want to
        </li>
        <li>
          · <strong className="text-brand-ink">We</strong> pay Supabase;{" "}
          <strong className="text-brand-ink">you</strong> pay ALINKS the add-on
        </li>
        <li>
          · Price = Supabase overheads for your tier + margin (published under Billing when live)
        </li>
        <li>· Not the same as ALINKS plan — this is only customer-order storage</li>
      </ul>

      <div className="rounded-xl border border-brand-ink/10 bg-brand-mist/50 px-3 py-3 text-[12px] text-brand-ink">
        <p className="font-bold">Coming soon</p>
        <p className="mt-1 text-brand-muted">
          Provisioning and add-on billing are not open yet. Use Google Sheets (free) or BYO Supabase
          today. When managed storage launches, you&apos;ll enable it here and see the fee on{" "}
          <Link href="/billing" className="font-semibold text-brand-purple underline">
            Billing
          </Link>
          .
        </p>
      </div>
    </SettingsSection>
  );
}
