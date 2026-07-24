"use client";

import Image from "next/image";
import { useTheme } from "@/components/shared/theme-provider";
import { useEffect, useState } from "react";

const features = [
  {
    id: "builder",
    title: "Website builder",
    desc: "Edit Home, About, Services, Contact & more. Theme, branding, and publish gates built in.",
    imageDark: "/assets/marketing/feature-builder-dark.webp",
    imageLight: "/assets/marketing/feature-builder.jpg",
  },
  {
    id: "checkout",
    title: "Store & checkout",
    desc: "UPI, cards, and COD for Indian shoppers. Orders land in your Google Sheet — not our database.",
    imageDark: "/assets/marketing/feature-checkout-dark.webp",
    imageLight: "/assets/marketing/feature-checkout.jpg",
  },
  {
    id: "share",
    title: "Tap & Blast",
    desc: "Share products and packages on WhatsApp and Instagram with QR codes and short links.",
    imageDark: "/assets/marketing/feature-share-dark.webp",
    imageLight: "/assets/marketing/feature-share-blast.jpg",
  },
  {
    id: "booking",
    title: "Appointments",
    desc: "Salon packages with pay-then-book. Clinic slots with license gates when you need them.",
    imageDark: "/assets/marketing/feature-booking-dark.webp",
    imageLight: "/assets/marketing/feature-booking.jpg",
  },
  {
    id: "ai",
    title: "ALINKS AI",
    desc: "SEO titles, product descriptions, and share captions — tuned for Indian SMBs.",
    imageDark: "/assets/marketing/feature-ai-dark.webp",
    imageLight: "/assets/marketing/feature-ai.jpg",
  },
  {
    id: "privacy",
    title: "Your data, your sheet",
    desc: "Customer PII stays in tenant Google Sheets or your Supabase. Platform DB holds config only.",
    imageDark: "/assets/marketing/feature-privacy-dark.webp",
    imageLight: "/assets/marketing/feature-privacy.jpg",
  },
];

export function FeaturesSection() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <section className="border-t border-brand-ink/5 dark:border-white/5 bg-brand-surface dark:bg-[#08080c] py-16 transition-colors">
      <div className="app-container">
        <div className="mb-4 inline-block rounded-full border border-brand-purple/20 dark:border-brand-purple/30 bg-brand-purple/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-purple dark:text-brand-purple-light">
          Everything included
        </div>
        <h2 className="mb-3 font-display text-3xl font-bold text-brand-ink dark:text-white">
          Built for owners who work on their phone
        </h2>
        <p className="mb-10 text-sm leading-relaxed text-stone-600 dark:text-zinc-400">
          One app. Five pages. Real commerce — not a link-in-bio toy.
        </p>

        <div className="space-y-6">
          {features.map((f) => (
            <article
              key={f.id}
              className="relative overflow-hidden rounded-3xl border border-brand-ink/10 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-md transition-all hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full border-b border-brand-ink/5 dark:border-white/10">
                <Image src={isDark ? f.imageDark : f.imageLight} alt={f.title} fill className="object-cover" sizes="430px" />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80 dark:from-[#08080c]"
                  aria-hidden
                />
              </div>
              <div className="p-5">
                <h3 className="mb-2 font-display text-xl font-bold text-brand-ink dark:text-white drop-shadow-sm dark:drop-shadow-md">
                  {f.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-stone-600 dark:text-zinc-400">{f.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
