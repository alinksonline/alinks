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
  const isSalon = business.vertical === "salon" || business.vertical === "beauty";

  return (
    <header className="t-header sticky top-0 z-40">
      <div className="mx-auto flex h-14 w-full max-w-app items-center justify-between gap-2 px-3.5">
        <Link href={`/${business.handle}`} className="flex min-w-0 items-center gap-2.5">
          {profile.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.logoUrl}
              alt=""
              className="h-9 w-9 shrink-0 rounded-2xl object-cover ring-1 ring-[var(--t-border)]"
            />
          ) : (
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-[var(--t-on-primary)] shadow-sm"
              style={{ backgroundColor: "var(--t-primary)" }}
            >
              {displayName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="min-w-0">
            <span className="t-ink block truncate text-sm font-bold tracking-tight">{displayName}</span>
            <span className="t-muted block truncate text-[10px] font-medium uppercase tracking-wider">
              {business.vertical}
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          {isSalon ? (
            <Link
              href={`/${business.handle}/book`}
              className="rounded-full px-3 py-1.5 text-[11px] font-bold text-[var(--t-on-primary)]"
              style={{ backgroundColor: "var(--t-primary)" }}
            >
              Book
            </Link>
          ) : null}
          {wa ? (
            <a
              href={whatsappUrl(wa)}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#25D366] px-3 py-1.5 text-[11px] font-bold text-white shadow-sm"
            >
              Chat
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
