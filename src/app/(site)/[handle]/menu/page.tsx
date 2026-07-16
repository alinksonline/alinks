import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MenuCatalog } from "@/components/tenant/menu-catalog";
import { MenuOrderBoard } from "@/components/tenant/menu-order-board";
import { SiteHeader } from "@/components/tenant/site-header";
import { TenantFooter } from "@/components/tenant/tenant-footer";
import { TenantThemedLayout } from "@/components/tenant/tenant-themed-layout";
import { PublicSiteNav } from "@/components/tenant/public-site-nav";
import { shouldShowAlinksWatermark } from "@/core/utils/branding";
import { parseBusinessProfile } from "@/core/types/business-profile";
import { buildTenantMetadata } from "@/core/utils/tenant-seo";
import { resolveIndustryGroup } from "@/core/config/industries";
import { resolveFoodType, FOOD_TYPE_DEFS } from "@/core/config/food-compat";
import { getMenuItemsForHandle } from "@/app/actions/food";
import { getPublicFoodChannels, resolveFoodTableByCode } from "@/app/actions/food-ops";
import { getPublicBusinessByHandle } from "@/tenant/site/get-public-business";

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const business = await getPublicBusinessByHandle(params.handle);
  if (!business) return { title: "Menu" };
  return buildTenantMetadata({
    handle: params.handle,
    name: business.name,
    branding: business.branding,
    title: `${business.name} — Menu`,
    description: `Digital menu and orders from ${business.name}`,
    path: `/${params.handle}/menu`,
  });
}

export default async function FoodMenuPage({
  params,
  searchParams,
}: {
  params: { handle: string };
  searchParams?: { table?: string };
}) {
  const row = await getPublicBusinessByHandle(params.handle);
  if (!row) notFound();

  const group = resolveIndustryGroup(row.industryGroup || row.vertical);
  if (group !== "food" && row.vertical !== "restaurant") notFound();

  const foodType = resolveFoodType(row.industryType, row.vertical);
  const typeDef = FOOD_TYPE_DEFS[foodType];
  const items = await getMenuItemsForHandle(params.handle);
  const channels = await getPublicFoodChannels(params.handle);
  const profile = parseBusinessProfile(row.branding, row.name);
  const business = { ...row, profile };

  const tableCode = searchParams?.table?.trim();
  const table = tableCode ? await resolveFoodTableByCode(params.handle, tableCode) : null;

  const opsOn =
    channels &&
    (channels.pickupEnabled || channels.deliveryEnabled || channels.dineInEnabled);

  return (
    <TenantThemedLayout theme={business.theme}>
      <SiteHeader business={business} profile={profile} />

      <section className="t-page-hero">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "var(--t-primary-text, var(--t-primary))" }}
        >
          {typeDef.label}
        </p>
        <h1 className="t-ink mt-1.5 text-2xl font-bold tracking-tight">{typeDef.catalogLabel}</h1>
        <p className="t-muted mt-1.5 max-w-sm text-sm leading-relaxed">
          {table
            ? `Table ${table.label} — order for dine-in.`
            : opsOn
              ? "Browse the menu. Order pickup, delivery, or WhatsApp — dine-in only if your table QR is scanned."
              : "Browse and order on WhatsApp."}{" "}
          {!typeDef.dineInAllowed ? "Cloud kitchen: no table QR." : null}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="t-chip t-chip-active">{items.length} items</span>
          <span className="t-chip">WhatsApp</span>
          {channels?.pickupEnabled ? <span className="t-chip">Pickup</span> : null}
          {channels?.deliveryEnabled ? <span className="t-chip">Delivery</span> : null}
          {channels?.dineInEnabled ? <span className="t-chip">Dine-in QR</span> : null}
          {!typeDef.dineInAllowed ? <span className="t-chip">No dine-in</span> : null}
        </div>
      </section>

      <main className="mx-auto max-w-app px-3.5 py-4 pb-4">
        <MenuCatalog business={business} items={items} catalogLabel={typeDef.catalogLabel} />
        {opsOn && channels ? (
          <MenuOrderBoard
            handle={params.handle}
            items={items}
            channels={channels}
            tableCode={table?.code}
            tableLabel={table?.label}
          />
        ) : null}
        <div className="mt-6 text-center">
          <Link href={`/${params.handle}`} className="t-link text-xs font-semibold no-underline">
            ← Back to home
          </Link>
        </div>
      </main>

      <TenantFooter
        business={business}
        profile={profile}
        showAlinksBranding={shouldShowAlinksWatermark(business.tier)}
      />
      <PublicSiteNav
        handle={params.handle}
        vertical={business.vertical}
        industryGroup={business.industryGroup}
        slug="home"
        path="menu"
      />
    </TenantThemedLayout>
  );
}
