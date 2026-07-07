================================================================================
ALINKS — INTEGRATION SETUP DOCS (INDEX)
================================================================================
Folder: integration_setup_docs/
Purpose: Step-by-step setup for every external service ALINKS uses or will use.
Repo:    https://github.com/artixforcoding/alinks
Live:    https://alinks.online  (Vercel + Cloudflare DNS)

Read docs in this order for first launch:
  15-local-dev-quickstart.txt      → run app on your Mac
  04-neon-postgres.txt             → production + dev database
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

Phase 4:
  11-supabase-tenant-byo.txt

Optional:
  12-openrouter-ai.txt
  23-coderabbit.txt                 → AI PR reviews + local CLI

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
DOC LIST (24 files)
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

Also see: LOCAL_DEV_SETUP.txt (repo root) for condensed local Postgres options.

================================================================================
QUICK STATUS (what is live today)
================================================================================
  DONE     GitHub, Vercel, Cloudflare DNS, alinks.online SSL
  NEEDED   DATABASE_URL on Vercel (Neon) — signup still needs this for prod
  PHASE 0  DEV_OTP=1111 bypass — replace before public launch (doc 14)
  STUBBED  Razorpay, Google OAuth, SMS, Redis, R2, Meta feed (code exists)

================================================================================