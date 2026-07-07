import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { MobileAppShell } from "@/components/shared/mobile-app-shell";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${jakarta.variable} font-sans antialiased`}>
      <MobileAppShell variant="tenant">{children}</MobileAppShell>
    </div>
  );
}