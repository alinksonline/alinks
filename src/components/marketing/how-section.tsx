const steps = [
  { n: "01", title: "Sign up with phone OTP", desc: "No card required. 14-day Pro trial starts immediately." },
  { n: "02", title: "Name your business & pick a template", desc: "Salon, kirana, clinic, or portfolio — we seed your 5 pages." },
  { n: "03", title: "Edit on your phone", desc: "Theme, branding, products, packages, and legal pages." },
  { n: "04", title: "Publish & share", desc: "Go live on your handle, blast on WhatsApp, accept UPI payments." },
];

export function HowSection() {
  return (
    <section className="py-10">
      <div className="app-container">
        <p className="premium-label">How it works</p>
        <h2 className="premium-heading mt-2">Live in an afternoon</h2>

        <ol className="mt-8 space-y-4">
          {steps.map((s) => (
            <li key={s.n} className="premium-card-soft flex gap-4 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-ink font-mono text-xs font-bold text-brand-cream">
                {s.n}
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold text-brand-ink">{s.title}</h3>
                <p className="mt-1 text-sm text-brand-ink/65">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}