import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="border-t border-zinc-200 bg-white py-16 sm:py-20">
      <div className="marketing-container text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-400">Ready to ship</p>
        <h2 className="mt-4 text-2xl font-bold text-zinc-900 sm:text-3xl">Provision your tenant</h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-zinc-600">14-day Pro trial · phone OTP · no credit card in beta</p>
        <Link href="/signup" className="mt-8 inline-block w-full sm:mt-10 sm:w-auto">
          <Button className="w-full bg-zinc-900 px-10 py-3.5 font-mono text-xs uppercase tracking-wider hover:bg-zinc-800 sm:w-auto">
            alinks signup →
          </Button>
        </Link>
      </div>
    </section>
  );
}