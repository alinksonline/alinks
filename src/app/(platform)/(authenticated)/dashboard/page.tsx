import Link from "next/link";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { getBusinessForTenant } from "@/platform/business/require-business";
import { DashboardPublishStatus } from "./dashboard-publish-status";

const quickLinks = [
  { href: "/editor", label: "Website builder", desc: "Pages, theme, branding" },
  { href: "/editor/publish", label: "Go live", desc: "Publish, republish, unpublish" },
  { href: "/dashboard/share", label: "Tap & Blast", desc: "WhatsApp & QR sharing" },
  { href: "/editor/commerce", label: "Payments", desc: "Checkout, UPI, COD, orders sheet" },
  { href: "/dashboard/domain", label: "Custom domain", desc: "Connect your URL" },
  { href: "/dashboard/ai", label: "ALINKS AI", desc: "SEO & captions" },
  { href: "/billing", label: "Billing", desc: "Your ALINKS plan, trial, promos" },
  { href: "/dashboard/settings", label: "Settings", desc: "Locale & integrations" },
];

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

  return (
    <PageShell className="py-4">
      <p className="premium-label">{business.isPublished ? "Published" : "Draft"}</p>
      <h1 className="mt-1 font-display text-xl font-bold tracking-tight text-brand-ink">
        {business.name}
      </h1>
      <p className="mt-1 text-[11px] text-brand-muted">
        /{business.handle}
        {business.isPublished ? " · public" : " · not public yet"}
      </p>

      <div className="mt-3">
        <DashboardPublishStatus
          businessId={business.id}
          handle={business.handle}
          isPublished={business.isPublished}
        />
      </div>

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
