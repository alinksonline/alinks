---
name: alinks-tenant-customization
description: Use when building ALINKS tenant theming, branding, per-business settings, template overrides, vertical-specific content, custom domains, or any feature that changes appearance or behavior per tenant.
---

# ALINKS Tenant Customization

## Overview

Tenant customization should feel powerful but bounded. Tenants can brand their mini-site and dashboard within the limits of the ALINKS system instead of editing raw code.

## Source Files

- `src/core/types/tenant.ts`
- `src/tenant/context/tenant-context.ts`
- `src/app/(site)/*`
- `src/app/(platform)/*`
- Baseline sections `3`, `3A`, `3B`, `8A`, and `9B`

## Customization Scope

- Business name, handle, logo, colors, and public copy.
- Vertical-specific page templates and section ordering.
- Business switcher for multi-business tenants.
- Custom domain settings for Pro+.
- Tiered branding rules such as ALINKS watermark removal on higher plans.

## Boundaries

- Keep customization data separate from platform chrome.
- Use config and template state, not per-tenant code forks.
- Prefer a shared template engine with data-driven overrides.
- Do not let customization break legal, billing, or storage rules.

## Verification

Test that tenant-specific values render correctly, defaults still work, and customization cannot override hard platform rules.
