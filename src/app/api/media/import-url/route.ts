import { NextResponse } from "next/server";
import { getSession } from "@/platform/auth/session";
import { fetchImageBuffer, processImageToWebp } from "@/platform/media/process-image";
import { storeProcessedImage } from "@/platform/media/store-image";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Download remote image URL → WebP → cloud store. */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { url?: string };
    const url = body.url?.trim();
    if (!url) {
      return NextResponse.json({ success: false, error: "Missing url" }, { status: 400 });
    }

    const buf = await fetchImageBuffer(url);
    const processed = await processImageToWebp(buf);
    const stored = await storeProcessedImage(session.userId, processed);

    return NextResponse.json({
      success: true,
      url: stored.url,
      width: stored.width,
      height: stored.height,
      bytes: stored.bytes,
      storage: stored.storage,
      format: "webp",
      sourceUrl: url,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Import failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
