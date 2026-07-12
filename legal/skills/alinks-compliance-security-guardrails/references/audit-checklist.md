# ALINKS Guardrail Audit Checklist

Use with `alinks-compliance-security-guardrails` skill. Mark each: PASS | FAIL | N/A | MANUAL.

## A. Secrets & Repository Hygiene

- [ ] `.env` and `.secrets/` in `.gitignore`
- [ ] No `rzp_`, `re_`, `cr-`, `sk-`, `npg_`, `eyJ` tokens in tracked files
- [ ] `.env.example` documents vars without real values
- [ ] `NEXT_PUBLIC_*` contains no secrets (only public IDs like Razorpay KEY_ID)
- [ ] GitHub/Vercel secrets used for CI keys, not hardcoded in workflows

## B. Transport & Headers

- [ ] Production served over HTTPS (alinks.online)
- [ ] Cloudflare SSL mode Full; grey cloud if Vercel terminates TLS
- [ ] `next.config.mjs` sets baseline security headers
- [ ] Session cookie: `httpOnly`, `secure` (prod), `sameSite=lax`
- [ ] Email OTP cookie: `httpOnly`, `secure` (prod), short TTL

## C. Authentication & Access

- [ ] `DATABASE_URL` set (Supabase Postgres URI)
- [ ] Email or SMS OTP configured for production (not dev-only)
- [ ] `DEV_OTP` not in Vercel Production
- [ ] Superadmin is only accounts with `tenants.role = 'superadmin'` (not env email elevation)
- [ ] `SUPERADMIN_PHONE` used for seed bootstrap only (optional)
- [ ] `requireAuth()` / `requireSuperadmin()` on protected routes
- [ ] Business ownership checks on tenant mutations

## D. Data Boundaries

- [ ] Platform schema: tenants, businesses, sessions, legal_acceptances — no customer orders/patients
- [ ] Customer PII routes through `StorageAdapter` → Sheets or tenant Supabase
- [ ] No `console.log` of phone, email, OTP, or session tokens

## E. Third-Party Resilience

- [ ] External fetch calls handle non-2xx and network errors
- [ ] Order/booking writes use queue when Sheets unavailable
- [ ] Payment verify uses server-side signature check
- [ ] AI service does not send customer PII without tenant consent path

## F. Legal & DPDP (product)

- [ ] `/terms`, `/privacy`, `/aup` render from versioned docs
- [ ] Signup checkboxes + `recordLegalAcceptance()` at onboarding
- [ ] `evaluatePublishGate()` before `isPublished = true`
- [ ] `/grievance` page published
- [ ] Delete account + export data in Settings
- [ ] Cookie notice on marketing site

## G. Pre-Deploy Commands

```bash
npm run guardrails:scan
npm run typecheck
npm run test
npm run lint
npm run build
```

## H. External (not code)

- [ ] Artix Pvt Ltd incorporation
- [ ] GST registration
- [ ] Lawyer sign-off on legal/01–20
- [ ] DPDP grievance officer appointed
- [ ] Razorpay/PhonePe partner agreements