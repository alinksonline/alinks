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
    <footer className="t-footer px-4 py-7 text-center text-xs">
      <p className="t-ink text-sm font-bold">{name}</p>

      <div className="mt-2.5 flex flex-col items-center gap-1 text-xs">
        {profile.phone ? (
          <a href={telUrl(profile.phone)} className="t-link">
            {profile.phone}
          </a>
        ) : null}
        {wa ? (
          <a
            href={whatsappUrl(wa)}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#128C7E] underline"
          >
            WhatsApp
          </a>
        ) : null}
        {profile.email ? (
          <a href={`mailto:${profile.email}`} className="t-link">
            {profile.email}
          </a>
        ) : null}
        {profile.address ? <p className="t-muted max-w-xs">{profile.address}</p> : null}
      </div>

      {socials.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {socials.map((s) => (
            <a
              key={s.network}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="t-card px-2.5 py-1 text-[11px] font-semibold no-underline"
            >
              {s.label}
            </a>
          ))}
        </div>
      )}

      <p className="t-muted mx-auto mt-4 max-w-lg px-2 text-[10px] leading-relaxed">
        This site is operated independently by the business named above. Artix provides software only
        and is not the seller, service provider, or data controller for customer transactions.
      </p>
      <p className="t-muted mt-1.5 text-[10px]">
        Operated independently by <strong className="t-ink">{name}</strong> — not Artix.
      </p>
      <p className="mt-2">
        <Link href={`/${business.handle}/legal`} className="t-link text-[11px]">
          Terms & Privacy
        </Link>
      </p>
      {showAlinksBranding && (
        <p className="mt-2.5">
          <Link href="https://alinks.online" className="t-muted text-[10px] no-underline">
            Powered by ALINKS
          </Link>
        </p>
      )}
    </footer>
  );
}
