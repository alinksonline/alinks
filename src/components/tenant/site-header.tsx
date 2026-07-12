import type { Business } from "@/core/types/tenant";
import type { BusinessProfile } from "@/core/types/business-profile";
import { parseBusinessProfile } from "@/core/types/business-profile";
import { whatsappUrl } from "@/core/utils/business-profile";
import Link from "next/link";

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
    <header className="t-header sticky top-0 z-40">
      <div className="mx-auto flex h-12 w-full max-w-app items-center justify-between gap-2 px-3">
        <Link href={`/${business.handle}`} className="flex min-w-0 items-center gap-2">
          {profile.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.logoUrl}
              alt=""
              className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-[var(--t-border)]"
            />
          ) : (
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-[var(--t-on-primary)]"
              style={{ backgroundColor: "var(--t-primary)" }}
            >
              {displayName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="t-ink truncate text-sm font-bold tracking-tight">{displayName}</span>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5">
          {wa ? (
            <a
              href={whatsappUrl(wa)}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#25D366] px-2.5 py-1 text-[10px] font-bold text-white"
            >
              WhatsApp
            </a>
          ) : (
            <span
              className="rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide"
              style={{
                backgroundColor: "var(--t-primary-soft)",
                color: "var(--t-primary)",
              }}
            >
              {business.vertical}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
