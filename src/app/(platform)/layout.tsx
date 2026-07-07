import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { MobileAppShell } from "@/components/shared/mobile-app-shell";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${jakarta.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
      <MobileAppShell variant="platform">{children}</MobileAppShell>
    </div>
  );
}