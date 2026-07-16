import { describe, expect, it } from "vitest";
import { isYoutubeUrl, parseYoutubeUrl } from "./youtube";

describe("parseYoutubeUrl", () => {
  it("accepts watch, short, and bare id", () => {
    expect(parseYoutubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ").ok).toBe(true);
    expect(parseYoutubeUrl("https://youtu.be/dQw4w9WgXcQ").ok).toBe(true);
    expect(parseYoutubeUrl("dQw4w9WgXcQ").ok).toBe(true);
    const p = parseYoutubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    if (p.ok) {
      expect(p.videoId).toBe("dQw4w9WgXcQ");
      expect(p.embedUrl).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
    }
  });

  it("rejects non-YouTube hosts", () => {
    expect(parseYoutubeUrl("https://vimeo.com/123").ok).toBe(false);
    expect(parseYoutubeUrl("https://drive.google.com/file/d/x/view").ok).toBe(false);
    expect(isYoutubeUrl("https://example.com/video.mp4")).toBe(false);
  });
});
