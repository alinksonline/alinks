================================================================================
ALINKS — FOOD INDUSTRY DOCS (INDEX)
================================================================================
Folder: industries-docs/food_industry/
Purpose: Anchor specifications for Food industry product, modules, lifecycles,
         inventory/menu, Superadmin types, Billing SKUs, and seamless integration
         between modules. This is the source of truth for food — update CHANGE LOG
         sections when decisions change.

Parent index: industries-docs/ (other industries will get sibling folders).
Ops/setup:    integration_setup_docs/24-food-industry-product-modules.txt
              (points here; env, sheets, billing wiring).

--------------------------------------------------------------------------------
READ ORDER
--------------------------------------------------------------------------------
  00-README-INDEX.txt                 ← you are here
  01-food-industry-anchor.txt         ← master principles + hard rules
  02-types-compatibility-matrix.txt   ← cloud / restaurant / catering combos
  03-website-plan-layer.txt           ← Layer 1: site + menu display + WhatsApp
  04-module-delivery.txt
  05-module-pickup.txt
  06-module-restaurant-dine-in.txt
  07-module-catering.txt
  08-module-kitchen-management.txt
  09-menu-inventory-categories-modifiers.txt
  10-subtype-distinctions.txt         ← bar, bistro, fine dining, cloud, etc.
  11-module-integration-matrix.txt    ← how modules talk to each other
  12-billing-skus-pricing-charm.txt
  13-superadmin-industry-catalog.txt
  14-registration-upsell-flow.txt
  15-multi-branch-pricing.txt         ← per-branch fees, 5–10% off extra outlets
  16-coupon-codes-seasonal-discounts.txt  ← Xmas/EOY 40–50%, platform vs tenant coupons

  Delivery riders / third-party / PT-FT: see 04-module-delivery.txt

--------------------------------------------------------------------------------
QUICK HARD RULES
--------------------------------------------------------------------------------
  • Cloud kitchen NEVER has Restaurant Dine-in (no tables / table QR).
  • Cloud kitchen CAN buy Catering module.
  • Restaurant MAY enable Dine-in + Delivery + Pickup + Catering + Kitchen.
  • Kitchen Management is EXTRA; works across food types; ticket shape follows
    enabled modules.
  • Main website pricing = Website plan (menu + WhatsApp), not full module matrix.
  • Platform Billing (tenant→Artix) ≠ Tenant Checkout (customer→shop food pay).
  • Google Calendar sync is FREE for all applicable industries (incl. catering).

--------------------------------------------------------------------------------
FILE MAP (module docs)
--------------------------------------------------------------------------------
  Each module file contains:
    - Definition & who can buy it
    - What it enables (admin + public)
    - Full lifecycle (discover → disable)
    - Inventory / menu impact
    - Instant integration with other modules
    - Data objects (conceptual)
    - Out of scope / future

Last index update: 2026-07-16
================================================================================
