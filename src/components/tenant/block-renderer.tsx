import type { BusinessProfile } from "@/core/types/business-profile";
import type { PageBlock } from "@/core/types/page";
import { resolveBlockWithProfile } from "@/core/utils/resolve-block-profile";
import { whatsappUrl } from "@/core/utils/business-profile";

/** Public mobile stack card for one section widget. */
export function BlockRenderer({
  block: rawBlock,
  primaryColor,
  handle,
  profile,
}: {
  block: PageBlock;
  primaryColor: string;
  handle?: string;
  /** Business profile — fills WhatsApp/contact when widget fields empty */
  profile?: BusinessProfile | null;
}) {
  const block = resolveBlockWithProfile(rawBlock, profile);
  if (block.visible === false) return null;

  const data = block.data ?? {};
  // Compact Linktree cards — smaller type + padding so stack has breathing room
  const card =
    "rounded-2xl border border-black/[0.05] bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_6px_16px_-10px_rgba(0,0,0,0.1)]";
  const titleCls = "text-sm font-semibold tracking-tight text-slate-900";
  const bodyCls = "mt-1 text-xs leading-relaxed text-slate-500";

  switch (block.type) {
    case "link": {
      const href = data.href || "#";
      const label = data.buttonLabel || block.title || "Open link";
      return (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          className={`${card} block py-2.5 text-center text-sm font-semibold tracking-tight text-white active:scale-[0.98]`}
          style={{ backgroundColor: primaryColor }}
        >
          {label}
        </a>
      );
    }

    case "whatsapp": {
      const phone = data.phone || "";
      const href = phone ? whatsappUrl(phone, data.message) : "#";
      const missing = !phone;
      return (
        <a
          href={missing ? undefined : href}
          target={missing ? undefined : "_blank"}
          rel="noreferrer"
          className={`${card} flex flex-col items-center gap-0.5 py-2.5 text-center active:scale-[0.98] ${missing ? "opacity-60 pointer-events-none" : ""}`}
          style={{ backgroundColor: "#25D366", color: "#fff" }}
        >
          <span className="text-sm font-semibold tracking-tight">{block.title || "WhatsApp"}</span>
          {block.body ? <span className="text-[11px] text-white/90">{block.body}</span> : null}
          {missing ? (
            <span className="text-[10px] text-white/80">Add WhatsApp in Business profile</span>
          ) : null}
        </a>
      );
    }

    case "cta": {
      let href = data.href || "/contact";
      if (handle && href.startsWith("/") && !href.startsWith("//")) {
        // Site-relative path on public mini-site
        href = href === "/" ? `/${handle}` : `/${handle}${href}`;
      }
      return (
        <section className={`${card} text-center`}>
          <h2 className={titleCls}>{block.title}</h2>
          {block.body ? <p className={bodyCls}>{block.body}</p> : null}
          <a
            href={href}
            className="mt-2.5 inline-flex min-h-9 w-full items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {data.buttonLabel || "Continue"}
          </a>
        </section>
      );
    }

    case "services": {
      const items = data.items?.length
        ? data.items
        : [{ name: block.title || "Service", price: "", duration: "", description: block.body }];
      return (
        <section className={card}>
          <h2 className={titleCls}>{block.title}</h2>
          {block.body ? <p className={bodyCls}>{block.body}</p> : null}
          <ul className="mt-2 space-y-1.5">
            {items.map((item, i) => (
              <li
                key={`${item.name}-${i}`}
                className="flex items-start justify-between gap-2 rounded-xl bg-slate-50 px-2.5 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">{item.name}</p>
                  {item.description ? (
                    <p className="mt-0.5 text-[11px] text-slate-500">{item.description}</p>
                  ) : null}
                  {item.duration ? (
                    <p className="mt-0.5 text-[10px] text-slate-400">{item.duration}</p>
                  ) : null}
                </div>
                {item.price ? (
                  <span className="shrink-0 text-xs font-bold" style={{ color: primaryColor }}>
                    {item.price}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      );
    }

    case "hours": {
      const lines = data.lines?.length ? data.lines : block.body ? block.body.split("\n") : [];
      return (
        <section className={card}>
          <h2 className={titleCls}>{block.title || "Hours"}</h2>
          <ul className="mt-1.5 space-y-1 text-xs text-slate-600">
            {lines.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-slate-300">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      );
    }

    case "contact": {
      const hasAny = Boolean(data.phone || data.email || data.address);
      return (
        <section className={card}>
          <h2 className={titleCls}>{block.title}</h2>
          {block.body ? <p className={bodyCls}>{block.body}</p> : null}
          <div className="mt-2 space-y-1.5 text-xs text-slate-700">
            {data.phone ? (
              <a href={`tel:${data.phone.replace(/\D/g, "")}`} className="block font-medium underline">
                📞 {data.phone}
              </a>
            ) : null}
            {data.email ? (
              <a href={`mailto:${data.email}`} className="block underline">
                ✉️ {data.email}
              </a>
            ) : null}
            {data.address ? <p>📍 {data.address}</p> : null}
            {!hasAny ? (
              <p className="text-[11px] text-amber-700">
                No contact details yet — set them in Business profile.
              </p>
            ) : null}
          </div>
        </section>
      );
    }

    case "gallery": {
      const images = data.images?.filter((im) => im.url) ?? [];
      return (
        <section className={card}>
          <h2 className={titleCls}>{block.title}</h2>
          {block.body ? <p className={bodyCls}>{block.body}</p> : null}
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {images.slice(0, 6).map((im, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={im.url}
                alt={im.caption || block.title}
                className="aspect-square w-full rounded-lg object-cover bg-slate-100"
              />
            ))}
            {!images.length ? (
              <p className="col-span-2 text-[11px] text-slate-400">Add photo URLs in the editor.</p>
            ) : null}
          </div>
        </section>
      );
    }

    case "features":
      return (
        <section className={card}>
          <h2 className={titleCls}>{block.title}</h2>
          <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">{block.body}</p>
        </section>
      );

    case "legal":
    case "text":
    default:
      return (
        <section className={card}>
          <h2 className={titleCls}>{block.title}</h2>
          <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">{block.body}</p>
        </section>
      );
  }
}
