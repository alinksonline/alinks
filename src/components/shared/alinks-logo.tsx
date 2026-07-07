/** Natural asset ratio: 5000 × 2141 */
const LOGO_ASPECT = 5000 / 2141;

export type AlinksLogoProps = {
  height?: number;
  className?: string;
  priority?: boolean;
  variant?: "light" | "dark";
};

export function AlinksLogo({ height = 32, className, priority, variant = "light" }: AlinksLogoProps) {
  const src =
    variant === "dark"
      ? "/assets/LOGO-for-darck-backgrounds.png"
      : "/assets/LOGO-for-light-backgrounds.png";

  return (
    // Native img avoids Next/Image aspect-ratio warnings for CSS-sized logos
    <img
      src={src}
      alt="ALINKS"
      width={Math.round(height * LOGO_ASPECT)}
      height={height}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={className}
      style={{ height: `${height}px`, width: "auto" }}
    />
  );
}