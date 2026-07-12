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
  const profile =
    business.profile ?? parseBusinessProfile(profileProp, business.name);
  const socials = listSocialLinks(profile);
  const wa = profile.whatsapp || profile.phone;
  const name = profile.businessName || business.name;

  return (
    <footer className="border-t border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs text-slate-600">
      <p className="text-sm font-bold text-slate-900">{name}</p>

      <div className="mt-3 flex flex-col items-center gap-1.5 text-sm text-slate-700">
        {profile.phone ? (
          <a href={telUrl(profile.phone)} className="underline">
            {profile.phone}
          </a>
        ) : null}
        {wa ? (
          <a href={whatsappUrl(wa)} target="_blank" rel="noreferrer" className="font-semibold text-[#128C7E] underline">
            WhatsApp
          </a>
        ) : null}
        {profile.email ? (
          <a href={`mailto:${profile.email}`} className="underline">
            {profile.email}
          </a>
        ) : null}
        {profile.address ? <p className="max-w-xs text-slate-500">{profile.address}</p> : null}
      </div>

      {socials.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {socials.map((s) => (
            <a
              key={s.network}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200"
            >
              {s.label}
            </a>
          ))}
        </div>
      )}

      <p className="mx-auto mt-5 max-w-lg px-2 leading-relaxed text-[11px] text-slate-500">
        This site is operated independently by the business named above. Artix provides software only and is not the
        seller, service provider, or data controller for customer transactions.
      </p>
      <p className="mt-2 text-[11px]">
        Operated independently by <strong>{name}</strong> — not Artix.
      </p>
      <p className="mt-2">
        <Link href={`/${business.handle}/legal`} className="underline">
          Terms & Privacy
        </Link>
      </p>
      {showAlinksBranding && (
        <p className="mt-3">
          <Link href="https://alinks.online" className="text-slate-400">
            Powered by ALINKS
          </Link>
        </p>
      )}
    </footer>
  );
}
