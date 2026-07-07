---
name: alinks-tenant-storage
description: Use when implementing ALINKS Google Sheets, tenant BYO Supabase, StorageAdapter, client data writes, dashboard reads, retry queues, Redis cache, or anything involving customer, order, booking, or patient rows.
---

# ALINKS Tenant Storage

## Overview

Client data belongs to the tenant. ALINKS transfers data into tenant-owned Google Sheets by default, or tenant-owned Supabase for the paid connector path.

## Source Files

- `src/tenant/storage/types.ts`
- `src/tenant/storage/google-sheets-adapter.ts`
- Baseline sections `5D`, `5E`, `5F`, and `5G`
- Legal docs `06-DATA-STORAGE-ADDENDUM-GOOGLE-SUPABASE.txt` and `20-LEGAL-ACCEPTANCE-MATRIX.txt`

## Storage Rules

- Pro shop, checkout, and booking flows require Google connect unless Supabase connector is active.
- Basic website and WhatsApp-only flows may work without Google.
- Writes go directly to Google Sheets or tenant Supabase as source of truth.
- Redis may cache short-lived reads only; it is not permanent storage.
- Failed Google writes should be queued for up to 24 hours, then dropped with dashboard visibility.
- Superadmin should not manually fix individual customer rows.

## Google Sheets Shape

Use one spreadsheet per business:

- `Appointments` for booking verticals.
- `Orders` for commerce verticals.
- `Customers` for non-clinic contact summaries.
- `Patients` for clinic mode.
- `Activity Log` for transparent writes.

## Verification

For adapters, test failure modes: token expired, append failure, retry success, duplicate prevention, and no platform DB persistence of PII.
