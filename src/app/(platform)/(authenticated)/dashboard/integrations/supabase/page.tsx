import { eq } from "drizzle-orm";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { supabaseConnectors } from "@/platform/db/schema";
import { SupabaseForm } from "./supabase-form";

export default async function SupabaseIntegrationPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const db = getPlatformDb();
  const connector = db
    ? (await db.select().from(supabaseConnectors).where(eq(supabaseConnectors.businessId, business.id)).limit(1))[0]
    : null;

  return (
    <PageShell maxWidth="md" className="py-10">
      <h1 className="text-2xl font-bold">Supabase BYO</h1>
      <p className="mt-2 text-sm text-slate-600">
        Connect your Supabase project for orders and bookings storage (Enterprise add-on).
      </p>
      <SupabaseForm
        businessId={business.id}
        projectUrl={connector?.projectUrl ?? ""}
        connected={!!connector?.isActive}
        storageBackend={business.storageBackend}
      />
    </PageShell>
  );
}