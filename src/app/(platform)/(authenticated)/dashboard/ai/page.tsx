import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getAiDashboardStats } from "@/app/actions/ai";
import { AiPanel } from "./ai-panel";

export default async function AiDashboardPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const stats = await getAiDashboardStats();
  if (!stats) return null;

  return (
    <PageShell maxWidth="md" className="py-10">
      <h1 className="text-2xl font-bold">ALINKS AI</h1>
      <p className="mt-2 text-sm text-slate-600">SEO, captions, and product copy with tier caps + credit packs.</p>
      <AiPanel stats={stats} businessName={business.name} vertical={business.vertical} />
    </PageShell>
  );
}
