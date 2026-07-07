import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { ThemeScript } from "@/components/shared/theme-script";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALINKS — Mini websites for Indian businesses",
  description: "India-first multi-tenant mini-website SaaS for small businesses.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ALINKS",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#5b21b6" },
    { media: "(prefers-color-scheme: dark)", color: "#120e1c" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-w-0 overflow-x-hidden antialiased">
        <ThemeScript />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}