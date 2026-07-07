---
name: alinks-architecture-guardrails
description: Use when editing ALINKS imports, folders, shared modules, route groups, domain boundaries, or any code that might cross core, platform, tenant, component, or app-layer responsibilities.
---

# ALINKS Architecture Guardrails

## Overview

Keep ALINKS layered. The architecture is intentionally simple so a solo founder can ship without turning the monolith into a knot.

## Layer Rules

- `src/core`: pure primitives only. It may not import `platform`, `tenant`, `components`, or `app`.
- `src/platform`: Artix-owned platform domain. It may import `core`; do not import `tenant`.
- `src/tenant`: tenant business domain. It may import `core` and platform services when needed.
- `src/components/ui`: dumb primitives only; no DB, auth, routing decisions, or tenant storage.
- `src/components/shared`: layout helpers only.
- `src/components/platform`, `src/components/tenant`, `src/components/admin`: presentation chrome for that surface.
- `src/app`: route composition. Keep heavy domain logic out of page files.

## Before Editing

1. Read `src/ARCHITECTURE.txt`.
2. Check existing imports with `rg -n "from \"@/" src`.
3. Preserve route-group ownership: marketing, platform, admin, site.
4. Prefer adding domain functions under `platform` or `tenant` instead of embedding logic in components.

## Verification

Run:

```bash
npm run typecheck
npm run lint
npm run build
```

For broad changes, inspect generated routes in the build output and confirm middleware still compiles.
