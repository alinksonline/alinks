import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="bg-premium-mesh py-12">
      <div className="app-container text-center">
        <p className="premium-label">Ready?</p>
        <h2 className="premium-heading mt-3">Launch your mini-site today</h2>
        <p className="premium-subtext mx-auto mt-3 max-w-xs">
          14-day Pro trial · phone OTP signup · built for mobile
        </p>
        <Link href="/signup" className="mt-8 block">
          <Button variant="bronze">Create your ALINKS site</Button>
        </Link>
      </div>
    </section>
  );
}