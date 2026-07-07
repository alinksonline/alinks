import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { getBusinessForTenant } from "@/platform/business/require-business";

export default async function DashboardPage() {
  const session = await requireAuth();
  const business = await getBusinessForTenant(session.userId);

  if (!business) {
    return (
      <PageShell maxWidth="lg" className="py-10">
        <h1 className="text-3xl font-bold">Welcome to ALINKS</h1>
        <p className="mt-4 text-slate-600">Complete onboarding to create your mini-site.</p>
        <Link href="/onboarding" className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">
          Start onboarding
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth="lg" className="py-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{business.name}</h1>
      <p className="mt-2 text-slate-600">
        {business.isPublished ? "Your site is live." : "Finish editing and publish when ready."}
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Website builder</h2>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Public URL:{" "}
              <Link href={`/${business.handle}`} className="font-medium underline">
                /{business.handle}
              </Link>
            </p>
            <Link href="/editor" className="inline-block font-semibold text-slate-900 underline">
              Open editor
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Pro features</h2>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <Link href="/dashboard/share" className="block underline">
              Tap & Blast share hub
            </Link>
            <Link href="/dashboard/domain" className="block underline">
              Custom domain wizard
            </Link>
            <Link href="/editor/commerce" className="block underline">
              Pro checkout & sheets
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-semibold">ALINKS AI & launch</h2>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <Link href="/dashboard/ai" className="block underline">ALINKS AI — SEO & captions</Link>
            <Link href="/dashboard/settings" className="block underline">Locale & region settings</Link>
            <Link href="/dashboard/integrations/supabase" className="block underline">Supabase connector</Link>
            <Link href="/dashboard/integrations/meta" className="block underline">Meta catalog feed</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Publish & billing</h2>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <Link href="/editor/publish" className="block underline">Publish checklist</Link>
            <Link href="/billing" className="block underline">Trial, plans & promos</Link>
            <Link href="/editor/staff" className="block underline">Staff roster</Link>
            <Link href="/editor/clinic" className="block underline">Clinic license</Link>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}