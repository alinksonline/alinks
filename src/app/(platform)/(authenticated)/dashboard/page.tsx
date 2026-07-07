import Link from "next/link";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { getBusinessForTenant } from "@/platform/business/require-business";

const quickLinks = [
  { href: "/editor", label: "Website builder", desc: "Pages, theme, branding" },
  { href: "/editor/publish", label: "Publish", desc: "Legal gates & go live" },
  { href: "/dashboard/share", label: "Tap & Blast", desc: "WhatsApp & QR sharing" },
  { href: "/editor/commerce", label: "Store & checkout", desc: "Products, UPI, COD" },
  { href: "/dashboard/domain", label: "Custom domain", desc: "Connect your URL" },
  { href: "/dashboard/ai", label: "ALINKS AI", desc: "SEO & captions" },
  { href: "/billing", label: "Plans & billing", desc: "Trial, upgrade, promos" },
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
    <PageShell className="py-6">
      <p className="premium-label">{business.isPublished ? "Live" : "Draft"}</p>
      <h1 className="premium-heading mt-1 font-display">{business.name}</h1>
      <p className="premium-subtext mt-2">
        {business.isPublished ? "Your site is published." : "Finish editing, then publish when ready."}
      </p>

      <Link
        href={`/${business.handle}`}
        className="premium-card-soft mt-4 flex items-center justify-between px-4 py-3 text-sm font-semibold text-brand-turquoise"
      >
        <span>View public site</span>
        <span>/{business.handle} →</span>
      </Link>

      <div className="mt-6 space-y-3">
        {quickLinks.map((item) => (
          <Link key={item.href} href={item.href} className="premium-card block px-4 py-4 transition active:scale-[0.99]">
            <p className="font-semibold text-brand-ink">{item.label}</p>
            <p className="mt-0.5 text-sm text-brand-ink/55">{item.desc}</p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}