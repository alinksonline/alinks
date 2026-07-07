import { NextResponse } from "next/server";
import { getSession } from "@/platform/auth/session";
import { generateAiContent } from "@/platform/ai/service";
import type { AiTaskType } from "@/core/config/ai-limits";
import { recordLegalAcceptance } from "@/platform/legal/acceptances";
import { LEGAL_DOC_TYPES } from "@/core/constants/legal";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const prompt = body.prompt as string | undefined;
  const taskType = (body.taskType ?? "field_generate") as AiTaskType;
  const field = body.field as string | undefined;

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Prompt required" }, { status: 400 });
  }

  await recordLegalAcceptance({
    tenantId: session.userId,
    docType: LEGAL_DOC_TYPES.AI_CONTENT_REVIEW,
    metadata: { field },
  });

  const result = await generateAiContent({
    tenantId: session.userId,
    taskType,
    prompt,
    context: { businessName: body.businessName, vertical: body.vertical, city: body.city },
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 429 });
  return NextResponse.json({ result: result.result });
}