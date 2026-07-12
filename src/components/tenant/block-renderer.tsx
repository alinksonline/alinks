import type { ReactNode } from "react";
import type { BusinessProfile } from "@/core/types/business-profile";
import type { PageBlock } from "@/core/types/page";
import { resolveBlockWithProfile } from "@/core/utils/resolve-block-profile";
import { whatsappUrl } from "@/core/utils/business-profile";
import { resolveSectionCardCss } from "@/core/utils/section-style";
import { LinkButton } from "./link-button";

function CardShell({
  sectionCss,
  children,
}: {
  sectionCss: ReturnType<typeof resolveSectionCardCss>;
  children: ReactNode;
}) {
  return (
    <section style={sectionCss.card}>
      {sectionCss.overlay ? <div aria-hidden style={sectionCss.overlay} /> : null}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </section>
  );
}

/**
 * Public + editor stack cards.
 * Card widgets use sectionStyle (styling + layout); link uses linkStyle.
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
  const sectionCss = resolveSectionCardCss(data.sectionStyle, primary, accent);

  // Respect layout preset (Pulse–Bloom) for non-card wrappers
  const layoutWrap = (node: ReactNode) => {
    const width = sectionCss.card.width;
    const marginLeft = sectionCss.card.marginLeft;
    const marginRight = sectionCss.card.marginRight;
    return (
      <div style={{ width: width ?? "100%", marginLeft, marginRight }}>
        {node}
      </div>
    );
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
      const pad = data.sectionStyle?.padding;
      const py = pad === "compact" ? "0.45rem" : pad === "roomy" ? "0.9rem" : "0.65rem";
      return layoutWrap(
        <a
          href={missing ? undefined : href}
          target={missing ? undefined : "_blank"}
          rel="noreferrer"
          className={`flex flex-col items-center gap-0.5 px-3.5 text-center active:scale-[0.98] ${missing ? "pointer-events-none opacity-60" : ""}`}
          style={{
            backgroundColor: "#25D366",
            color: "#fff",
            borderRadius: sectionCss.card.borderRadius,
            paddingTop: py,
            paddingBottom: py,
            border: "none",
          }}
        >
          <span className="text-sm font-semibold tracking-tight">{block.title || "WhatsApp"}</span>
          {block.body ? <span className="text-[11px] text-white/90">{block.body}</span> : null}
          {missing ? (
            <span className="text-[10px] text-white/80">Add WhatsApp in Business profile</span>
          ) : null}
        </a>,
      );
    }

    case "cta": {
      let href = data.href || "/contact";
      if (handle && href.startsWith("/") && !href.startsWith("//")) {
        href = href === "/" ? `/${handle}` : `/${handle}${href}`;
      }
      return (
        <CardShell sectionCss={sectionCss}>
          <h2 style={sectionCss.title}>{block.title}</h2>
          {block.body ? <p style={sectionCss.body}>{block.body}</p> : null}
          <a
            href={href}
            className="mt-2.5 inline-flex min-h-9 w-full items-center justify-center px-3 py-2 text-sm font-semibold"
            style={{
              backgroundColor: primary,
              color: "var(--t-on-primary, #fff)",
              borderRadius: "var(--t-radius-sm, 10px)",
            }}
          >
            {data.buttonLabel || "Continue"}
          </a>
        </CardShell>
      );
    }

    case "services": {
      const items = data.items?.length
        ? data.items
        : [{ name: block.title || "Service", price: "", duration: "", description: block.body }];
      return (
        <CardShell sectionCss={sectionCss}>
          <h2 style={sectionCss.title}>{block.title}</h2>
          {block.body ? <p style={sectionCss.body}>{block.body}</p> : null}
          <ul className="mt-2 space-y-1.5">
            {items.map((item, i) => (
              <li
                key={`${item.name}-${i}`}
                className="flex items-start justify-between gap-2 px-2.5 py-2"
                style={sectionCss.row}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={sectionCss.title}>
                    {item.name}
                  </p>
                  {item.description ? (
                    <p className="mt-0.5 text-[11px]" style={sectionCss.body}>
                      {item.description}
                    </p>
                  ) : null}
                  {item.duration ? (
                    <p className="mt-0.5 text-[10px]" style={sectionCss.body}>
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
        </CardShell>
      );
    }

    case "hours": {
      const lines = data.lines?.length ? data.lines : block.body ? block.body.split("\n") : [];
      return (
        <CardShell sectionCss={sectionCss}>
          <h2 style={sectionCss.title}>{block.title || "Hours"}</h2>
          <ul className="mt-1.5 space-y-1 text-xs">
            {lines.map((line, i) => (
              <li key={i} className="flex gap-2" style={sectionCss.body}>
                <span aria-hidden>•</span>
                <span style={sectionCss.title}>{line}</span>
              </li>
            ))}
          </ul>
        </CardShell>
      );
    }

    case "contact": {
      const hasAny = Boolean(data.phone || data.email || data.address);
      return (
        <CardShell sectionCss={sectionCss}>
          <h2 style={sectionCss.title}>{block.title}</h2>
          {block.body ? <p style={sectionCss.body}>{block.body}</p> : null}
          <div className="mt-2 space-y-1.5 text-xs">
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
            {data.address ? <p style={sectionCss.title}>{data.address}</p> : null}
            {!hasAny ? (
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                No contact details yet — set them in Business profile.
              </p>
            ) : null}
          </div>
        </CardShell>
      );
    }

    case "gallery": {
      const images = data.images?.filter((im) => im.url) ?? [];
      return (
        <CardShell sectionCss={sectionCss}>
          <h2 style={sectionCss.title}>{block.title}</h2>
          {block.body ? <p style={sectionCss.body}>{block.body}</p> : null}
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {images.slice(0, 6).map((im, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={im.url}
                alt={im.caption || block.title}
                className="aspect-square w-full object-cover"
                style={{
                  borderRadius: "var(--t-radius-sm, 10px)",
                  backgroundColor: "var(--t-soft, rgba(15,23,42,0.06))",
                }}
              />
            ))}
            {!images.length ? (
              <p className="col-span-2 text-[11px]" style={sectionCss.body}>
                Add photo URLs in the editor.
              </p>
            ) : null}
          </div>
        </CardShell>
      );
    }

    case "features":
    case "legal":
    case "text":
    default:
      return (
        <CardShell sectionCss={sectionCss}>
          <h2 style={sectionCss.title}>{block.title}</h2>
          <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed" style={sectionCss.body}>
            {block.body}
          </p>
        </CardShell>
      );
  }
}
