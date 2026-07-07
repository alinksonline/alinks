---
name: alinks-project-orientation
description: Use when starting work in the ALINKS repository, when context is stale, when a task mentions the product vision, roadmap, legal docs, or when deciding whether current code or planning documents are authoritative.
---

# ALINKS Project Orientation

## Overview

Orient from source-of-truth documents before changing behavior. ALINKS has a large locked product plan and a much smaller Phase 0 code scaffold; keep those two realities separate.

## First Reads

1. Read `src/ARCHITECTURE.txt` for layer rules.
2. Read `package.json` for stack and scripts.
3. Read relevant headings from `ALINKS_BASELINE.txt`; use `rg -n "SECTION|Q0XX|keyword" ALINKS_BASELINE.txt`.
4. Read `legal/00-README-LEGAL-OVERVIEW.txt` and `legal/20-LEGAL-ACCEPTANCE-MATRIX.txt` for legal or publish-gate work.
5. Inspect actual code before assuming a planned feature exists.

## Mental Model

- Product: India-first multi-tenant mini-website SaaS for small businesses.
- Current implementation: Next.js 14 App Router scaffold with placeholders.
- Canonical planning: `ALINKS_BASELINE.txt`, especially Q001-Q040.
- Legal drafts: planning material only; they require lawyer review before publication.
- Data principle: Artix stores tenant/config data; customer, patient, order, and booking PII belongs in tenant Google Sheets or tenant BYO Supabase.

## Output Discipline

When reporting project state, distinguish:

- `Implemented`: present in `src/`.
- `Stubbed`: interface or placeholder exists but real integration is missing.
- `Planned`: described in baseline/legal docs only.
- `Blocked externally`: lawyer, GST, Pvt Ltd, Razorpay or PhonePe partner, DPDP officer.
