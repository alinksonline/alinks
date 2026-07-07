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

  return (
    <>
      <JsonLd data={schema} />
      <SiteHeader business={business} />
      {hero && data.slug === "home" && (
        <section className="relative flex min-h-[50vh] items-center justify-center bg-slate-900 px-4 py-16 text-center text-white">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl font-black tracking-tight">{hero.title}</h1>
            <p className="mt-4 text-lg text-slate-200">{hero.tagline}</p>
            <Link
              href={`/${data.business.handle}${hero.ctaLink.startsWith("/") ? hero.ctaLink : `/${hero.ctaLink}`}`}
              className="mt-8 inline-block rounded-full px-8 py-3 font-bold text-white"
              style={{ backgroundColor: primary }}
            >
              {hero.ctaText}
            </Link>
          </div>
        </section>
      )}
      <main className="mx-auto max-w-3xl px-4 py-12">
        {data.slug !== "home" && <h1 className="mb-8 text-3xl font-bold text-slate-900">{data.title}</h1>}
        <div className="space-y-12">
          {data.content.blocks?.map((block) => (
            <BlockRenderer key={block.id} block={block} primaryColor={primary} />
          ))}
        </div>
        <nav className="mt-10 flex flex-wrap gap-3 text-sm">
          {["home", "about", "services", "contact", "legal"].map((s) => (
            <Link key={s} href={s === "home" ? `/${data.business.handle}` : `/${data.business.handle}/${s}`} className="text-slate-600 underline">
              {s}
            </Link>
          ))}
          <Link href={`/${data.business.handle}/store`} className="text-slate-600 underline">
            store
          </Link>
        </nav>
      </main>
      <TenantFooter business={business} showAlinksBranding={shouldShowAlinksWatermark(data.business.tier)} />
    </>
  );
}