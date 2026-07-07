import type { ReactNode } from "react";
import { cn } from "@/core/utils/cn";

type AbstractBgProps = {
  variant?: "grid" | "mesh" | "lines" | "dots";
  className?: string;
  children?: ReactNode;
};

export function AbstractBg({ variant = "grid", className, children }: AbstractBgProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {variant === "grid" && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(148 163 184 / 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgb(148 163 184 / 0.15) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      )}
      {variant === "mesh" && (
        <>
          <div className="pointer-events-none absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-slate-200/40 blur-[120px]" />
          <div className="pointer-events-none absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-slate-300/30 blur-[100px]" />
        </>
      )}
      {variant === "lines" && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="diag" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <line x1="0" y1="0" x2="0" y2="40" stroke="currentColor" strokeWidth="1" className="text-slate-900" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diag)" />
        </svg>
      )}
      {variant === "dots" && (
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle, rgb(100 116 139 / 0.4) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      )}
      {children}
    </div>
  );
}