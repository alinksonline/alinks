import Link from "next/link";
import type { PublicPageData } from "@/tenant/site/get-public-page";
import { getEnv } from "@/core/config/env";
import { buildLocalBusinessSchema } from "@/platform/ai/seo";
import { SiteHeader } from "./site-header";
import { TenantFooter } from "./tenant-footer";
import { JsonLd } from "./json-ld";
import { shouldShowAlinksWatermark } from "@/core/utils/branding";
import type { Business } from "@/core/types/tenant";
import { BlockRenderer } from "./block-renderer";

/** Public mini-site page — single mobile column (Linktree-style stack). */
export function PublicPageView({ data }: { data: PublicPageData }) {
  const business: Business = {
    id: data.business.id,
    tenantId: "",
    handle: data.business.handle,
    name: data.business.name,
    vertical: data.business.vertical as Business["vertical"],
    tier: data.business.tier,
    isPublished: true,
  };

  const hero = data.content.hero;
  const primary = (data.business.theme as { primaryColor?: string })?.primaryColor ?? "#0f172a";
  const env = getEnv();
  const schema = buildLocalBusinessSchema({
    name: data.business.name,
    handle: data.business.handle,
    vertical: data.business.vertical,
    url: `${env.NEXT_PUBLIC_APP_URL}/${data.business.handle}`,
  });

  const blocks = (data.content.blocks ?? []).filter((b) => b.visible !== false);

  return (
    <>
      <JsonLd data={schema} />
      <SiteHeader business={business} />
      {hero && data.slug === "home" && (
        <section
          className="relative flex min-h-[42vh] items-end bg-slate-900 px-4 pb-8 pt-16 text-white"
          style={
            hero.imageUrl
              ? {
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,.75), rgba(0,0,0,.25)), url(${hero.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <div className="w-full max-w-app mx-auto">
            <h1 className="text-3xl font-black tracking-tight">{hero.title}</h1>
            <p className="mt-2 text-base text-white/85">{hero.tagline}</p>
            {hero.ctaText ? (
              <Link
                href={`/${data.business.handle}${hero.ctaLink.startsWith("/") ? hero.ctaLink : `/${hero.ctaLink}`}`}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-2xl px-6 py-3 text-sm font-bold text-white"
                style={{ backgroundColor: primary }}
              >
                {hero.ctaText}
              </Link>
            ) : null}
          </div>
        </section>
      )}
      <main className="mx-auto w-full max-w-app px-3 py-5 pb-10">
        {data.slug !== "home" && (
          <h1 className="mb-4 text-2xl font-bold tracking-tight text-slate-900">{data.title}</h1>
        )}
        <div className="space-y-3">
          {blocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              primaryColor={primary}
              handle={data.business.handle}
            />
          ))}
        </div>
        <nav className="mt-8 flex flex-wrap justify-center gap-2 text-xs">
          {["home", "about", "services", "contact", "legal"].map((s) => (
            <Link
              key={s}
              href={s === "home" ? `/${data.business.handle}` : `/${data.business.handle}/${s}`}
              className="rounded-full bg-slate-100 px-3 py-1.5 capitalize text-slate-600"
            >
              {s}
            </Link>
          ))}
          <Link
            href={`/${data.business.handle}/store`}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600"
          >
            store
          </Link>
        </nav>
      </main>
      <TenantFooter business={business} showAlinksBranding={shouldShowAlinksWatermark(data.business.tier)} />
    </>
  );
}
