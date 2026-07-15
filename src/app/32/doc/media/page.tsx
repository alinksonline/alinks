import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "ALINKS media kit",
  description: "Download ALINKS and Artix logos for partner and press use.",
  robots: { index: false, follow: false },
};

const assets = [
  {
    name: "ALINKS logo (dark backgrounds)",
    use: "On dark UI, black, or photo backgrounds",
    href: "/assets/LOGO-for-darck-backgrounds.png",
    preview: "/assets/LOGO-for-darck-backgrounds.png",
    bg: "bg-[#0a0a0a]",
  },
  {
    name: "ALINKS logo (light backgrounds)",
    use: "On white or light cream backgrounds",
    href: "/assets/LOGO-for-light-backgrounds.png",
    preview: "/assets/LOGO-for-light-backgrounds.png",
    bg: "bg-zinc-100",
  },
  {
    name: "ALINKS / app icon (favicon)",
    use: "App icon, favicon, small square placements",
    href: "/favicon.png",
    preview: "/favicon.png",
    bg: "bg-zinc-900",
  },
  {
    name: "Artix wordmark",
    use: "Parent company credit (Artix)",
    href: "/assets/artix-logo.png",
    preview: "/assets/artix-logo.png",
    bg: "bg-black",
  },
] as const;

/**
 * Unlisted media kit for partner applications (Supabase, etc.).
 * URL: https://alinks.online/32/doc/media
 */
export default function MediaKitPage() {
  return (
    <article className="space-y-8 text-[15px] leading-relaxed text-zinc-300">
      <header className="space-y-3 border-b border-white/10 pb-8">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-400/90">
          Media kit
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white">ALINKS brand assets</h1>
        <p className="max-w-xl text-zinc-400">
          Official logos for partner directories, integrations, and co-marketing. Right-click or use
          Download. Not linked from the public marketing site.
        </p>
        <p className="font-mono text-[11px] text-zinc-500">
          https://alinks.online/32/doc/media
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">Logos</h2>
        <ul className="space-y-4">
          {assets.map((a) => (
            <li
              key={a.href}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
            >
              <div className={`flex min-h-[100px] items-center justify-center p-6 ${a.bg}`}>
                <Image
                  src={a.preview}
                  alt={a.name}
                  width={280}
                  height={80}
                  className="h-auto max-h-16 w-auto max-w-[80%] object-contain"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">{a.name}</p>
                  <p className="text-[12px] text-zinc-500">{a.use}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-zinc-600">{a.href}</p>
                </div>
                <a
                  href={a.href}
                  download
                  className="shrink-0 rounded-full bg-teal-500/20 px-4 py-2 text-xs font-bold text-teal-300 ring-1 ring-teal-500/30 hover:bg-teal-500/30"
                >
                  Download
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[13px] text-zinc-400">
        <p className="font-semibold text-white">Usage</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Use the dark-background logo on dark UIs; light-background logo on light UIs.</li>
          <li>Do not recolor, stretch, or add effects to the wordmark.</li>
          <li>Product name: <strong className="text-zinc-200">ALINKS</strong> · Company:{" "}
            <strong className="text-zinc-200">Artix</strong>.</li>
        </ul>
      </section>

      <section className="text-[12px] text-zinc-500">
        <p className="font-semibold text-zinc-400">Related</p>
        <p className="mt-1">
          Supabase integration:{" "}
          <a href="/32/doc/supabase" className="text-teal-400 underline">
            /32/doc/supabase
          </a>
        </p>
      </section>
    </article>
  );
}
