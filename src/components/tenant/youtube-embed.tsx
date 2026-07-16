import { parseYoutubeUrl } from "@/core/utils/youtube";

/**
 * YouTube-only embed. Never accepts non-YouTube URLs (product lock).
 */
export function YoutubeEmbed({
  url,
  title = "YouTube video",
  className = "",
}: {
  url: string;
  title?: string;
  className?: string;
}) {
  const parsed = parseYoutubeUrl(url);
  if (!parsed.ok) {
    return (
      <p className="t-muted text-xs">
        Invalid video — YouTube links only.{" "}
        <a href="https://youtube.com" className="underline" target="_blank" rel="noopener noreferrer">
          Open YouTube
        </a>
      </p>
    );
  }

  return (
    <div className={className}>
      <div
        className="relative w-full overflow-hidden rounded-xl bg-black"
        style={{ paddingBottom: "56.25%" }}
      >
        <iframe
          title={title}
          src={parsed.embedUrl}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <a
        href={parsed.watchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="t-muted mt-1.5 inline-block text-[11px] font-semibold underline"
      >
        Watch on YouTube
      </a>
    </div>
  );
}
