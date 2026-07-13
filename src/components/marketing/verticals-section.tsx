import Image from "next/image";
import Link from "next/link";

const verticals = [
  {
    code: "salon",
    label: "Salon & beauty",
    desc: "Packages, pay-then-book, staff roster",
    image: "/assets/marketing/vertical-salon-dark.webp",
    href: "/demo/book",
  },
  {
    code: "kirana",
    label: "Kirana & retail",
    desc: "Catalog, UPI checkout, COD toggle",
    image: "/assets/marketing/vertical-kirana-dark.webp",
    href: "/demo/store",
  },
  {
    code: "clinic",
    label: "Clinic & doctors",
    desc: "Doctor slots, license gate, patient flow",
    image: "/assets/marketing/vertical-clinic-dark.webp",
    href: "/demo",
  },
];

export function VerticalsSection() {
  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-[#050505] py-16">
      <div
        className="pointer-events-none absolute right-0 top-1/2 h-64 w-64 rounded-full bg-brand-turquoise/10 opacity-40 blur-[100px]"
        aria-hidden
      />

      <div className="app-container relative z-10">
        <div className="mb-4 inline-block rounded-full border border-brand-turquoise/30 bg-brand-turquoise/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-turquoise-light">
          Templates
        </div>
        <h2 className="mb-3 font-display text-3xl font-bold text-white">Pick your vertical</h2>
        <p className="mb-8 text-sm leading-relaxed text-zinc-400">
          Pre-built page graphs — customize copy, photos, and theme in minutes.
        </p>

        <div className="space-y-5">
          {verticals.map((v) => (
            <Link
              key={v.code}
              href={v.href}
              className="block overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.5)] backdrop-blur-md transition active:scale-[0.98]"
            >
              <div className="relative aspect-[16/10] w-full border-b border-white/10">
                <Image src={v.image} alt={v.label} fill className="object-cover" sizes="430px" />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-60"
                  aria-hidden
                />
              </div>
              <div className="relative px-5 py-5">
                <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-brand-turquoise-light">
                  {v.code}
                </p>
                <h3 className="font-display text-xl font-bold text-white drop-shadow-md">{v.label}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">{v.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
