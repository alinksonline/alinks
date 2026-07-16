import sharp from "sharp";

const MAX_EDGE = 4096; // retain full res up to 4k edge; only shrink if larger
const MAX_OUTPUT_BYTES = 1_800_000; // ~1.8MB WebP cap after quality steps
const WEBP_QUALITY_START = 88;
const WEBP_QUALITY_FLOOR = 62;

export type ProcessedImage = {
  buffer: Buffer;
  width: number;
  height: number;
  bytes: number;
  contentType: "image/webp";
  ext: "webp";
};

/**
 * Convert any common image buffer to WebP.
 * - Keeps original dimensions when ≤ MAX_EDGE
 * - Only downscales if wider/taller than MAX_EDGE (preserves aspect ratio)
 * - Steps WebP quality down if output exceeds MAX_OUTPUT_BYTES
 */
export async function processImageToWebp(input: Buffer): Promise<ProcessedImage> {
  const image = sharp(input, { failOn: "none", animated: false });
  const meta = await image.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;

  let pipeline = image.rotate(); // honour EXIF orientation

  if (w > MAX_EDGE || h > MAX_EDGE) {
    pipeline = pipeline.resize({
      width: w >= h ? MAX_EDGE : undefined,
      height: h > w ? MAX_EDGE : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Materialize once so quality retries don't re-decode from source
  const normalized = await pipeline.toBuffer();

  let quality = WEBP_QUALITY_START;
  let buffer = await sharp(normalized)
    .webp({ quality, effort: 4, smartSubsample: true })
    .toBuffer();

  while (buffer.byteLength > MAX_OUTPUT_BYTES && quality > WEBP_QUALITY_FLOOR) {
    quality = Math.max(WEBP_QUALITY_FLOOR, quality - 8);
    buffer = await sharp(normalized)
      .webp({ quality, effort: 5, smartSubsample: true })
      .toBuffer();
  }

  // Still huge: slight extra downscale while preserving aspect (last resort)
  if (buffer.byteLength > MAX_OUTPUT_BYTES) {
    const outMeta = await sharp(buffer).metadata();
    const ow = outMeta.width ?? w;
    const oh = outMeta.height ?? h;
    const scale = Math.sqrt(MAX_OUTPUT_BYTES / buffer.byteLength) * 0.92;
    const tw = Math.max(1, Math.round(ow * scale));
    const th = Math.max(1, Math.round(oh * scale));
    buffer = await sharp(normalized)
      .resize({ width: tw, height: th, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY_FLOOR, effort: 5, smartSubsample: true })
      .toBuffer();
  }

  const outMeta = await sharp(buffer).metadata();
  return {
    buffer,
    width: outMeta.width ?? w,
    height: outMeta.height ?? h,
    bytes: buffer.byteLength,
    contentType: "image/webp",
    ext: "webp",
  };
}

export async function fetchImageBuffer(url: string): Promise<Buffer> {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http(s) image URLs are allowed");
  }

  const res = await fetch(url, {
    headers: { "User-Agent": "ALINKS-Media/1.0" },
    signal: AbortSignal.timeout(20000),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Failed to download image (${res.status})`);

  const ct = res.headers.get("content-type") ?? "";
  if (ct && !ct.startsWith("image/") && !ct.includes("octet-stream")) {
    throw new Error("URL is not an image");
  }

  const ab = await res.arrayBuffer();
  if (ab.byteLength > 25 * 1024 * 1024) {
    throw new Error("Image too large (max 25MB source)");
  }
  return Buffer.from(ab);
}
