---
name: alinks-appointments
description: Use when implementing ALINKS appointments, salon packages, pay-then-book flows, staff or doctor rosters, clinic booking, license gates, patient tabs, slot capacity, reminders, or no-show workflows.
---

# ALINKS Appointments

## Overview

One appointment engine serves salons, beauty centers, professional services, and clinics. Compliance differs by vertical.

## Source Sections

- Baseline section `3B`.
- Baseline Q013, Q016-Q018, Q023, Q026, Q040.
- Legal docs for salon, clinic, pharmacy, tenant privacy, and checkbox text.

## Launch Shape

- MVP uses 1:1 slot booking.
- Salon/beauty supports package selection, payment, then slot booking.
- Clinic supports doctor selection, slot booking, patient contact, optional visit reason, and license display.
- Group classes are Phase 2, not MVP.

## Compliance

- Salon and beauty: honor system plus ToS.
- Clinic/doctor: license on file and approval required before booking live.
- Pharmacy: Phase 2, OTC only, no prescription upload or online consult.
- Patient rows go to tenant storage, not platform Postgres.

## Storage Tabs

- Use `Appointments` for appointment rows.
- Use `Patients` for clinic mode.
- Use `Customers` for salon and other non-clinic services.
- Log writes in `Activity Log`.

## Verification

Test slot conflicts, payment-to-booking linking, license gate blocking, no diagnosis storage, and retry behavior for storage writes.
