import type { Business } from "@/core/types/tenant";
import type { BusinessProfile } from "@/core/types/business-profile";
import { parseBusinessProfile } from "@/core/types/business-profile";
import { listSocialLinks, telUrl, whatsappUrl } from "@/core/utils/business-profile";
import Link from "next/link";

export function TenantFooter({
  business,
  showAlinksBranding = true,
  profile: profileProp,
}: {
  business: Business;
  showAlinksBranding?: boolean;
  profile?: BusinessProfile | Record<string, unknown> | null;
}) {
  const profile = business.profile ?? parseBusinessProfile(profileProp, business.name);
  const socials = listSocialLinks(profile);
  const wa = profile.whatsapp || profile.phone;
  const name = profile.businessName || business.name;

  return (
    <footer className="t-footer px-4 pb-4 pt-8 text-center text-xs">
      <p className="t-ink text-base font-bold tracking-tight">{name}</p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {profile.phone ? (
          <a href={telUrl(profile.phone)} className="t-chip no-underline">
            Call
          </a>
        ) : null}
        {wa ? (
          <a
            href={whatsappUrl(wa)}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[#25D366] px-3 py-1.5 text-[11px] font-bold text-white no-underline"
          >
            WhatsApp
          </a>
        ) : null}
        {profile.email ? (
          <a href={`mailto:${profile.email}`} className="t-chip no-underline">
            Email
          </a>
        ) : null}
      </div>

      {profile.address ? (
        <p className="t-muted mx-auto mt-3 max-w-xs text-[11px] leading-relaxed">{profile.address}</p>
      ) : null}

      {socials.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {socials.map((s) => (
            <a
              key={s.network}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="t-chip no-underline"
            >
              {s.label}
            </a>
          ))}
        </div>
      )}

      <div className="mx-auto mt-6 max-w-sm space-y-2 border-t border-[var(--t-border)] pt-4">
        <p className="t-muted text-[10px] leading-relaxed">
          Operated independently by <strong className="t-ink">{name}</strong>. Artix provides software only.
        </p>
        <p className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href={`/${business.handle}/legal`}
            className="t-link text-[12px] font-bold no-underline"
          >
            Terms & Privacy
          </Link>
          {showAlinksBranding ? (
            <>
              <span className="t-muted">·</span>
              <Link href="https://alinks.online" className="t-muted text-[10px] no-underline">
                Powered by ALINKS
              </Link>
            </>
          ) : null}
        </p>
      </div>
    </footer>
  );
}
