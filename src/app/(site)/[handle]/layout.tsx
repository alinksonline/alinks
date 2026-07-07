import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getBusinessRowByHandle } from "@/tenant/site/get-public-business";
import { assertSubdomainAccess } from "@/tenant/site/subdomain-gate";
import type { SubscriptionTier } from "@/core/config/tiers";

export default async function TenantSiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { handle: string };
}) {
  const h = headers();
  const urlMode = h.get("x-alinks-url-mode");
  if (urlMode !== "subdomain") return children;

  const row = await getBusinessRowByHandle(params.handle);
  if (!row) return children;

  const gate = assertSubdomainAccess(row.tier as SubscriptionTier, urlMode);
  if (!gate.allowed) {
    redirect(`/${params.handle}`);
  }

  return children;
}
