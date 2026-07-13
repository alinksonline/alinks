import Image from "next/image";

const features = [
  {
    id: "builder",
    title: "Website builder",
    desc: "Edit Home, About, Services, Contact & more. Theme, branding, and publish gates built in.",
    image: "/assets/marketing/feature-builder.jpg",
  },
  {
    id: "checkout",
    title: "Store & checkout",
    desc: "UPI, cards, and COD for Indian shoppers. Orders land in your Google Sheet — not our database.",
    image: "/assets/marketing/feature-checkout.jpg",
  },
  {
    id: "share",
    title: "Tap & Blast",
    desc: "Share products and packages on WhatsApp and Instagram with QR codes and short links.",
    image: "/assets/marketing/feature-share-blast.jpg",
  },
  {
    id: "booking",
    title: "Appointments",
    desc: "Salon packages with pay-then-book. Clinic slots with license gates when you need them.",
    image: "/assets/marketing/feature-booking.jpg",
  },
  {
    id: "ai",
    title: "ALINKS AI",
    desc: "SEO titles, product descriptions, and share captions — tuned for Indian SMBs.",
    image: "/assets/marketing/feature-ai.jpg",
  },
  {
    id: "privacy",
    title: "Your data, your sheet",
    desc: "Customer PII stays in tenant Google Sheets or your Supabase. Platform DB holds config only.",
    image: "/assets/marketing/feature-privacy.jpg",
  },
];

export function FeaturesSection() {
  return (
    <section className="border-t border-brand-ink/[0.06] bg-brand-surface py-10">
      <div className="app-container">
        <p className="premium-label">Everything included</p>
        <h2 className="premium-heading mt-2">Built for owners who work on their phone</h2>
        <p className="premium-subtext mt-3">One app. Five pages. Real commerce — not a link-in-bio toy.</p>

        <div className="mt-8 space-y-4">
          {features.map((f) => (
            <article key={f.id} className="premium-card overflow-hidden">
              <div className="relative aspect-[16/9] w-full">
                <Image src={f.image} alt="" fill className="object-cover" sizes="430px" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/50 to-transparent" />
                <h3 className="absolute bottom-3 left-4 font-display text-lg font-bold text-white">{f.title}</h3>
              </div>
              <p className="px-4 py-4 text-sm leading-relaxed text-brand-ink/70">{f.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}