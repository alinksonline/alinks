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
  storage: "blob" | "local";
};

function mediaKey(tenantId: string, ext: string): string {
  const id = randomBytes(12).toString("hex");
  const day = new Date().toISOString().slice(0, 10);
  return `alinks-media/${tenantId}/${day}/${id}.${ext}`;
}

/**
 * Cloud-first media store.
 * - Production / when BLOB_READ_WRITE_TOKEN is set → Vercel Blob (persistent cloud CDN)
 * - Local dev without token → public/uploads (device/browser still loads via app URL)
 *
 * Tenant images are never kept only on one phone — cloud (or shared app URL) is the source of truth
 * so every device sees the same assets.
 */
export async function storeProcessedImage(
  tenantId: string,
  processed: ProcessedImage,
): Promise<StoredMedia> {
  const key = mediaKey(tenantId, processed.ext);
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (token) {
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
  }

  // Local / no blob token: write under public so Next can serve it
  const rel = path.join("uploads", tenantId, path.basename(key));
  const abs = path.join(process.cwd(), "public", rel);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, processed.buffer);

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  return {
    url: `${base}/${rel.replace(/\\/g, "/")}`,
    width: processed.width,
    height: processed.height,
    bytes: processed.bytes,
    storage: "local",
  };
}
