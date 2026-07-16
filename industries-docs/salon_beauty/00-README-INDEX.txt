================================================================================
ALINKS — SALON & BEAUTY INDUSTRY DOCS (INDEX)
================================================================================
Folder: industries-docs/salon_beauty/
Purpose: Dedicated pack for salons, beauty parlours, spas (service booking).
Status: PRODUCT ANCHOR (complete design pack)

Shared engines (do not fork calendars):
  bookings_industry/   → book.core slots, reminders, Google Calendar FREE
  retail/              → optional product retail (oils, kits) if they sell goods
  food_industry/       → NOT for salon meals; ignore unless café hybrid

Code today:
  verticals: salon, beauty
  Editor: Packages, Staff, Checkout (tenant PG)
  Templates: src/tenant/salon/package-templates.ts
  Skill: alinks-appointments (pay-then-book for salon/beauty)

Ops pointer:
  integration_setup_docs/29-salon-beauty-industry-product.txt

--------------------------------------------------------------------------------
READ ORDER
--------------------------------------------------------------------------------
  00-README-INDEX.txt
  01-salon-beauty-anchor.txt
  02-types-salon-vs-beauty-spa.txt
  03-website-plan-layer.txt
  04-module-packages.txt              ← service packages catalogue
  05-module-staff-roster.txt
  06-module-pay-then-book.txt         ← deep-dive payment → slot
  07-module-free-booking.txt          ← no charge to client (opt-in free)
  08-module-appointments-calendar.txt ← book.core profile for salon
  09-module-checkout-tenant-pg.txt
  10-module-reminders-noshow.txt
  11-module-retail-add-on-products.txt ← optional shop for products
  12-inventory-categories-variations.txt
  13-integration-matrix.txt
  14-billing-skus-pricing-caps.txt
  15-superadmin-catalog.txt
  16-registration-upsell-flow.txt
  17-multi-location-salons.txt
  18-what-we-will-not-build.txt

--------------------------------------------------------------------------------
QUICK HARD RULES
--------------------------------------------------------------------------------
  • Salon/beauty = honor system + ToS (no medical license gate like clinic).
  • Primary motion: PACKAGE → (optional pay) → STAFF → SLOT.
  • Clients may book FREE (no charge) if tenant chooses — same as bookings.
  • Pay-then-book uses TENANT Razorpay/COD — Artix does not settle service GMV.
  • Customer rows → tenant Sheets/Supabase (Customers tab), not platform PII DB.
  • Google Calendar FREE (tenant Gmail) for staff calendars.
  • No clinic patient diagnosis; no restaurant kitchen.
  • Optional retail products (shampoo etc.) via retail patterns — separate cap.

Last index update: 2026-07-16
================================================================================
