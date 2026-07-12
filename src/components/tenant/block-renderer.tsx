import type { CSSProperties } from "react";
import type { BusinessProfile } from "@/core/types/business-profile";
import type { PageBlock } from "@/core/types/page";
import { resolveBlockWithProfile } from "@/core/utils/resolve-block-profile";
import { whatsappUrl } from "@/core/utils/business-profile";
import { LinkButton } from "./link-button";

/**
 * Public + editor stack cards.
 * Always uses theme CSS vars with solid fallbacks so text never washes out
 * (e.g. light ink on white service rows in dark platform chrome).
 */
export function BlockRenderer({
  block: rawBlock,
  primaryColor,
  accentColor,
  handle,
  profile,
}: {
  block: PageBlock;
  primaryColor: string;
  accentColor?: string;
  handle?: string;
  profile?: BusinessProfile | null;
}) {
  const block = resolveBlockWithProfile(rawBlock, profile);
  if (block.visible === false) return null;

  const data = block.data ?? {};
  const primary = primaryColor;
  const accent = accentColor || primaryColor;

  // Explicit theme-aware tokens (CSS var when inside .tenant-theme, else solid fallback)
  const ink = "var(--t-ink, #0f172a)";
  const muted = "var(--t-muted, #64748b)";
  const surface = "var(--t-surface, #ffffff)";
  const soft = "var(--t-soft, rgba(15, 23, 42, 0.06))";
  const border = "var(--t-border, rgba(15, 23, 42, 0.1))";
  const radius = "var(--t-radius, 14px)";
  const radiusSm = "var(--t-radius-sm, 10px)";
  const onPrimary = "var(--t-on-primary, #ffffff)";

  const cardStyle: CSSProperties = {
    backgroundColor: surface,
    color: ink,
    border: `1px solid ${border}`,
    borderRadius: radius,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 6px 16px -10px rgba(0,0,0,0.1)",
  };

  const titleStyle: CSSProperties = {
    fontSize: "0.875rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: ink,
  };

  const bodyStyle: CSSProperties = {
    marginTop: "0.25rem",
    fontSize: "0.75rem",
    lineHeight: 1.5,
    color: muted,
  };

  switch (block.type) {
    case "link": {
      const href = data.href || "#";
      const label = data.buttonLabel || block.title || "Open link";
      return (
        <LinkButton
          href={href}
          label={label}
          linkStyle={data.linkStyle}
          primaryColor={primary}
          accentColor={accent}
        />
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
          className={`flex flex-col items-center gap-0.5 px-3.5 py-2.5 text-center active:scale-[0.98] ${missing ? "pointer-events-none opacity-60" : ""}`}
          style={{
            ...cardStyle,
            backgroundColor: "#25D366",
            color: "#fff",
            borderColor: "transparent",
          }}
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
        <section className="px-3.5 py-3 text-center" style={cardStyle}>
          <h2 style={titleStyle}>{block.title}</h2>
          {block.body ? <p style={bodyStyle}>{block.body}</p> : null}
          <a
            href={href}
            className="mt-2.5 inline-flex min-h-9 w-full items-center justify-center px-3 py-2 text-sm font-semibold"
            style={{
              backgroundColor: primary,
              color: onPrimary,
              borderRadius: radiusSm,
            }}
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
        <section className="px-3.5 py-3" style={cardStyle}>
          <h2 style={titleStyle}>{block.title}</h2>
          {block.body ? <p style={bodyStyle}>{block.body}</p> : null}
          <ul className="mt-2 space-y-1.5">
            {items.map((item, i) => (
              <li
                key={`${item.name}-${i}`}
                className="flex items-start justify-between gap-2 px-2.5 py-2"
                style={{
                  backgroundColor: soft,
                  borderRadius: radiusSm,
                  border: `1px solid ${border}`,
                }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: ink }}>
                    {item.name}
                  </p>
                  {item.description ? (
                    <p className="mt-0.5 text-[11px]" style={{ color: muted }}>
                      {item.description}
                    </p>
                  ) : null}
                  {item.duration ? (
                    <p className="mt-0.5 text-[10px]" style={{ color: muted }}>
                      {item.duration}
                    </p>
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
        <section className="px-3.5 py-3" style={cardStyle}>
          <h2 style={titleStyle}>{block.title || "Hours"}</h2>
          <ul className="mt-1.5 space-y-1 text-xs" style={{ color: muted }}>
            {lines.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span style={{ color: border }}>•</span>
                <span style={{ color: ink }}>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      );
    }

    case "contact": {
      const hasAny = Boolean(data.phone || data.email || data.address);
      return (
        <section className="px-3.5 py-3" style={cardStyle}>
          <h2 style={titleStyle}>{block.title}</h2>
          {block.body ? <p style={bodyStyle}>{block.body}</p> : null}
          <div className="mt-2 space-y-1.5 text-xs" style={{ color: ink }}>
            {data.phone ? (
              <a
                href={`tel:${data.phone.replace(/\D/g, "")}`}
                className="block font-medium underline"
                style={{ color: primary }}
              >
                {data.phone}
              </a>
            ) : null}
            {data.email ? (
              <a href={`mailto:${data.email}`} className="block underline" style={{ color: primary }}>
                {data.email}
              </a>
            ) : null}
            {data.address ? <p style={{ color: ink }}>{data.address}</p> : null}
            {!hasAny ? (
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
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
        <section className="px-3.5 py-3" style={cardStyle}>
          <h2 style={titleStyle}>{block.title}</h2>
          {block.body ? <p style={bodyStyle}>{block.body}</p> : null}
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {images.slice(0, 6).map((im, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={im.url}
                alt={im.caption || block.title}
                className="aspect-square w-full object-cover"
                style={{
                  borderRadius: radiusSm,
                  backgroundColor: soft,
                }}
              />
            ))}
            {!images.length ? (
              <p className="col-span-2 text-[11px]" style={{ color: muted }}>
                Add photo URLs in the editor.
              </p>
            ) : null}
          </div>
        </section>
      );
    }

    case "features":
      return (
        <section className="px-3.5 py-3" style={cardStyle}>
          <h2 style={titleStyle}>{block.title}</h2>
          <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed" style={{ color: muted }}>
            {block.body}
          </p>
        </section>
      );

    case "legal":
    case "text":
    default:
      return (
        <section className="px-3.5 py-3" style={cardStyle}>
          <h2 style={titleStyle}>{block.title}</h2>
          <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed" style={{ color: muted }}>
            {block.body}
          </p>
        </section>
      );
  }
}
