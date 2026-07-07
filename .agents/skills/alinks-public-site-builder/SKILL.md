---
name: alinks-public-site-builder
description: Use when building ALINKS tenant public mini-sites, page blocks, vertical templates, mobile-first tenant UI, tenant footers, public SEO metadata, product pages, booking pages, or 5-page constraints.
---

# ALINKS Public Site Builder

## Overview

Tenant public sites are mobile-first mini-websites, not full CMS websites. The 5-page limit is a product constraint, not a bug.

## Source Files

- `src/app/(site)/[handle]/page.tsx`
- `src/components/tenant/*`
- `src/tenant/site/get-public-business.ts`
- `src/tenant/context/tenant-context.ts`
- Baseline sections `1`, `3`, `3A`, `3B`, `8B`, and `9B`

## Product Rules

- Max 5 pages per business.
- Mobile and tablet are primary; desktop is supported but secondary.
- Tenant branding appears on tenant sites; platform navigation does not.
- Footer must make tenant independence clear and expose tenant terms/privacy links.
- Basic may show ALINKS branding. Pro and Enterprise remove it.

## Template Priorities

Launch templates should favor:

- General startup.
- Portfolio/profile.
- Simple shop/catalog with WhatsApp CTA.
- Salon/beauty packages.
- Clinic/doctor booking only after license gate support exists.

## Implementation Notes

- Fetch tenant business data on the server.
- Keep reusable visual primitives in `components/ui` and tenant chrome in `components/tenant`.
- Do not read or render customer, patient, or order rows from platform DB.
- Use semantic metadata and Open Graph once product/package pages exist.
