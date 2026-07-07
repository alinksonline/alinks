---
name: alinks-launch-roadmap
description: Use when planning ALINKS implementation order, slicing features, choosing MVP scope, reporting launch readiness, mapping tasks to Phase 0 through Phase 4, or identifying external blockers.
---

# ALINKS Launch Roadmap

## Overview

Plan work against the soft launch ladder. Do not confuse the full vision with the next shippable gate.

## Source Sections

- Baseline section `9B`.
- Baseline section `11` for locked decisions.
- Legal `17-LAWYER-TASK-LIST.txt` for external launch blockers.

## Phase Gates

- Phase 0 foundation: DNS, Next.js app, Postgres, Redis, R2, auth skeleton, dashboard shell, superadmin skeleton.
- Phase 1 soft beta: 5-page builder, templates, Basic billing, legal v1, 10-20 beta tenants, first paying Basic tenant.
- Phase 2 Pro commerce: subdomains, checkout, Google Sheets pipe, Tap and Blast, custom domain wizard, salon packages.
- Phase 3 public India launch: full AI SEO, Meta sync, clinic-gated onboarding, promo codes, sitemaps, Core Web Vitals.
- Phase 4 growth: Supabase add-on, i18n, international prep, pharmacy OTC, broader verticals.

## External Blockers

Before public launch, track:

- Artix Pvt Ltd incorporation.
- Lawyer-approved ToS, privacy, AUP, payment addendum, tenant templates.
- Razorpay and PhonePe partner readiness.
- GST registration.
- DPDP grievance officer.

## Planning Rule

For every task, label it:

- `now`: needed for current gate.
- `next`: useful soon but not blocking.
- `later`: Phase 2+ or Phase 4.
- `external`: blocked by legal, tax, entity, or partner approval.
