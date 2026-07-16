================================================================================
ALINKS — INTEGRATION SETUP DOCS (INDEX)
================================================================================
Folder: integration_setup_docs/
Purpose: Step-by-step setup for every external service ALINKS uses or will use.
Repo:    https://github.com/artixforcoding/alinks
Live:    https://alinks.online  (Vercel + Cloudflare DNS)

Read docs in this order for first launch:
  15-local-dev-quickstart.txt      → run app on your Mac
  LOCAL_DEV_SETUP.txt Option C     → Supabase Postgres for platform DB (if you already use Supabase)
  04-neon-postgres.txt             → OR Neon Postgres (optional alternative)
  19-neon-vercel-marketplace.txt   → one-click Neon ↔ Vercel (optional shortcut)
  05-vercel-environment-variables.txt
  01-github.txt
  02-vercel.txt
  03-cloudflare-dns-alinks-online.txt
  06-phone-otp-auth.txt
  18-github-actions-ci.txt

Before taking money:
  22-razorpay-phonepe-apply-now-checklist.txt  → START HERE for applications
  08-razorpay-billing.txt                      → full Razorpay guide
  09-phonepe-partner.txt                       → full PhonePe guide (optional)

Before tenant data (orders, customers):
  07-google-oauth-sheets.txt

Before public launch (replace dev OTP):
  14-sms-otp-production.txt
  20-sentry-monitoring.txt         → optional but recommended

Phase 2+:
  10-upstash-redis.txt
  13-cloudflare-r2.txt
  16-meta-commerce-catalog.txt
  17-tenant-custom-domains.txt
  21-msg91-transactional-sms.txt

Product industries (not infra — product source of truth):
  ../industries-docs/food_industry/00-README-INDEX.txt
  ../industries-docs/bookings_industry/00-README-INDEX.txt
  ../industries-docs/real_estate/00-README-INDEX.txt
  ../industries-docs/retail/00-README-INDEX.txt
  ../industries-docs/salon_beauty/00-README-INDEX.txt
  ../industries-docs/education/00-README-INDEX.txt
  ../industries-docs/fitness/00-README-INDEX.txt
  ../industries-docs/automotive/00-README-INDEX.txt
  ../industries-docs/other_verticals/00-README-INDEX.txt
  ../industries-docs/presence/00-README-INDEX.txt
  24-food-industry-product-modules.txt      → food modules ops pointer
  25-bookings-industry-product-modules.txt  → clinics/lawyers/venues ops pointer
  26-google-tenant-integrations-guide.txt   → tenant Google (Calendar/Sheets) easy setup
  27-real-estate-industry-product.txt       → RE listings/agents (no platform sales)
  28-retail-industry-product.txt            → retail + wholesale multi-brand
  29-salon-beauty-industry-product.txt      → salon packages, staff, pay-then-book
  30-education-industry-product.txt         → education / coaching
  31-fitness-industry-product.txt           → gym / fitness / yoga
  32-automotive-industry-product.txt        → auto dealers / workshop / parts
  33-presence-industry-product.txt          → influencers / profile only (no sales)

Phase 4:
  11-supabase-tenant-byo.txt

Optional:
  12-openrouter-ai.txt
  23-coderabbit.txt                 → AI PR reviews + local CLI

AGENT SKILLS (integration_setup_docs/skills/)
---------------------------------------------
  INDEX.md              — skill pack index
  alinks-devops         — Vercel, Cloudflare, CI, env vars, deploy
  alinks-coderabbit     — PR reviews, local CLI, Agentic API key

Symlinked from .agents/skills/ and skills/ for agent discovery.

================================================================================
CREDENTIALS FILE (DO NOT COMMIT)
================================================================================
Cloudflare tokens:  /Users/benjaminanand/Development/SOFTWARE/cloudflaretokens.txt
Local env:          ALINKS/.env  (gitignored — copy from .env.example)
Vercel env:         Dashboard → alinks → Settings → Environment Variables

Never commit: API tokens, DATABASE_URL, Razorpay secrets, Google client secrets.

================================================================================
CURRENT PROJECT IDS (reference)
================================================================================
GitHub repo:        artixforcoding/alinks
Vercel team:        alinks  (team_onaRSq57MqAHQouPfMRgo3Kl)
Vercel project:     alinks  (prj_nAiPyAuTSJ2fNmxfoaLgB0CxkeLy)
Cloudflare zone:    alinks.online  (c57f835d0f4b0730f6c7ea98ff0d70e7)
Domain registrar:   Hostinger (nameservers → Cloudflare)

================================================================================
DOC LIST
================================================================================
  00-README-INDEX.txt
  01-github.txt
  02-vercel.txt
  03-cloudflare-dns-alinks-online.txt
  04-neon-postgres.txt
  05-vercel-environment-variables.txt
  06-phone-otp-auth.txt
  07-google-oauth-sheets.txt
  08-razorpay-billing.txt
  09-phonepe-partner.txt
  10-upstash-redis.txt
  11-supabase-tenant-byo.txt
  12-openrouter-ai.txt
  13-cloudflare-r2.txt
  14-sms-otp-production.txt
  15-local-dev-quickstart.txt
  16-meta-commerce-catalog.txt
  17-tenant-custom-domains.txt
  18-github-actions-ci.txt
  19-neon-vercel-marketplace.txt
  20-sentry-monitoring.txt
  21-msg91-transactional-sms.txt
  22-razorpay-phonepe-apply-now-checklist.txt
  23-coderabbit.txt
  24-food-industry-product-modules.txt   → food product modules (see industries-docs)
  25-bookings-industry-product-modules.txt → bookings: clinic/legal/venue (see industries-docs)
  26-google-tenant-integrations-guide.txt  → Google Connect for tenants (Calendar/Sheets)
  27-real-estate-industry-product.txt      → real estate product (no online property sales)
  28-retail-industry-product.txt           → retail/wholesale multi-brand store
  29-salon-beauty-industry-product.txt     → salon/beauty packages + pay-then-book
  30-education-industry-product.txt        → education industry
  31-fitness-industry-product.txt          → fitness industry
  32-automotive-industry-product.txt       → automotive industry
  33-presence-industry-product.txt         → presence / influencers (no sales)



Also see: LOCAL_DEV_SETUP.txt (repo root) for condensed local Postgres options.

================================================================================
QUICK STATUS (what is live today)
================================================================================
  DONE     GitHub, Vercel, Cloudflare DNS, alinks.online SSL
  NEEDED   DATABASE_URL on Vercel (Supabase or Neon Postgres) — signup blocked without it
  PHASE 0  DEV_OTP=1111 bypass — replace before public launch (doc 14)
  STUBBED  Razorpay, Google OAuth, SMS, Redis, R2, Meta feed (code exists)

================================================================================