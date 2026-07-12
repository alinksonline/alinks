import { NextResponse } from "next/server";
import { getSession } from "@/platform/auth/session";
import { processImageToWebp } from "@/platform/media/process-image";
import { storeProcessedImage } from "@/platform/media/store-image";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Multipart upload → WebP → cloud (or local public/uploads). */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Missing file" }, { status: 400 });
    }
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Max 25MB" }, { status: 400 });
    }
    if (file.type && !file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "File must be an image" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
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
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
