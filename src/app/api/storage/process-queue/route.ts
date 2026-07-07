import { NextResponse } from "next/server";
import { processWriteQueue } from "@/tenant/storage/write-service";

export async function POST() {
  const processed = await processWriteQueue();
  return NextResponse.json({ ok: true, processed });
}