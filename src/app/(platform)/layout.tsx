import { Inter, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

/** Platform surface shell — auth enforced in (authenticated) subgroup only */
export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${inter.variable} ${jetbrainsMono.variable} min-h-screen bg-slate-50 font-sans antialiased`}>
      {children}
    </div>
  );
}