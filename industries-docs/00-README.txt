================================================================================
ALINKS — INDUSTRIES DOCS (ROOT)
================================================================================

IMPLEMENTATION PLAN (build order for all packs)
  00-IMPLEMENTATION-PLAN.txt
  Foundation F0 → Wave 1 Presence/Salon/Food/Retail → Wave 2 Bookings/RE/Edu/Fitness
  → Wave 3 Automotive + food ops depth. Pharmacy later; finance called off.

FULL PACKS
  food_industry/       Cloud kitchen, restaurant, catering, dine-in, kitchen…
  bookings_industry/   Clinic, consults, lawyers, banquet/function halls
  real_estate/         Builders, agents, land/plots, gated, villas (no online sale)
  retail/              Multi-brand products; retail + wholesale (no multi-outlet POS)
  salon_beauty/        Salon, beauty, spa — packages, staff, pay-then-book
  education/           Schools, colleges, tuition, skills, indie teachers, YouTube only
  fitness/             Gym, yoga, PT, studios
  automotive/          Dealers (enquiry), workshop, parts
  presence/            Influencers (strong pack + creator discounts) &
                       business profile — NO SALES on ALINKS

PARKED / OFF
  other_verticals/01-pharmacy-notes.txt     Phase 2 thin
  other_verticals/02-general-catch-all.txt  Often → presence
  other_verticals/03-finance-insurance-loans-CALLED-OFF.txt  COMPLETELY OFF

Module pricing (ALL industries):
  Each paid module priced separately (internal: à la carte)
  FRONTEND: “Select modules” / “Modules” — never “à la carte” on UI
  00-MODULE-ALACARTE-PRICING.txt
  Bundles optional only; never forced packs.
  Presence influencers: Creator discounts — presence/07-*.txt

Shared free (not paid modules):
  Google Calendar (tenant Gmail) where events apply
  Education YouTube embeds (YouTube only)
  integration_setup_docs/26-google-tenant-integrations-guide.txt

Ops wiring:
  24 food | 25 bookings | 26 google | 27 RE | 28 retail
  29 salon | 30 education | 31 fitness | 32 automotive | 33 presence

Entry: each folder’s 00-README-INDEX.txt

Last update: 2026-07-16 (added 00-IMPLEMENTATION-PLAN.txt)
================================================================================
