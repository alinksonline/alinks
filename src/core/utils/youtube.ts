/**
 * Education / site video: YouTube ONLY (industries-docs/education/08).
 * Reject Vimeo, Drive, raw mp4, arbitrary iframes.
 */

const YT_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

export type YoutubeParseResult =
  | { ok: true; videoId: string; watchUrl: string; embedUrl: string }
  | { ok: false; error: string };

/** Extract 11-char YouTube video id from common URL shapes. */
export function parseYoutubeUrl(input: string): YoutubeParseResult {
  const raw = input.trim();
  if (!raw) {
    return { ok: false, error: "Paste a YouTube link only" };
  }

  // Bare id (optional convenience)
  if (/^[\w-]{11}$/.test(raw)) {
    return {
      ok: true,
      videoId: raw,
      watchUrl: `https://www.youtube.com/watch?v=${raw}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${raw}`,
    };
  }

  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return { ok: false, error: "Paste a YouTube link only" };
  }

  const host = url.hostname.toLowerCase();
  if (!YT_HOSTS.has(host)) {
    return {
      ok: false,
      error: "YouTube only — Vimeo, Drive, and other video hosts are not allowed",
    };
  }

  let videoId: string | null = null;

  if (host === "youtu.be" || host === "www.youtu.be") {
    videoId = url.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (url.pathname.startsWith("/embed/")) {
    videoId = url.pathname.split("/")[2] ?? null;
  } else if (url.pathname.startsWith("/shorts/")) {
    videoId = url.pathname.split("/")[2] ?? null;
  } else if (url.pathname.startsWith("/live/")) {
    videoId = url.pathname.split("/")[2] ?? null;
  } else {
    videoId = url.searchParams.get("v");
  }

  if (!videoId || !/^[\w-]{11}$/.test(videoId)) {
    return { ok: false, error: "Could not read a YouTube video id from that link" };
  }

  return {
    ok: true,
    videoId,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
  };
}

export function isYoutubeUrl(input: string): boolean {
  return parseYoutubeUrl(input).ok;
}
