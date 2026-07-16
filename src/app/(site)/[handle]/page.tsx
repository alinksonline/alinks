import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPageView } from "@/components/tenant/public-page-view";
import { buildTenantMetadata } from "@/core/utils/tenant-seo";
import { getPublicPage } from "@/tenant/site/get-public-page";
import { getPublicBusinessByHandle } from "@/tenant/site/get-public-business";

export async function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Promise<Metadata> {
  const business = await getPublicBusinessByHandle(params.handle);
  if (!business) return { title: "ALINKS" };
  const page = await getPublicPage(params.handle, "home");
  const seoTitle = page?.content?.seoTitle;
  const seoDescription = page?.content?.seoDescription;
  return buildTenantMetadata({
    handle: params.handle,
    name: business.name,
    branding: business.branding,
    title: seoTitle || business.name,
    description: seoDescription,
    path: `/${params.handle}`,
  });
}

export default async function TenantHomePage({ params }: { params: { handle: string } }) {
  const data = await getPublicPage(params.handle, "home");
  if (!data) notFound();
  return <PublicPageView data={data} />;
}
