const steps = [
  {
    n: "01",
    title: "Sign up with phone OTP",
    desc: "No card required. 14-day Pro trial starts immediately.",
  },
  {
    n: "02",
    title: "Name your business & pick a template",
    desc: "Salon, kirana, clinic, or portfolio — we seed your 5 pages.",
  },
  {
    n: "03",
    title: "Edit on your phone",
    desc: "Theme, branding, products, packages, and legal pages.",
  },
  {
    n: "04",
    title: "Publish & share",
    desc: "Go live on your handle, blast on WhatsApp, accept UPI payments.",
  },
];

export function HowSection() {
  return (
    <section className="relative border-t border-brand-ink/5 dark:border-white/5 bg-brand-cream dark:bg-[#08080c] py-16 transition-colors">
      <div
        className="pointer-events-none absolute left-0 top-10 h-[300px] w-full bg-brand-purple/10 dark:bg-brand-purple/5 blur-[120px]"
        aria-hidden
      />

      <div className="app-container relative z-10">
        <div className="mb-4 inline-block rounded-full border border-brand-turquoise/20 dark:border-brand-turquoise/30 bg-brand-turquoise/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-turquoise dark:text-brand-turquoise-light">
          How it works
        </div>
        <h2 className="mb-8 font-display text-3xl font-bold text-brand-ink dark:text-white">Live in an afternoon</h2>

        <ol className="space-y-4">
          {steps.map((s) => (
            <li
              key={s.n}
              className="flex gap-4 rounded-2xl border border-brand-ink/10 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] backdrop-blur-sm transition-colors"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-turquoise font-mono text-sm font-bold text-white shadow-lg">
                {s.n}
              </span>
              <div className="min-w-0 pt-1">
                <h3 className="text-[15px] font-bold tracking-wide text-brand-ink dark:text-white">{s.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-stone-600 dark:text-zinc-400">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
