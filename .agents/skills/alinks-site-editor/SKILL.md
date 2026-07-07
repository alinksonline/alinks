---
name: alinks-site-editor
description: Use when building the ALINKS Website Builder, theme editor, page editors (Home, About, Services, Contact), branding settings, or any UI where the tenant edits their site.
---

# ALINKS Site Editor & Theme Builder

## Overview

The ALINKS Site Editor allows tenants to customize their mini-sites (Pages, Theme, Branding) via a mobile-first WYSIWYG/form-based interface.

## Architectural Constraint: Dedicated Folder

**CRITICAL RULE:** All code related to "editing" (Theme Editor, Branding Settings, Page Content Editors, Website Builder Navigation) **MUST** be strictly encapsulated in its own dedicated folder. 
- Do not mix editor components with generic dashboard components or public site components.
- Recommended paths:
  - Routes: `src/app/(platform)/editor/*` (or similar dedicated route group)
  - Components: `src/components/editor/*`

## Core Editor Modules

Based on the product design mockups, the editor is divided into these primary flows:
1. **Website Builder (Page List):** The main hub to manage pages (Home, About, Services/Menu, Contact, Privacy, Terms).
2. **Page Editors:** Specific forms to edit sections within a page (e.g., Home Editor, About Editor, Services/Menu Editor, Contact Editor).
3. **Theme Settings:** Controls for Light/Dark mode, Primary/Accent colors, Typography, Border Radius, and Layout Style.
4. **Branding Settings:** Uploading Logos, Favicons, Cover Images, Business Name, and Custom URLs.

## UI/UX Rules

- The editor must be fully mobile-friendly.
- Forms should provide real-time or near-real-time previews (e.g., "Live Preview" or "Preview" buttons).
- Use a consistent bottom action bar for primary actions (e.g., "Save Changes", "Apply Theme", "Publish Branding").
- Keep the editor interface clean with distinct "Sections" and "Settings" tabs where applicable.
