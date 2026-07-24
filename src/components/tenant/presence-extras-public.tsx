import type { PresenceExtras } from "@/core/types/presence-extras";

/** Public display of Presence creator extras (no commerce). */
export function PresenceExtrasPublic({
  extras,
  showMediaKit,
  showSocialProof,
  showHighlights,
}: {
  extras: PresenceExtras;
  showMediaKit: boolean;
  showSocialProof: boolean;
  showHighlights: boolean;
}) {
  const mk = extras.mediaKit;
  const hasMk =
    showMediaKit &&
    Boolean(mk.niches || mk.platforms || mk.approxReach || mk.pastBrands || mk.rateCard);

  if (!hasMk && !(showSocialProof && (extras.testimonials.length || extras.reachChips)) && !(showHighlights && extras.highlights.length)) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-app space-y-3 px-3.5 pb-2">
      {hasMk ? (
        <section className="t-card space-y-2 p-4">
          <h2 className="t-ink text-sm font-bold">Media kit</h2>
          {mk.niches ? <p className="t-muted text-xs">Niches: {mk.niches}</p> : null}
          {mk.platforms ? <p className="t-muted text-xs">Platforms: {mk.platforms}</p> : null}
          {mk.approxReach ? <p className="t-muted text-xs">Reach: {mk.approxReach}</p> : null}
          {mk.pastBrands ? <p className="t-muted text-xs">Past brands: {mk.pastBrands}</p> : null}
          {mk.rateCard ? (
            <div className="mt-2 whitespace-pre-wrap rounded-lg bg-[var(--t-surface-2,#f8fafc)] p-3 text-xs t-ink">
              {mk.rateCard}
            </div>
          ) : null}
          <p className="t-muted text-[10px]">Rates are informational — no payment on ALINKS Presence.</p>
        </section>
      ) : null}

      {showSocialProof && (extras.reachChips || extras.testimonials.length || extras.brandLogos) ? (
        <section className="t-card space-y-2 p-4">
          <h2 className="t-ink text-sm font-bold">Social proof</h2>
          {extras.reachChips ? (
            <div className="flex flex-wrap gap-1.5">
              {extras.reachChips.split(/[,·|]/).map((c) => c.trim()).filter(Boolean).map((c) => (
                <span key={c} className="t-chip text-[11px]">
                  {c}
                </span>
              ))}
            </div>
          ) : null}
          {extras.brandLogos ? <p className="t-muted text-xs">{extras.brandLogos}</p> : null}
          {extras.testimonials.map((t) => (
            <blockquote key={t.id} className="border-l-2 border-[var(--t-primary)] pl-3 text-xs">
              <p className="t-ink">&ldquo;{t.quote}&rdquo;</p>
              {t.attribution ? <footer className="t-muted mt-1">— {t.attribution}</footer> : null}
            </blockquote>
          ))}
        </section>
      ) : null}

      {showHighlights && extras.highlights.length > 0 ? (
        <section className="t-card p-4">
          <h2 className="t-ink mb-2 text-sm font-bold">Highlights</h2>
          <div className="flex flex-wrap gap-2">
            {extras.highlights.map((h) => (
              <a
                key={h.id}
                href={h.href || "#"}
                className="t-chip no-underline"
                target={h.href.startsWith("http") ? "_blank" : undefined}
                rel={h.href.startsWith("http") ? "noreferrer" : undefined}
              >
                {h.label}
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
