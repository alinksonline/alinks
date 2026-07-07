import Image from "next/image";

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

  const width = Math.round(height * LOGO_ASPECT);

  return (
    <Image
      src={src}
      alt="ALINKS"
      width={width}
      height={height}
      priority={priority}
      className={className}
      style={{ height: `${height}px`, width: "auto" }}
    />
  );
}