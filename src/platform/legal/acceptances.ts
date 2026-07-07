import { and, eq } from "drizzle-orm";
import { LEGAL_DOC_VERSION, type LegalDocType } from "@/core/constants/legal";
import { getPlatformDb } from "@/platform/db/client";
import { legalAcceptances } from "@/platform/db/schema";

export async function recordLegalAcceptance(params: {
  tenantId: string;
  docType: LegalDocType;
  docVersion?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}) {
  const db = getPlatformDb();
  if (!db) throw new Error("Database not connected");

  await db.insert(legalAcceptances).values({
    tenantId: params.tenantId,
    docType: params.docType,
    docVersion: params.docVersion ?? LEGAL_DOC_VERSION,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: params.metadata,
  });
}

export async function hasLegalAcceptance(tenantId: string, docType: LegalDocType): Promise<boolean> {
  const db = getPlatformDb();
  if (!db) return false;

  const rows = await db
    .select()
    .from(legalAcceptances)
    .where(and(eq(legalAcceptances.tenantId, tenantId), eq(legalAcceptances.docType, docType)))
    .limit(1);

  return rows.length > 0;
}