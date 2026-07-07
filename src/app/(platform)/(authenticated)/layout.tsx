import type { ReactNode } from "react";

export const dynamic = "force-dynamic";
import { eq } from "drizzle-orm";
import { getBusinessesForTenant } from "@/app/actions/multi-business";
import { BusinessSwitcher } from "@/components/platform/business-switcher";
import { PlatformNav } from "@/components/platform/platform-nav";
import type { AppLocale } from "@/core/i18n/messages";
import { requireAuth } from "@/platform/auth/session";
import { getPlatformDb } from "@/platform/db/client";
import { tenants } from "@/platform/db/schema";

export default async function AuthenticatedPlatformLayout({ children }: { children: ReactNode }) {
  const session = await requireAuth();
  const db = getPlatformDb();
  const tenant = db
    ? (await db.select().from(tenants).where(eq(tenants.id, session.userId)).limit(1))[0]
    : null;
  const businesses = await getBusinessesForTenant(session.userId);
  const locale = (tenant?.locale ?? "en") as AppLocale;

  return (
    <>
      <PlatformNav role={session.role} locale={locale} />
      <div className="mx-auto flex max-w-6xl justify-end px-4 py-2">
        <BusinessSwitcher
          businesses={businesses.map((b) => ({ id: b.id, name: b.name, handle: b.handle }))}
          activeId={tenant?.activeBusinessId}
        />
      </div>
      {children}
    </>
  );
}