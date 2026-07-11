---
name: alinks-dpdp-compliance
description: Use when auditing or implementing ALINKS DPDP Act 2023 compliance, data principal rights (delete account, export data, grievance), cookie notices, consent evidence, breach runbooks, or mapping product behavior to legal/21-DPDP-ALINKS-STATUS-AUDIT.txt.
---

# ALINKS DPDP Compliance

## Overview

DPDP work tracks what the product **actually implements** versus what legal drafts promise. Start with the living audit, then verify code. Legal text in `legal/` is draft until lawyer sign-off — do not claim "DPDP compliant" publicly until P0 gaps are closed.

## Source Files (read first)

- `legal/21-DPDP-ALINKS-STATUS-AUDIT.txt` — checklist, scorecard, P0/P1/P2 roadmap
- `legal/00-README-LEGAL-OVERVIEW.txt` — folder index and doc types
- `legal/18-DPDP-GRIEVANCE-OFFICER.txt` — grievance officer notice (draft)
- `legal/02-PLATFORM-PRIVACY-POLICY.txt` — draft platform privacy
- `src/platform/legal/platform-documents.ts` — live ToS / Privacy / AUP
- `ALINKS_BASELINE.txt` — Section 5C, Q014–Q020 (data roles)

## Data Roles (do not blur)

| Data | Fiduciary | Storage |
|------|-----------|---------|
| Tenant (business owner) signup, billing, session | Artix | Platform Postgres |
| End-customer (buyer, patient, salon client) | Tenant | Tenant Google Sheet or BYO Supabase |

Artix is processor/facilitator for end-customer PII — tenant remains fiduciary.

## Audit Checklist

When reviewing or shipping compliance work, mark each item `[DONE]`, `[PARTIAL]`, `[MISSING]`, or `[EXTERNAL]`:

**Notice & consent**
- Live `/privacy`, `/terms`, `/aup`
- Signup checkboxes + `recordLegalAcceptance()` evidence
- Cookie notice for session, OTP, OAuth cookies

**User rights (P0)**
- Self-service delete account in Settings
- Self-service export (tenant profile JSON — not customer Sheet rows)
- Public `/grievance` page from `legal/18`
- Withdraw-consent UI for optional processing

**Security & ops**
- HTTPS, session auth, `legal_acceptances` table
- Breach runbook in `legal/` (when added, e.g. `22-BREACH-RESPONSE-RUNBOOK.txt`)
- Vendor DPAs — external

## Implementation Priorities

**P0 — ship before public compliance claim**
1. `DATABASE_URL` on production (sessions + logging)
2. `/grievance` route on marketing site
3. Settings → Delete account (cascade tenant; retain billing per policy)
4. Settings → Export my data

**P1**
- Log acceptances at OTP verify, not only onboarding
- Cookie notice + essential cookies list
- In-app privacy request link

**P2 — lawyer / external**
- Lawyer finalize `legal/01–14` and `platform-documents.ts`
- Appoint DPDP Grievance Officer
- Sign processor DPAs (Razorpay, Resend, MSG91, hosting)

## Code Touchpoints

- Consent UI: `src/components/platform/signup-form.tsx`
- Acceptance logging: `src/platform/legal/acceptances.ts`, `src/app/actions/business.ts`
- Publish gate: `src/platform/legal/publish-gate.ts`
- Settings (gaps): `src/app/(platform)/(authenticated)/dashboard/settings/`
- Legal pages: `src/app/(marketing)/terms|privacy|aup/page.tsx`

## After Shipping

Update `legal/21-DPDP-ALINKS-STATUS-AUDIT.txt` revision log and flip checklist items. Re-run scorecard.

## Safety

Never treat repo legal copy as final advice. Separate implemented behavior from planned behavior. Name gaps directly.