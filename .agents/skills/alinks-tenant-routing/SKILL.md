---
name: alinks-tenant-routing
description: Use when implementing or changing ALINKS host routing, handles, path tenant sites, subdomain tenant sites, custom domains, middleware headers, canonical URLs, or reserved handle validation.
---

# ALINKS Tenant Routing

## Overview

Routing maps incoming host and path to one of four surfaces: marketing, platform, admin, or tenant site. Handle identity is permanent and global.

## Source Files

- `src/platform/routing/resolve-request.ts`
- `src/middleware.ts`
- `src/core/types/routing.ts`
- `src/core/utils/slug.ts`
- `src/core/constants/limits.ts`
- Baseline section `8A. DOMAINS & URL ROUTING`

## Locked Rules

- Basic uses `alinks.online/[handle]`.
- Pro and Enterprise use `[handle].alinks.online`.
- Pro and Enterprise may add a custom domain.
- Custom domains are additive; the handle subdomain stays live.
- Reserved handles include app, api, admin, dashboard, login, terms, privacy, static, assets, `_next`, and related platform words.
- Custom domain lookup is planned; current code only marks `custom-domain` mode.

## Implementation Notes

- Middleware currently sets headers; it does not rewrite routes.
- Keep platform prefixes such as `/dashboard`, `/login`, `/signup`, and `/api` out of tenant path matching.
- Do not treat legal paths like `/terms` and `/privacy` as tenant handles.
- When adding redirects, encode the tier and URL mode explicitly to avoid breaking Basic path sites.

## Verification

Add or run focused tests for `resolveRequest(host, pathname)` once a test framework exists. Until then, use small direct TypeScript or Node checks plus `npm run build`.
