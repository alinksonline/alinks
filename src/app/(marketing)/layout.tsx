import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
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

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${jakarta.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
      <MobileAppShell variant="marketing">
        <MarketingHeader />
        {children}
        <MarketingFooter />
      </MobileAppShell>
    </div>
  );
}