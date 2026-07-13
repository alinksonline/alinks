const steps = [
  { n: "01", title: "Sign up with phone OTP", desc: "No card required. 14-day Pro trial starts immediately." },
  { n: "02", title: "Name your business & pick a preset", desc: "Salon, kirana, clinic, or portfolio — we seed your 5 pages." },
  { n: "03", title: "Edit on your phone", desc: "Theme, branding, products, packages, and legal pages." },
  { n: "04", title: "Publish & share", desc: "Go live on your handle, blast on WhatsApp, accept UPI payments." },
];

export function HowSection() {
  return (
    <section className="py-24 bg-black relative">
      {/* Decorative line */}
      <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-brand-turquoise via-brand-purple to-transparent opacity-20" />

      <div className="app-container relative z-10">
        <div className="text-center md:max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-purple mb-3">How it works</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">Live in an afternoon</h2>
        </div>

        <ol className="mt-12 space-y-8 md:space-y-12">
          {steps.map((s, idx) => (
            <li key={s.n} className={`relative flex flex-col md:flex-row gap-6 md:gap-12 md:items-center ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              
              {/* Timeline dot */}
              <div className="absolute left-[-1.1rem] md:left-1/2 top-6 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-4 h-4 rounded-full bg-brand-turquoise shadow-[0_0_15px_rgba(45,212,191,0.8)] z-10 hidden sm:block" />

              <div className="flex-1" />
              
              <div className="glass-panel p-6 rounded-3xl flex-1 flex gap-5 items-start transition-all duration-300 hover:bg-white/5 hover:border-brand-purple/30 group">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-turquoise font-mono text-sm font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
                  {s.n}
                </span>
                <div className="min-w-0 pt-1">
                  <h3 className="font-display font-bold text-lg text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}