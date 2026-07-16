import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPageView } from "@/components/tenant/public-page-view";
import { buildTenantMetadata } from "@/core/utils/tenant-seo";
import { getPublicPage } from "@/tenant/site/get-public-page";
import { getPublicBusinessByHandle } from "@/tenant/site/get-public-business";

const ALLOWED = new Set(["about", "services", "contact", "legal"]);

export async function generateMetadata({
  params,
}: {
  params: { handle: string; slug: string };
}): Promise<Metadata> {
  if (!ALLOWED.has(params.slug)) return { title: "ALINKS" };
  const business = await getPublicBusinessByHandle(params.handle);
  if (!business) return { title: "ALINKS" };
  const page = await getPublicPage(params.handle, params.slug);
  return buildTenantMetadata({
    handle: params.handle,
    name: business.name,
    branding: business.branding,
    title: page?.content?.seoTitle || page?.title || `${business.name} — ${params.slug}`,
    description: page?.content?.seoDescription,
    path: `/${params.handle}/${params.slug}`,
  });
}

export default async function TenantSubPage({
  params,
}: {
  params: { handle: string; slug: string };
}) {
  if (!ALLOWED.has(params.slug)) notFound();
  const data = await getPublicPage(params.handle, params.slug);
  if (!data) notFound();
  return <PublicPageView data={data} />;
}
