import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALINKS — Mini websites for Indian businesses",
  description: "India-first multi-tenant mini-website SaaS for small businesses.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-w-0 overflow-x-hidden">{children}</body>
    </html>
  );
}