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
import { resolveHeroPresentation } from "@/core/utils/hero-style";
import { BlockRenderer } from "./block-renderer";
import { PublicSiteNav } from "./public-site-nav";
import { PresenceExtrasPublic } from "./presence-extras-public";
import { readPresenceExtrasFromBranding } from "@/core/types/presence-extras";

/** Public mini-site page — themed layout base + Linktree-style stack. */
export function PublicPageView({ data }: { data: PublicPageData }) {
  const profile = parseBusinessProfile(data.business.branding, data.business.name);
  const presenceExtras = readPresenceExtrasFromBranding(data.business.branding);
  const skus = data.business.entitledSkus ?? [];
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

  return (
    <TenantThemedLayout theme={theme}>
      <JsonLd data={schema} />
      <SiteHeader business={business} profile={profile} />

      {data.slug === "home" && profile.coverUrl?.trim() ? (
        <div className="mx-auto w-full max-w-app px-3.5 pt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.coverUrl}
            alt=""
            className="h-36 w-full object-cover ring-1 ring-[var(--t-border)] sm:h-44"
            style={{ borderRadius: "var(--t-radius-lg, var(--t-radius, 1rem))" }}
          />
        </div>
      ) : null}

      {hero && data.slug === "home" && (() => {
        const hp = resolveHeroPresentation(hero, primary, accent);
        const ctaHref = `/${data.business.handle}${
          hero.ctaLink?.startsWith("/") ? hero.ctaLink : `/${hero.ctaLink || "contact"}`
        }`;
        return (
          <section style={hp.section}>
            {hp.overlayLayer ? <div aria-hidden style={hp.overlayLayer} /> : null}
            <div style={hp.inner}>
              <h1 style={hp.title}>{hero.title}</h1>
              <p style={hp.tagline}>{hero.tagline}</p>
              {hp.showCta ? (
                <Link href={ctaHref} style={hp.cta}>
                  {hero.ctaText}
                </Link>
              ) : null}
            </div>
          </section>
        );
      })()}

      <main className="mx-auto w-full max-w-app px-3.5 py-4 pb-4">
        {data.slug !== "home" && (
          <div className="mb-4">
            <h1 className="t-ink text-xl font-bold tracking-tight">{data.title}</h1>
          </div>
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
      </main>

      {data.slug === "home" || data.slug === "about" || data.slug === "media" ? (
        <PresenceExtrasPublic
          extras={presenceExtras}
          showMediaKit={skus.includes("pr.media_kit")}
          showSocialProof={skus.includes("pr.social_proof")}
          showHighlights={skus.includes("pr.highlights")}
        />
      ) : null}

      <TenantFooter
        business={business}
        profile={profile}
        showAlinksBranding={shouldShowAlinksWatermark(
          data.business.tier,
          data.business.entitledSkus,
        )}
      />
      <PublicSiteNav
        handle={data.business.handle}
        vertical={data.business.vertical}
        slug={data.slug}
        catalogMode={data.business.catalogMode ?? "both"}
      />
    </TenantThemedLayout>
  );
}
