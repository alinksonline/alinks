import sharp from "sharp";

const MAX_EDGE = 4096; // retain full res up to 4k edge; only shrink if larger
const WEBP_QUALITY = 90; // high quality — max compression without visible loss

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
 * - WebP quality 90 for small files with near-full fidelity
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

  const buffer = await pipeline
    .webp({
      quality: WEBP_QUALITY,
      effort: 4,
      smartSubsample: true,
    })
    .toBuffer();

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
