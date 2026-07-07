---
name: alinks-dashboard-builder
description: Use when building ALINKS tenant dashboard, onboarding, settings, business switcher, Google connect UX, data privacy pages, publish controls, superadmin screens, or mobile admin workflows.
---

# ALINKS Dashboard Builder

## Overview

The dashboard is a mobile-friendly business control room. It manages tenant config in Artix Postgres and displays client rows from tenant-owned storage.

## Source Files

- `src/app/(platform)/*`
- `src/app/(admin)/*`
- `src/components/platform/*`
- `src/components/admin/*`
- Baseline sections `5E`, `8B`, and `9B`

## Core Workflows

- Phone OTP login and signup.
- Trial onboarding with business name, vertical, and handle.
- Google connect before Pro checkout or booking go-live.
- Business switcher for Enterprise or add-on businesses.
- Data Home widget showing exact Google Sheet file and tabs.
- Publish checklist with legal, subscription, storage, and sector gates.
- Superadmin tenant list, moderation, MRR, license approval, and suspend/ban actions.

## UX Rules

- Use dense, scannable operational UI.
- Make storage ownership explicit: customer data is in the tenant Google/Supabase account.
- Avoid exposing superadmin client lists; Benjamin should see tenant config, not end-customer PII.
- Show stale cache and pending sync states clearly.

## Verification

Test onboarding gates, publish blocking, business switching, and disconnected Google states.
