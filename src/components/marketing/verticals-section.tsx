import Image from "next/image";
import Link from "next/link";

const verticals = [
  {
    code: "salon",
    label: "Salon & Beauty",
    desc: "Packages, pay-then-book, staff roster",
    image: "/assets/marketing/marketing_salon_1783948687465.png",
    href: "/demo/book",
  },
  {
    code: "kirana",
    label: "Kirana & Retail",
    desc: "Catalog, UPI checkout, COD toggle",
    image: "/assets/marketing/marketing_kirana_1783948711052.png",
    href: "/demo/store",
  },
  {
    code: "clinic",
    label: "Clinic & Doctors",
    desc: "Doctor slots, license gate, patient flow",
    image: "/assets/marketing/marketing_clinic_1783948738180.png",
    href: "/demo",
  },
];

export function VerticalsSection() {
  return (
    <section className="bg-transparent py-24 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-purple/10 via-black to-black pointer-events-none" />
      
      <div className="app-container relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-turquoise mb-3">Templates</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">Pick your vertical</h2>
          <p className="text-lg text-white/60">
            Pre-built page graphs — customize copy, photos, and theme in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {verticals.map((v) => (
            <Link key={v.code} href={v.href} className="group relative block overflow-hidden rounded-[2rem] glass-panel transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(124,58,237,0.3)]">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/50">
                <Image 
                  src={v.image} 
                  alt={v.label} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105 group-hover:rotate-1" 
                  sizes="(max-width: 768px) 100vw, 33vw" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
              </div>
              <div className="absolute bottom-0 left-0 w-full px-6 py-8">
                <div className="inline-block px-3 py-1 mb-3 rounded-full bg-brand-turquoise/20 border border-brand-turquoise/30 backdrop-blur-md">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-brand-turquoise">{v.code}</p>
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-2">{v.label}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{v.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}