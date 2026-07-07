---
name: alinks-platform-db
description: Use when changing ALINKS Drizzle schema, platform Postgres tables, migrations, tenant config persistence, legal acceptance logs, billing metadata, OAuth token references, or data ownership boundaries.
---

# ALINKS Platform DB

## Overview

Artix Postgres is for tenant and platform configuration only. Never add customer, patient, buyer, booking, or order PII tables to the platform database.

## Source Files

- `drizzle.config.ts`
- `src/platform/db/client.ts`
- `src/platform/db/schema/*`
- `src/core/types/tenant.ts`
- Baseline sections `5D`, `5E`, `5F`, and `8B`

## Allowed Data

Platform DB may store:

- Tenant account, phone, email, tier, status.
- Business config, handle, vertical, pages, theme, catalog config.
- Subscription and billing references.
- Google spreadsheet IDs and encrypted token references.
- Supabase connection references for tenant-owned projects.
- Legal acceptance records and version metadata.
- License upload metadata for regulated verticals.

Platform DB must not store:

- Customer names, phones, addresses, or CRM lists.
- Patient records, visit reasons, diagnoses, or appointment rows.
- Order history linked to end customers.
- Long-term payment details linked to a buyer.

## Drizzle Patterns

- Use Postgres `pgTable` and explicit foreign keys.
- Add indexes when adding lookup paths such as handle, tenant, custom domain, or status.
- Keep enum-like values aligned with core TypeScript constants.
- Generate migrations with `npm run db:generate`; do not hand-edit generated SQL unless necessary.

## Verification

Run `npm run typecheck`, `npm run build`, and the relevant Drizzle command. Inspect migrations for accidental client PII.
