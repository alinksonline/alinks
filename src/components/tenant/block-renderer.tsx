import type { BusinessProfile } from "@/core/types/business-profile";
import type { PageBlock } from "@/core/types/page";
import { resolveBlockWithProfile } from "@/core/utils/resolve-block-profile";
import { whatsappUrl } from "@/core/utils/business-profile";

/** Public mobile stack card — uses tenant theme CSS vars when inside `.tenant-theme`. */
export function BlockRenderer({
  block: rawBlock,
  primaryColor,
  handle,
  profile,
}: {
  block: PageBlock;
  /** Fallback if CSS vars unavailable (e.g. editor preview) */
  primaryColor: string;
  handle?: string;
  profile?: BusinessProfile | null;
}) {
  const block = resolveBlockWithProfile(rawBlock, profile);
  if (block.visible === false) return null;

  const data = block.data ?? {};
  const primary = "var(--t-primary, " + primaryColor + ")";
  const card = "t-card px-3.5 py-3";
  const titleCls = "text-sm font-semibold tracking-tight t-ink";
  const bodyCls = "mt-1 text-xs leading-relaxed t-muted";

  switch (block.type) {
    case "link": {
      const href = data.href || "#";
      const label = data.buttonLabel || block.title || "Open link";
      return (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          className={`${card} block py-2.5 text-center text-sm font-semibold tracking-tight active:scale-[0.98]`}
          style={{
            backgroundColor: primary,
            color: "var(--t-on-primary, #fff)",
            borderColor: "transparent",
          }}
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
          className={`${card} flex flex-col items-center gap-0.5 py-2.5 text-center active:scale-[0.98] ${missing ? "pointer-events-none opacity-60" : ""}`}
          style={{ backgroundColor: "#25D366", color: "#fff", borderColor: "transparent" }}
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
        href = href === "/" ? `/${handle}` : `/${handle}${href}`;
      }
      return (
        <section className={`${card} text-center`}>
          <h2 className={titleCls}>{block.title}</h2>
          {block.body ? <p className={bodyCls}>{block.body}</p> : null}
          <a
            href={href}
            className="t-btn-primary mt-2.5"
            style={{ backgroundColor: primary, color: "var(--t-on-primary, #fff)" }}
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
                className="flex items-start justify-between gap-2 rounded-[var(--t-radius-sm,0.75rem)] px-2.5 py-2"
                style={{ backgroundColor: "var(--t-soft, #f8fafc)" }}
              >
                <div className="min-w-0">
                  <p className="t-ink text-sm font-medium">{item.name}</p>
                  {item.description ? (
                    <p className="t-muted mt-0.5 text-[11px]">{item.description}</p>
                  ) : null}
                  {item.duration ? (
                    <p className="t-muted mt-0.5 text-[10px]">{item.duration}</p>
                  ) : null}
                </div>
                {item.price ? (
                  <span className="shrink-0 text-xs font-bold" style={{ color: primary }}>
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
          <ul className="t-muted mt-1.5 space-y-1 text-xs">
            {lines.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span style={{ color: "var(--t-border)" }}>•</span>
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
          <div className="mt-2 space-y-1.5 text-xs" style={{ color: "var(--t-ink)" }}>
            {data.phone ? (
              <a href={`tel:${data.phone.replace(/\D/g, "")}`} className="t-link block font-medium">
                📞 {data.phone}
              </a>
            ) : null}
            {data.email ? (
              <a href={`mailto:${data.email}`} className="t-link block">
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
                className="aspect-square w-full object-cover"
                style={{
                  borderRadius: "var(--t-radius-sm, 0.5rem)",
                  backgroundColor: "var(--t-soft)",
                }}
              />
            ))}
            {!images.length ? (
              <p className="t-muted col-span-2 text-[11px]">Add photo URLs in the editor.</p>
            ) : null}
          </div>
        </section>
      );
    }

    case "features":
      return (
        <section className={card}>
          <h2 className={titleCls}>{block.title}</h2>
          <p className="t-muted mt-1.5 whitespace-pre-wrap text-xs leading-relaxed">{block.body}</p>
        </section>
      );

    case "legal":
    case "text":
    default:
      return (
        <section className={card}>
          <h2 className={titleCls}>{block.title}</h2>
          <p className="t-muted mt-1.5 whitespace-pre-wrap text-xs leading-relaxed">{block.body}</p>
        </section>
      );
  }
}
