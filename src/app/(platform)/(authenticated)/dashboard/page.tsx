import Link from "next/link";
import { PageShell } from "@/components/shared/page-shell";
import { isPresenceIndustry } from "@/core/config/industries";
import { canShowCommerceEditor } from "@/core/utils/industry-gates";
import { requireAuth } from "@/platform/auth/session";
import { getBusinessForTenant } from "@/platform/business/require-business";
import { DashboardPublishStatus } from "./dashboard-publish-status";

export default async function DashboardPage() {
  const session = await requireAuth();
  const business = await getBusinessForTenant(session.userId);

  if (!business) {
    return (
      <PageShell className="py-8">
        <p className="premium-label">Welcome</p>
        <h1 className="premium-heading mt-2 font-display">Set up your business</h1>
        <p className="premium-subtext mt-3">Complete onboarding to create your 5-page mini-site.</p>
        <Link href="/onboarding" className="premium-btn-bronze mt-8 inline-flex">
          Start onboarding
        </Link>
      </PageShell>
    );
  }

  const presence = isPresenceIndustry(business.industryGroup || business.vertical);
  const showCommerce = canShowCommerceEditor({
    vertical: business.vertical,
    industryGroup: business.industryGroup,
  });
  const { canExposeBooking } = await import("@/core/utils/industry-gates");
  const showBookings = canExposeBooking({
    vertical: business.vertical,
    industryGroup: business.industryGroup,
  });

  const shopAdmin = showCommerce
    ? [
        { href: "/dashboard/orders", label: "Orders", desc: "Status · delivery" },
        { href: "/dashboard/clients", label: "Clients", desc: "People who ordered" },
        { href: "/editor/products", label: "Catalog", desc: "Products & services" },
        { href: "/dashboard/settings", label: "Shop pages", desc: "Show Products, Services, or both" },
      ]
    : [];

  const quickLinks = [
    { href: "/editor", label: "Website builder", desc: "Pages, theme, branding" },
    { href: "/editor/publish", label: "Go live", desc: "Publish, republish, unpublish" },
    {
      href: "/dashboard/analytics",
      label: "Analytics lite",
      desc: presence ? "Views & link clicks (module)" : "Views & link clicks if entitled",
    },
    ...(showBookings
      ? [
          {
            href: "/dashboard/appointments",
            label: "Appointments",
            desc: "Free & paid bookings · day board",
          },
          {
            href: "/editor/packages",
            label: "Packages",
            desc: "Services clients book",
          },
          {
            href: "/editor/staff",
            label: "Staff",
            desc: "Roster & slot capacity",
          },
          {
            href: "/dashboard/integrations/google",
            label: "Google Calendar",
            desc: "Free Connect for your Gmail",
          },
        ]
      : []),
    ...((business.industryGroup === "food" || business.vertical === "restaurant")
      ? [
          {
            href: "/editor/menu",
            label: "Menu & channels",
            desc: "Menu · pickup · delivery · dine-in QR",
          },
          {
            href: "/dashboard/orders",
            label: "Order board",
            desc: "Kitchen tickets · status",
          },
        ]
      : []),
    ...((business.industryGroup === "retail" ||
    ["kirana", "grocery", "ecommerce"].includes(business.vertical))
      ? [
          {
            href: "/editor/products",
            label: "Products & services",
            desc: "Physical catalog and service catalog",
          },
          {
            href: "/dashboard/orders",
            label: "Customer orders",
            desc: "Placed, cancelled, COD, paid",
          },
          {
            href: "/dashboard/clients",
            label: "Clients",
            desc: "People who ordered from you",
          },
        ]
      : []),
    ...((business.industryGroup === "bookings" || business.vertical === "clinic")
      ? [
          {
            href: "/editor/packages",
            label: "Services",
            desc: "Consult / clinic / venue packages",
          },
          {
            href: "/dashboard/appointments",
            label: "Appointments",
            desc: "Day board · free & paid holds",
          },
          ...(business.vertical === "clinic" || business.industryType === "clinic"
            ? [
                {
                  href: "/editor/clinic",
                  label: "Clinic license",
                  desc: "NMC gate before publish",
                },
              ]
            : []),
        ]
      : []),
    ...(business.industryGroup === "real_estate"
      ? [
          {
            href: "/editor/listings",
            label: "Property-Bank",
            desc: "Listings · visibility · leads",
          },
        ]
      : []),
    ...(business.industryGroup === "education"
      ? [
          {
            href: "/editor/courses",
            label: "Courses",
            desc: "Catalogue · YouTube · free enquiry",
          },
        ]
      : []),
    ...(business.industryGroup === "fitness"
      ? [
          {
            href: "/editor/packages",
            label: "Classes & memberships",
            desc: "Trials, classes, PT packs",
          },
          {
            href: "/editor/staff",
            label: "Trainers",
            desc: "Trainer roster · slot capacity",
          },
          {
            href: "/dashboard/appointments",
            label: "Bookings board",
            desc: "Trial & class holds",
          },
        ]
      : []),
    ...(business.industryGroup === "automotive"
      ? [
          {
            href: "/editor/vehicles",
            label: "Vehicles",
            desc: "Inventory · enquiry (no car checkout)",
          },
          {
            href: "/editor/packages",
            label: "Service packages",
            desc: "Workshop / detailing",
          },
          {
            href: "/dashboard/appointments",
            label: "Service board",
            desc: "Slot holds",
          },
        ]
      : []),
    {
      href: "/dashboard/share",
      label: presence ? "Share kit" : "Tap & Blast",
      desc: presence ? "QR, WhatsApp & OG share for your profile" : "WhatsApp & QR sharing",
    },
    ...(showCommerce
      ? [{ href: "/editor/commerce", label: "Checkout", desc: "Customers pay you · Razorpay, COD" }]
      : []),
    {
      href: "/dashboard/data",
      label: "Data",
      desc: presence
        ? "Sheets for collab leads (optional)"
        : showBookings
          ? "Sheets for appointments & customers"
          : "Sheets or Supabase for orders",
    },
    { href: "/dashboard/domain", label: "Custom domain", desc: "Connect your URL" },
    ...(presence
      ? [
          {
            href: "/editor/presence",
            label: "Presence studio",
            desc: "Media kit, social proof, highlights",
          },
          ...(business.creatorPartnerTier
            ? [
                {
                  href: "/dashboard/creator-partner",
                  label: "Creator Partner",
                  desc: "Promo duties & discount checklist",
                },
              ]
            : []),
        ]
      : []),
    { href: "/dashboard/ai", label: "ALINKS AI", desc: "SEO & captions" },
    {
      href: "/billing",
      label: "Billing",
      desc: presence
        ? "You pay ALINKS · plan, Creator pricing"
        : "You pay ALINKS · plan, Select modules",
    },
    { href: "/dashboard/settings", label: "Settings", desc: "App prefs & account" },
  ];

  return (
    <PageShell className="py-4">
      <p className="premium-label">{business.isPublished ? "Published" : "Draft"}</p>
      <h1 className="mt-1 font-display text-xl font-bold tracking-tight text-brand-ink">
        {business.name}
      </h1>
      <p className="mt-1 text-[11px] text-brand-muted">
        /{business.handle}
        {business.isPublished ? " · public" : " · not public yet"}
        {presence ? " · Presence (no sales)" : ""}
        {business.creatorPartnerTier ? ` · Creator Partner ${business.creatorPartnerTier}` : ""}
      </p>

      <div className="mt-3">
        <DashboardPublishStatus
          businessId={business.id}
          handle={business.handle}
          isPublished={business.isPublished}
        />
      </div>

      {shopAdmin.length > 0 ? (
        <div className="mt-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Shop admin</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {shopAdmin.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="premium-card px-3 py-3 transition active:scale-[0.99]"
              >
                <p className="text-xs font-semibold text-brand-ink">{item.label}</p>
                <p className="mt-0.5 text-[11px] text-brand-muted">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 space-y-2">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="premium-card block px-3 py-2.5 transition active:scale-[0.99]"
          >
            <p className="text-xs font-semibold text-brand-ink">{item.label}</p>
            <p className="mt-0.5 text-[11px] text-brand-muted">{item.desc}</p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
