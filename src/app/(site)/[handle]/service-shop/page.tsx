import type { Metadata } from "next";
import { CatalogKindPage } from "@/tenant/site/catalog-kind-page";
import { getPublicBusinessByHandle } from "@/tenant/site/get-public-business";

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const business = await getPublicBusinessByHandle(params.handle);
  if (!business) return { title: "Services" };
  const { buildTenantMetadata } = await import("@/core/utils/tenant-seo");
  return buildTenantMetadata({
    handle: params.handle,
    name: business.name,
    branding: business.branding,
    title: `${business.name} — Services`,
    description: `Services from ${business.name}`,
    path: `/${params.handle}/service-shop`,
  });
}

export default function ServiceShopPage({ params }: { params: { handle: string } }) {
  return <CatalogKindPage handle={params.handle} kind="service" />;
}
