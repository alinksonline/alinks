import { notFound } from "next/navigation";
import { PublicPageView } from "@/components/tenant/public-page-view";
import { getPublicPage } from "@/tenant/site/get-public-page";

const ALLOWED = new Set(["about", "services", "contact", "legal"]);

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