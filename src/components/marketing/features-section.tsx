import Image from "next/image";

const features = [
  {
    id: "builder",
    title: "Website builder",
    desc: "Edit Home, About, Services, Contact & more. Theme, branding, and publish gates built in.",
    image: "/assets/marketing/feature-builder-dark.webp",
  },
  {
    id: "checkout",
    title: "Store & checkout",
    desc: "UPI, cards, and COD for Indian shoppers. Orders land in your Google Sheet — not our database.",
    image: "/assets/marketing/feature-checkout-dark.webp",
  },
  {
    id: "share",
    title: "Tap & Blast",
    desc: "Share products and packages on WhatsApp and Instagram with QR codes and short links.",
    image: "/assets/marketing/feature-share-dark.webp",
  },
  {
    id: "booking",
    title: "Appointments",
    desc: "Salon packages with pay-then-book. Clinic slots with license gates when you need them.",
    image: "/assets/marketing/feature-booking-dark.webp",
  },
  {
    id: "ai",
    title: "ALINKS AI",
    desc: "SEO titles, product descriptions, and share captions — tuned for Indian SMBs.",
    image: "/assets/marketing/feature-ai-dark.webp",
  },
  {
    id: "privacy",
    title: "Your data, your sheet",
    desc: "Customer PII stays in tenant Google Sheets or your Supabase. Platform DB holds config only.",
    image: "/assets/marketing/feature-privacy-dark.webp",
  },
];

export function FeaturesSection() {
  return (
    <section className="border-t border-white/5 bg-[#08080c] py-16">
      <div className="app-container">
        <div className="mb-4 inline-block rounded-full border border-brand-purple/30 bg-brand-purple/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-purple-light">
          Everything included
        </div>
        <h2 className="mb-3 font-display text-3xl font-bold text-white">
          Built for owners who work on their phone
        </h2>
        <p className="mb-10 text-sm leading-relaxed text-zinc-400">
          One app. Five pages. Real commerce — not a link-in-bio toy.
        </p>

        <div className="space-y-6">
          {features.map((f) => (
            <article
              key={f.id}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-md"
            >
              <div className="relative aspect-[4/3] w-full border-b border-white/10">
                <Image src={f.image} alt={f.title} fill className="object-cover" sizes="430px" />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-transparent to-transparent opacity-80"
                  aria-hidden
                />
              </div>
              <div className="p-5">
                <h3 className="mb-2 font-display text-xl font-bold text-white drop-shadow-md">
                  {f.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-zinc-400">{f.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
