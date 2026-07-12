import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import type { ProcessedImage } from "./process-image";

export type StoredMedia = {
  url: string;
  width: number;
  height: number;
  bytes: number;
  storage: "blob" | "local" | "inline";
};

function mediaKey(tenantId: string, ext: string): string {
  const id = randomBytes(12).toString("hex");
  const day = new Date().toISOString().slice(0, 10);
  return `alinks-media/${tenantId}/${day}/${id}.${ext}`;
}

function isVercelRuntime(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

/**
 * Cloud-first media store.
 * 1. BLOB_READ_WRITE_TOKEN → Vercel Blob (best for production CDN)
 * 2. Local filesystem public/uploads (dev only)
 * 3. On Vercel without Blob → inline data: URL (WebP base64) so upload still works;
 *    image is saved with the page content in the DB and works on every device.
 */
export async function storeProcessedImage(
  tenantId: string,
  processed: ProcessedImage,
): Promise<StoredMedia> {
  const key = mediaKey(tenantId, processed.ext);
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (token) {
    try {
      const blob = await put(key, processed.buffer, {
        access: "public",
        contentType: processed.contentType,
        token,
        addRandomSuffix: false,
      });
      return {
        url: blob.url,
        width: processed.width,
        height: processed.height,
        bytes: processed.bytes,
        storage: "blob",
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Blob upload failed";
      throw new Error(`Cloud storage failed: ${msg}`);
    }
  }

  // Local laptop: write under public/
  if (!isVercelRuntime()) {
    const rel = path.join("uploads", tenantId, path.basename(key));
    const abs = path.join(process.cwd(), "public", rel);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, processed.buffer);

    const base =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";

    return {
      url: `${base}/${rel.replace(/\\/g, "/")}`,
      width: processed.width,
      height: processed.height,
      bytes: processed.bytes,
      storage: "local",
    };
  }

  // Vercel without Blob token: inline WebP (saved in page JSON / DB).
  // Cap: refuse huge payloads that would bloat the DB (~1.2MB raw ≈ 1.6MB base64).
  if (processed.bytes > 1_200_000) {
    throw new Error(
      "Image is large and cloud storage is not configured. Add BLOB_READ_WRITE_TOKEN on Vercel (Storage → Blob), or use a smaller image.",
    );
  }

  const b64 = processed.buffer.toString("base64");
  return {
    url: `data:image/webp;base64,${b64}`,
    width: processed.width,
    height: processed.height,
    bytes: processed.bytes,
    storage: "inline",
  };
}
