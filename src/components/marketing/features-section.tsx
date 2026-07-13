import Image from "next/image";

const features = [
  {
    id: "builder",
    title: "Website Builder",
    desc: "Drag, drop, and publish. Theme, branding, and publish gates built in.",
    image: "/assets/marketing/marketing_builder.png",
    colSpan: "md:col-span-2",
  },
  {
    id: "checkout",
    title: "Store & Checkout",
    desc: "UPI, cards, and COD for Indian shoppers. Orders land in your Google Sheet.",
    image: "/assets/marketing/marketing_checkout.png",
    colSpan: "md:col-span-1",
  },
  {
    id: "share",
    title: "Tap & Blast",
    desc: "Share products and packages on WhatsApp and Instagram with QR codes.",
    image: "/assets/marketing/marketing_share.png",
    colSpan: "md:col-span-1",
  },
  {
    id: "booking",
    title: "Appointments",
    desc: "Salon packages with pay-then-book. Clinic slots with license gates.",
    image: "/assets/marketing/marketing_booking.png",
    colSpan: "md:col-span-2",
  },
  {
    id: "ai",
    title: "ALINKS AI",
    desc: "SEO titles, product descriptions, and share captions — tuned for Indian SMBs.",
    image: "/assets/marketing/marketing_ai.png",
    colSpan: "md:col-span-2",
  },
  {
    id: "privacy",
    title: "Your Data, Your Sheet",
    desc: "Customer PII stays in your Google Sheets. Platform DB holds config only.",
    image: "/assets/marketing/marketing_privacy.png",
    colSpan: "md:col-span-1",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative overflow-hidden py-24 bg-transparent border-t border-white/5">
      <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-brand-turquoise/10 to-transparent pointer-events-none opacity-50" />
      
      <div className="app-container relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-turquoise mb-3">Everything included</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
            Built for owners who work on their phone
          </h2>
          <p className="text-lg text-white/60">
            One app. Five pages. Real commerce — not a link-in-bio toy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <article 
              key={f.id} 
              className={`group relative overflow-hidden rounded-3xl glass-panel p-1 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-purple/20 hover:-translate-y-1 ${f.colSpan}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative h-64 md:h-72 w-full rounded-[1.35rem] overflow-hidden bg-black/40 mb-2">
                <Image 
                  src={f.image} 
                  alt={f.title} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  sizes="(max-width: 768px) 100vw, 50vw" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent opacity-80" />
              </div>
              
              <div className="px-6 py-5 relative z-10">
                <h3 className="font-display text-xl font-bold text-white mb-2 group-hover:text-brand-turquoise transition-colors">{f.title}</h3>
                <p className="text-sm leading-relaxed text-white/60">{f.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}