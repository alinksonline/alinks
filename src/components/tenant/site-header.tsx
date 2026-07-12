import type { Business } from "@/core/types/tenant";
import type { BusinessProfile } from "@/core/types/business-profile";
import { parseBusinessProfile } from "@/core/types/business-profile";
import { whatsappUrl } from "@/core/utils/business-profile";

export function SiteHeader({
  business,
  profile: profileProp,
}: {
  business: Business;
  profile?: BusinessProfile | Record<string, unknown> | null;
}) {
  const profile =
    profileProp && "businessName" in (profileProp as object)
      ? parseBusinessProfile(profileProp, business.name)
      : business.profile ?? parseBusinessProfile(profileProp, business.name);

  const wa = profile.whatsapp || profile.phone;
  const displayName = profile.businessName || business.name;

  return (
    <header className="sticky top-0 z-40 border-b border-brand-ink/[0.06] bg-brand-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-app items-center justify-between gap-2 px-3">
        <div className="flex min-w-0 items-center gap-2">
          {profile.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.logoUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
          ) : null}
          <span className="truncate font-display text-base font-bold text-brand-ink">{displayName}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {wa ? (
            <a
              href={whatsappUrl(wa)}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#25D366] px-2.5 py-1.5 text-[10px] font-bold text-white"
            >
              WhatsApp
            </a>
          ) : (
            <span className="rounded-full bg-brand-purple/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-brand-purple">
              {business.vertical}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
