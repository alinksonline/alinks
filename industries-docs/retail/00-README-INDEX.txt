================================================================================
ALINKS — RETAIL & WHOLESALE INDUSTRY DOCS (INDEX)
================================================================================
Folder: industries-docs/retail/
Purpose: Source of truth for multi-brand product commerce — kirana to fashion,
         kitchenware to electronics, retail shops and wholesale markets.
Status: DESIGN ANCHOR

Ops pointer:
  integration_setup_docs/28-retail-industry-product.txt

--------------------------------------------------------------------------------
READ ORDER
--------------------------------------------------------------------------------
  00-README-INDEX.txt
  01-retail-industry-anchor.txt
  02-diversification-retail-vs-wholesale.txt
  03-multi-brand-catalog.txt
  04-store-inventory-categories-variations.txt
  05-module-storefront.txt
  06-module-wholesale-b2b.txt
  07-module-marketplace-multi-brand.txt
  08-module-checkout-payments.txt
  09-website-plan-layer.txt
  10-integration-matrix.txt
  11-billing-skus-pricing.txt
  12-superadmin-catalog.txt
  13-what-we-will-not-build.txt
  14-onboarding-trade-mode-and-catalog-freedom.txt  ← retail/wholesale/both + sell anything
  15-management-modules-and-plan-caps.txt           ← module list + caps anti-chaos

--------------------------------------------------------------------------------
QUICK HARD RULES
--------------------------------------------------------------------------------
  • Onboarding trade mode FROZEN: Retail only | Wholesale only | Retail + Wholesale.
  • Sell ANY legal product category (open taxonomy) — electronics, plumbing,
    toys, plants, herbal, veggies, fashion, … not fixed vertical-only lists.
  • No paid module per category; modules = capabilities (inventory, delivery, …).
  • Retail = B2C; Wholesale = B2B MOQ/tiers; Hybrid = both.
  • Multi-brand under ONE seller tenant (not multi-vendor settlement v1).
  • Plan product caps (e.g. 25 / 200 / 2000) — primary anti-loss lever.
  • Cart + tenant Razorpay/COD OK; Artix does NOT settle shop GMV.
  • Streamline modules — short list; NO retail multi-outlet POS seats
    (not in-store billing software; one online shop is enough).



Last index update: 2026-07-16
================================================================================
