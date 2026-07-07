---
name: alinks-commerce
description: Use when implementing ALINKS catalog, product limits, grocery fields, WhatsApp ordering, carts, checkout, COD, inventory, order writes, ecommerce templates, or Basic versus Pro commerce gating.
---

# ALINKS Commerce

## Overview

ALINKS commerce supports broad small-business catalogs. Basic is WhatsApp catalog commerce; Pro is full checkout commerce.

## Source Sections

- Baseline sections `3A`, `4`, `5B`, `6B`, `9B`, and Q002, Q020-Q022.
- Legal docs for ecommerce, grocery, restaurant, payment, AUP, and checkbox text.

## Tier Rules

- Basic: 25 products, catalog, WhatsApp/call/email CTA, no on-site payment.
- Pro: 200 products, cart, variants, inventory, COD/UPI/card through Artix payment stack, Google/Supabase order writes.
- Enterprise: 2000 products, advanced analytics, multi-business options.

## Product Fields

Support name, images, price, MRP, SKU, stock, category, GST slab, variants, and status. Grocery needs unit fields such as kg, g, L, ml, piece, dozen; food can include expiry and FSSAI-related fields.

## Data Rule

Catalog config may live in Artix Postgres. Order rows with customer details must go to tenant Google Sheets or tenant Supabase.

## Verification

Test tier limits, reserved prohibited categories, WhatsApp message generation, COD toggle, and order-write failure behavior.
