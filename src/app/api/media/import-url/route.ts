import { NextResponse } from "next/server";
import { getSession } from "@/platform/auth/session";
import { fetchImageBuffer, processImageToWebp } from "@/platform/media/process-image";
import { storeProcessedImage } from "@/platform/media/store-image";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Download remote image URL → WebP → store. */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "Sign in required" }, { status: 401 });
    }

    const body = (await req.json()) as { url?: string };
    const url = body.url?.trim();
    if (!url) {
      return NextResponse.json({ success: false, error: "Missing url" }, { status: 400 });
    }

    let buf: Buffer;
    try {
      buf = await fetchImageBuffer(url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Download failed";
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    let processed;
    try {
      processed = await processImageToWebp(buf);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Convert failed";
      return NextResponse.json({ success: false, error: `Could not process image: ${msg}` }, { status: 400 });
    }

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
    console.error("[media/import-url]", e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
