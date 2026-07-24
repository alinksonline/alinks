---
name: alinks-devops
description: Use when deploying ALINKS, configuring Vercel, Cloudflare DNS, GitHub Actions CI, Neon Postgres, environment variables, production blockers, or following integration_setup_docs devops runbooks.
---

# ALINKS DevOps

## Overview

ALINKS deploys as Next.js on **Vercel**, DNS on **Cloudflare**, source on **GitHub** (`alinksonline/alinks`). Every push to `main` auto-deploys production at https://alinks.online. Start with the integration index, then the specific doc for the task.

## Source Files (read first)

- `integration_setup_docs/00-README-INDEX.txt` — doc list, project IDs, quick status
- `integration_setup_docs/15-local-dev-quickstart.txt` — local Mac setup
- `integration_setup_docs/01-github.txt` — repo workflow
- `integration_setup_docs/02-vercel.txt` — Vercel project, domains, CLI
- `integration_setup_docs/03-cloudflare-dns-alinks-online.txt` — DNS, SSL, grey cloud
- `integration_setup_docs/04-neon-postgres.txt` — `DATABASE_URL`
- `integration_setup_docs/05-vercel-environment-variables.txt` — full env reference
- `integration_setup_docs/18-github-actions-ci.txt` — CI workflow
- `LOCAL_DEV_SETUP.txt` — condensed local Postgres options

## Live Reference IDs

| Service | Value |
|---------|-------|
| GitHub | `alinksonline/alinks` |
| Vercel team/project | `alinks` / `alinks` |
| Production URL | https://alinks.online |
| Cloudflare zone | `alinks.online` |
| CI workflow | `.github/workflows/ci.yml` |

## Deploy Pipeline

```
git push main → GitHub Actions (test, lint, build) → Vercel production deploy
feature branch → PR → CI green → merge → auto-deploy
```

CI runs: `npm ci` → `npm run test` → `npm run lint` → `npm run build`. No `DATABASE_URL` required for CI build.

## Environment Variables

Set in Vercel: https://vercel.com/alinks/alinks/settings/environment-variables

**Production hosts (required):**
```
NEXT_PUBLIC_APP_URL=https://alinks.online
NEXT_PUBLIC_ROOT_DOMAIN=alinks.online
NEXT_PUBLIC_PLATFORM_HOST=app.alinks.online
NEXT_PUBLIC_MARKETING_HOST=alinks.online
```

**Known production blocker:** `DATABASE_URL` — signup/session fails without it. Use Neon pooled URI (doc 04) or Supabase Postgres connection string.

**Never commit:** `.env`, API tokens, `DATABASE_URL`, payment secrets. Local: `ALINKS/.env` (gitignored). Cloudflare tokens: external credentials file per index.

## Vercel CLI Tips

```bash
unset VERCEL_TOKEN   # avoid stale token errors
vercel login
vercel link          # creates .vercel/ (gitignored)
vercel --prod        # manual deploy (usually unnecessary — GitHub hook handles it)
```

## Cloudflare DNS

- Apex/www/app records point to Vercel CNAME from dashboard
- Grey cloud (DNS only) when SSL terminates at Vercel
- TXT `_vercel.alinks.online` for domain verification if moving accounts

## First Launch Order

1. Local dev quickstart (15)
2. Postgres + `DATABASE_URL` on Vercel (04, 05)
3. GitHub + Vercel connected (01, 02)
4. Cloudflare DNS live (03)
5. Auth: Resend email OTP or MSG91 (06, 14) — remove `DEV_OTP` from production when SMS live
6. CI enabled (18)

## Verification Before Declaring Done

- https://alinks.online loads with valid SSL
- `npm run build` passes locally and in CI
- Production env vars match doc 05 (especially `NEXT_PUBLIC_*` hosts)
- Auth flow completes (OTP verify + session — needs `DATABASE_URL`)

## Safety

- Do not paste secrets in chat, commits, or logs
- Rotate any exposed keys immediately
- `DEV_OTP=1111` is dev-only — remove from Vercel production before public launch