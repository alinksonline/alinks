import Image from "next/image";
import Link from "next/link";

const verticals = [
  {
    code: "salon",
    label: "Salon & beauty",
    desc: "Packages, pay-then-book, staff roster",
    image: "/assets/marketing/vertical-salon.jpg",
    href: "/demo/book",
  },
  {
    code: "kirana",
    label: "Kirana & retail",
    desc: "Catalog, UPI checkout, COD toggle",
    image: "/assets/marketing/vertical-kirana.jpg",
    href: "/demo/store",
  },
  {
    code: "clinic",
    label: "Clinic & doctors",
    desc: "Doctor slots, license gate, patient flow",
    image: "/assets/marketing/vertical-clinic.jpg",
    href: "/demo",
  },
];

export function VerticalsSection() {
  return (
    <section className="bg-brand-mist/50 py-10">
      <div className="app-container">
        <p className="premium-label">Templates</p>
        <h2 className="premium-heading mt-2">Pick your vertical</h2>
        <p className="premium-subtext mt-3">Pre-built page graphs — customize copy, photos, and theme in minutes.</p>

        <div className="mt-6 space-y-4">
          {verticals.map((v) => (
            <Link key={v.code} href={v.href} className="premium-card block overflow-hidden transition active:scale-[0.99]">
              <div className="relative aspect-[16/10] w-full">
                <Image src={v.image} alt="" fill className="object-cover" sizes="430px" />
              </div>
              <div className="px-4 py-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-brand-turquoise">{v.code}</p>
                <h3 className="mt-1 font-display text-lg font-bold text-brand-ink">{v.label}</h3>
                <p className="mt-1 text-sm text-brand-ink/60">{v.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}