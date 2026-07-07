const stack = [
  { name: "Next.js 14", role: "App Router · RSC" },
  { name: "Postgres", role: "Platform config" },
  { name: "Drizzle", role: "Type-safe schema" },
  { name: "Redis", role: "Cache · queue" },
  { name: "Google Sheets", role: "Tenant writes" },
  { name: "Razorpay", role: "Billing · UPI" },
];

export function StackSection() {
  return (
    <section className="border-b border-tech-border bg-tech-panel py-8 sm:py-10">
      <div className="marketing-container">
        <p className="tech-label mb-4">Runtime stack</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stack.map((item) => (
            <div
              key={item.name}
              className="rounded border border-tech-border bg-tech-bg px-3 py-3 sm:px-4"
            >
              <p className="font-mono text-xs font-semibold text-white">{item.name}</p>
              <p className="mt-1 font-mono text-[10px] text-zinc-500">{item.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}