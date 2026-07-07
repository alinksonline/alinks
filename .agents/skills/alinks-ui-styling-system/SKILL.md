---
name: alinks-ui-styling-system
description: Use when building ALINKS shared components, buttons, cards, shells, spacing, typography, color tokens, responsive layouts, or reusable styling patterns.
---

# ALINKS UI Styling System

## Overview

Use the existing component vocabulary first. ALINKS UI should stay restrained, mobile-friendly, and consistent across marketing, platform, admin, and tenant surfaces.

## Source Files

- `src/components/ui/*`
- `src/components/shared/*`
- `src/components/platform/*`
- `src/components/tenant/*`
- `src/components/admin/*`
- `src/app/globals.css`
- `tailwind.config.ts`

## Reuse Rules

- Prefer existing primitives before adding new ones.
- Keep primitives dumb and prop-driven.
- Add variants only when multiple real call sites need them.
- Use `cn()` for class merging instead of ad hoc string concatenation.
- Keep spacing, radius, and shadows aligned with existing small-card patterns.
- Avoid decorative complexity that does not serve the tenant workflow.

## Styling Notes

- Maintain mobile-first responsive behavior.
- Ensure all components properly support both light mode and dark mode.
- Use semantic layout shells for page framing.
- Keep tenant and platform chrome visually distinct.
- Add new tokens only when the design system needs them across more than one surface.

## Verification

Check that the new primitive works in more than one place, does not break existing pages, and still satisfies the repo’s general build and lint rules.
