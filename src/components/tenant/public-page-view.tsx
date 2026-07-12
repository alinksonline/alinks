import Link from "next/link";
import type { PublicPageData } from "@/tenant/site/get-public-page";
import { getEnv } from "@/core/config/env";
import { buildLocalBusinessSchema } from "@/platform/ai/seo";
import { SiteHeader } from "./site-header";
import { TenantFooter } from "./tenant-footer";
import { TenantThemedLayout } from "./tenant-themed-layout";
import { JsonLd } from "./json-ld";
import { shouldShowAlinksWatermark } from "@/core/utils/branding";
import type { Business } from "@/core/types/tenant";
import { parseBusinessProfile } from "@/core/types/business-profile";
import { ensureContactPageBlocks } from "@/core/utils/resolve-block-profile";
import { parseThemeConfig, resolveTenantTheme } from "@/core/utils/tenant-theme";
import { BlockRenderer } from "./block-renderer";

/** Public mini-site page — themed layout base + Linktree-style stack. */
export function PublicPageView({ data }: { data: PublicPageData }) {
  const profile = parseBusinessProfile(data.business.branding, data.business.name);
  const business: Business = {
    id: data.business.id,
    tenantId: "",
    handle: data.business.handle,
    name: profile.businessName || data.business.name,
    vertical: data.business.vertical as Business["vertical"],
    tier: data.business.tier,
    isPublished: true,
    profile,
  };

  const hero = data.content.hero;
  const resolved = resolveTenantTheme(data.business.theme);
  const primary = resolved.primary;
  const accent = resolved.accent;
  const env = getEnv();
  const schema = buildLocalBusinessSchema({
    name: profile.businessName || data.business.name,
    handle: data.business.handle,
    vertical: data.business.vertical,
    url: `${env.NEXT_PUBLIC_APP_URL}/${data.business.handle}`,
  });

  let blocks = (data.content.blocks ?? []).filter((b) => b.visible !== false);
  if (data.slug === "contact") {
    blocks = ensureContactPageBlocks(blocks, profile).filter((b) => b.visible !== false);
  }

  const theme = parseThemeConfig(data.business.theme);
  const navItems = ["home", "about", "services", "contact", "legal", "store"] as const;

  return (
    <TenantThemedLayout theme={theme}>
      <JsonLd data={schema} />
      <SiteHeader business={business} profile={profile} />

      {hero && data.slug === "home" && (
        <section
          className="relative flex min-h-[38vh] items-end px-4 pb-7 pt-14 text-white"
          style={
            hero.imageUrl
              ? {
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,.78), rgba(0,0,0,.2)), url(${hero.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {
                  background: `linear-gradient(145deg, ${primary}, ${resolved.accent})`,
                }
          }
        >
          <div className="mx-auto w-full max-w-app">
            <h1 className="text-2xl font-black tracking-tight">{hero.title}</h1>
            <p className="mt-1.5 text-sm text-white/90">{hero.tagline}</p>
            {hero.ctaText ? (
              <Link
                href={`/${data.business.handle}${hero.ctaLink.startsWith("/") ? hero.ctaLink : `/${hero.ctaLink}`}`}
                className="t-btn-primary mt-4 max-w-full"
                style={{
                  backgroundColor: "var(--t-surface)",
                  color: "var(--t-primary)",
                }}
              >
                {hero.ctaText}
              </Link>
            ) : null}
          </div>
        </section>
      )}

      <main className="mx-auto w-full max-w-app px-3.5 py-4 pb-10">
        {data.slug !== "home" && (
          <h1 className="t-ink mb-3 text-lg font-bold tracking-tight">{data.title}</h1>
        )}
        <div className="space-y-3">
          {blocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              primaryColor={primary}
              accentColor={accent}
              handle={data.business.handle}
              profile={profile}
            />
          ))}
        </div>

        <nav className="mt-7 flex flex-wrap justify-center gap-1.5" aria-label="Site pages">
          {navItems.map((s) => {
            const href =
              s === "home"
                ? `/${data.business.handle}`
                : s === "store"
                  ? `/${data.business.handle}/store`
                  : `/${data.business.handle}/${s}`;
            const active =
              (s === "home" && data.slug === "home") ||
              (s !== "home" && s !== "store" && data.slug === s);
            return (
              <Link
                key={s}
                href={href}
                className={active ? "t-chip t-chip-active capitalize" : "t-chip capitalize"}
              >
                {s}
              </Link>
            );
          })}
        </nav>
      </main>

      <TenantFooter
        business={business}
        profile={profile}
        showAlinksBranding={shouldShowAlinksWatermark(data.business.tier)}
      />
    </TenantThemedLayout>
  );
}
