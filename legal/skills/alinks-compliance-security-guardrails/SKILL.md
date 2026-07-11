---
name: alinks-compliance-security-guardrails
description: Use before shipping ALINKS code, in CI pre-deploy, or when auditing cyber liability, secrets, security headers, third-party resilience, DPDP/GDPR data flows, PII in logs, delete/export endpoints, or insurance-grade guardrails. For Google Antigravity agents in this repo. Run npm run guardrails:scan.
---

# ALINKS Compliance & Security Guardrail Auditor

## Core Objective

Inspect architecture, dependencies, and infrastructure against **legal, financial, and security liabilities** before merge or deploy. Produce findings first (severity-ordered), then implement safe remediations or flag manual blockers.

Pair with: `alinks-dpdp-compliance`, `alinks-legal-compliance-gates`, `alinks-audit-review`.

## Antigravity (automatic)

| Layer | Path | When it runs |
|-------|------|--------------|
| **Rule (always on)** | `.agent/rules/compliance-guardrails.md` | Every agent session in this workspace |
| **Skill** | `.agents/skills/alinks-compliance-security-guardrails` | Auto-invoked on compliance/security/deploy tasks |
| **Workflow (on demand)** | `.agent/workflows/guardrails-scan.md` | Type `/guardrails-scan` in Antigravity chat |
| **npm pretest** | `package.json` `pretest` | Before every `npm test` (local + CI) |
| **GitHub CI** | `.github/workflows/ci.yml` | Every push/PR to `main` |

Manual trigger: *"run guardrails scan"* or *"compliance audit before deploy"*

## When to Run

- Before every PR merge to `main` (production deploy)
- After auth, billing, storage, or logging changes
- After adding env vars or third-party SDKs
- When user asks for compliance, security, insurance, or guardrail audit

## Quick Start

```bash
npm run guardrails:scan          # automated checks (exit 1 on critical)
npm run test && npm run lint     # baseline quality gate
npm run review                   # optional CodeRabbit pass
```

Read `references/audit-checklist.md` for the full manual pass.

---

## 1. Cyber Liability & Security Audit

### Verify

| Check | ALINKS location |
|-------|-----------------|
| No hardcoded secrets | `rg` for `api[_-]?key`, `secret`, `password`, `Bearer ` in `src/` |
| `.env` gitignored | `.gitignore` |
| No secrets in `NEXT_PUBLIC_*` | `src/core/config/env.ts`, Vercel env dashboard |
| `DEV_OTP` absent in production | Vercel Production env only |
| HTTPS/TLS in prod | Vercel + Cloudflare (`integration_setup_docs/03-cloudflare-dns-alinks-online.txt`) |
| Security headers | `next.config.mjs` `headers()` |
| Session cookie flags | `src/platform/auth/session.ts` — `httpOnly`, `secure`, `sameSite` |
| OTP rate limiting | `src/platform/auth/otp-rate-limit.ts` |
| Auth readiness | `src/platform/auth/readiness.ts`, `GET /api/health` |

### Implement if missing

- Extend `next.config.mjs` security headers (CSP baseline, HSTS via Vercel/Cloudflare)
- Add or tighten `.env.example` — never commit real values
- Add `guardrails:scan` to CI (`.github/workflows/ci.yml`)
- Rotate any exposed key immediately; document in ops, not in repo

### Severity

- **Critical:** committed secrets, `DEV_OTP` on production, missing `DATABASE_URL`, customer PII in platform Postgres
- **High:** no security headers, session cookie not `secure` in prod, PII in logs
- **Medium:** missing rate limits, verbose error stacks to client

---

## 2. Infrastructure & Third-Party ToS Mitigation

### Verify

| Integration | Resilience pattern | File |
|-------------|-------------------|------|
| Resend email OTP | try/catch + user error | `src/platform/email/resend.ts` |
| MSG91 SMS | fallback to email mode | `src/platform/auth/auth-mode.ts` |
| Razorpay | dev stub when unconfigured | `src/platform/payments/razorpay.ts` |
| Google Sheets | write queue + retry | `src/tenant/storage/write-service.ts`, `src/app/api/storage/process-queue/route.ts` |
| OpenRouter AI | mock when no key | `src/platform/ai/service.ts` |
| Platform DB | null client when no URL | `src/platform/db/client.ts` |

### Data boundary (locked)

- **Platform Postgres** (`DATABASE_URL`): tenant account, sessions, config only
- **End-customer PII**: tenant Google Sheets or tenant BYO Supabase — never Artix Postgres
- See `src/ARCHITECTURE.txt`, `ALINKS_BASELINE.txt` §5C

### Implement if missing

- Wrap external calls: timeout, typed errors, no silent swallow
- Queue critical writes (orders, bookings) — already in `write-service.ts`; extend if new PII paths
- Circuit-breaker pattern for repeated upstream failures (log + degrade gracefully)
- Document single points of failure in PR description

### Severity

- **Critical:** customer PII written to platform DB tables
- **High:** unqueued PII write with no retry; payment without webhook verification
- **Medium:** missing timeout on fetch to third parties

---

## 3. Privacy & Data Compliance (DPDP / GDPR-style)

India primary: **DPDP Act 2023**. GDPR/CCPA patterns apply to export/delete/redaction.

### Verify

| Requirement | Status source |
|-------------|---------------|
| Privacy / ToS / AUP live | `/privacy`, `/terms`, `/aup` |
| Consent logging | `legal_acceptances` table, `recordLegalAcceptance()` |
| Publish gates | `src/platform/legal/publish-gate.ts` |
| Delete account | `legal/21-DPDP-ALINKS-STATUS-AUDIT.txt` — often **MISSING** |
| Export my data | same audit — often **MISSING** |
| `/grievance` page | `legal/18-DPDP-GRIEVANCE-OFFICER.txt` — often **MISSING** |
| Cookie notice | audit — often **MISSING** |
| PII in logs / AI prompts | grep `console.log`, Sentry config, AI service inputs |
| Cascading delete on account removal | schema FK + delete action — **MISSING** |

### Implement if missing

- Settings → Delete account (cascade tenant; retain billing per policy)
- Settings → Export tenant profile JSON (not customer Sheet rows)
- `/grievance` marketing route from `legal/18`
- `redactPii()` utility before logging (scaffold in `src/core/utils/redact-pii.ts` when needed)
- Migration for `ON DELETE CASCADE` where tenant purge is required

### Severity

- **Critical:** claiming "DPDP compliant" publicly with P0 gaps open
- **High:** no delete/export; PII in application logs
- **Medium:** cookie banner missing; consent logged only at onboarding

---

## Output Format (required)

```markdown
## Guardrail Audit — [date]

### Critical (block deploy)
- ...

### High
- ...

### Medium / Low
- ...

### Implemented / Verified OK
- ...

### Manual / External
- Lawyer sign-off, GST, grievance officer appointment, etc.
```

## ALINKS-Specific Blockers (check every audit)

1. `DATABASE_URL` on Vercel — **Supabase Postgres** (user standard; not Neon unless chosen)
2. `RESEND_API_KEY` + verified sending domain for production email OTP
3. Remove `DEV_OTP` from Vercel Production before public launch
4. Lawyer review on `platform-documents.ts` before binding users
5. Razorpay live keys + webhook before taking money

## Do Not

- Publish legal text as final without explicit lawyer confirmation
- Store customer phone/name/order rows in platform Postgres
- Commit `.env`, connection strings, or API keys
- Skip `guardrails:scan` before production deploy