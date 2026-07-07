---
name: alinks-brand-assets
description: Use when placing ALINKS logos, favicons, OG images, app icons, or determining which logo variant to use based on the immediate background brightness.
---

# ALINKS Brand Assets & Logo Usage

## Overview

Specific logos must be used depending on the background they are placed on. The choice of logo depends strictly on the **immediate background** (whether it is a solid color, gradient, or image), irrespective of whether the global app theme is in dark mode or light mode.

## Logo Selection Rules

- **Dark Backgrounds**: If the background behind the logo is dark in any way (image, solid color, or gradient), you **MUST** use:
  `/Users/benjaminanand/Development/SOFTWARE/ALINKS/assets/LOGO-for-darck-backgrounds.png`

- **Light Backgrounds**: If the background behind the logo is light in any way (image, solid color, or gradient), you **MUST** use:
  `/Users/benjaminanand/Development/SOFTWARE/ALINKS/assets/LOGO-for light-backgrounds.png`

## Icon & Favicon Rules

For any of the following icon use cases, you **MUST** use `/Users/benjaminanand/Development/SOFTWARE/ALINKS/assets/favicon.png`:
- Favicons (e.g., `<link rel="icon">`)
- App Icons
- Open Graph (OG) Image icons
- Anywhere an "Artix" or "Alinks" icon is explicitly required

## Verification

Always verify the contrast of the logo against its immediate containing element. Do not rely on the global theme context if a specific container forces a dark or light background.
