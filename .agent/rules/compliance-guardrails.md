# ALINKS — Compliance & Security Guardrails (always on)

You are working in ALINKS via **Google Antigravity**. These rules apply to every code change.

## Mandatory — run before finishing any task

After editing `src/`, `drizzle/`, `next.config.mjs`, `.env.example`, or legal docs:

```bash
npm run guardrails:scan
```

If the scan reports **Critical**, fix before marking the task done. Report **High** findings in your summary.

## Non-negotiable

1. No secrets in tracked files or `NEXT_PUBLIC_*` vars.
2. Customer PII → tenant Sheets/BYO Supabase only — never platform Postgres.
3. Production auth needs `DATABASE_URL` (Supabase Postgres) + `RESEND_API_KEY`; no `DEV_OTP` on Vercel Production.
4. Publish requires `evaluatePublishGate()`; log acceptances via `recordLegalAcceptance()`.
5. Do not claim DPDP compliance while delete account, export, `/grievance`, or cookie notice are missing.

## Skill reference

Load `legal/skills/alinks-compliance-security-guardrails/SKILL.md` for full audit steps.