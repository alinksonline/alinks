import { notFound } from "next/navigation";
import { PublicPageView } from "@/components/tenant/public-page-view";
import { getPublicPage } from "@/tenant/site/get-public-page";

export default async function TenantHomePage({ params }: { params: { handle: string } }) {
  const data = await getPublicPage(params.handle, "home");
  if (!data) notFound();
  return <PublicPageView data={data} />;
}