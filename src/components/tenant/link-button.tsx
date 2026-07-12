import type { LinkButtonStyle } from "@/core/types/link-button-style";
import { LinkGlyphIcon } from "@/components/editor/widget-icons";
import { resolveLinkButtonCss } from "@/core/utils/link-button-style";
import { mergeLinkStyle } from "@/core/utils/link-button-style";

/** Themed link stack button with thickness, fill, corners, border, optional icon. */
export function LinkButton({
  href,
  label,
  linkStyle,
  primaryColor,
  accentColor,
  className,
}: {
  href: string;
  label: string;
  linkStyle?: LinkButtonStyle;
  primaryColor: string;
  accentColor?: string;
  className?: string;
}) {
  const accent = accentColor || primaryColor;
  const { style, className: baseCls } = resolveLinkButtonCss(linkStyle, primaryColor, accent);
  const s = mergeLinkStyle(linkStyle);
  const side = s.iconSide ?? "right";

  const iconEl =
    s.iconKind === "image" && s.iconUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={s.iconUrl}
        alt=""
        className="h-[18px] w-[18px] shrink-0 rounded object-cover"
      />
    ) : s.iconKind === "icon" && s.iconName ? (
      <LinkGlyphIcon name={s.iconName} size={18} className="opacity-95" />
    ) : null;

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className={[baseCls, "relative", className].filter(Boolean).join(" ")}
      style={style}
    >
      {iconEl && side === "left" ? (
        <span className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center">{iconEl}</span>
      ) : null}
      <span className="min-w-0 truncate px-6 text-center">{label}</span>
      {iconEl && side === "right" ? (
        <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center">{iconEl}</span>
      ) : null}
    </a>
  );
}
