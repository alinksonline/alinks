---
name: alinks-legal-compliance-gates
description: Use when implementing ALINKS legal acceptances, tenant terms or privacy pages, publish gates, regulated vertical gates, disclaimers, DPDP notices, AUP enforcement, or lawyer-review-sensitive flows.
---

# ALINKS Legal Compliance Gates

## Overview

Legal documents in this repo are drafts, not final legal advice. Product code should enforce the acceptance and publish-gate model while keeping lawyer-reviewed text replaceable.

## Source Files

- `legal/21-DPDP-ALINKS-STATUS-AUDIT.txt` — DPDP checklist vs implementation (living audit)
- `legal/00-README-LEGAL-OVERVIEW.txt`
- `legal/16-TOUCHPOINT-CHECKBOX-TEXT.txt`
- `legal/20-LEGAL-ACCEPTANCE-MATRIX.txt`
- `src/platform/db/schema/legal-acceptances.ts`
- Baseline sections `5`, `5C`, `5B`, and Q014-Q020

For DPDP-specific user rights (delete, export, grievance), also use `alinks-dpdp-compliance`.

## Publish Gate

Before `business.isPublished = true`, require:

- Platform ToS accepted.
- Platform Privacy accepted.
- Tenant Terms published.
- Tenant Privacy published.
- Active paid subscription or valid trial rule, per Q035.

Sector gates:

- Clinic and doctor booking requires license on file plus approval.
- Pharmacy is Phase 2, OTC only, drug license mandatory.
- Grocery and fresh vegetables use fields, ToS, and honor system; do not block solely for FSSAI absence.
- Tenant BYO gateway acknowledgment (connect keys) before online shop checkout.
- Optional Artix PayFac addendum only if that path is revived (parked).

## Logging

Log doc type, version, tenant ID when available, accepted timestamp, IP, user agent, and metadata. Do not log customer PII beyond what the legal matrix explicitly permits.

## Safety

Never publish legal copy as final unless the user explicitly confirms lawyer approval. Keep template text versioned.
