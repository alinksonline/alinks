================================================================================
ALINKS — REAL ESTATE INDUSTRY DOCS (INDEX)
================================================================================
Folder: industries-docs/real_estate/
Purpose: Product source of truth for Real Estate on ALINKS.
Status: DESIGN ANCHOR (discussion locked into docs — implement later)

CRITICAL PRODUCT RULE (LOCKED)
  NO online property sales on ALINKS / NO platform checkout for land or units.
  ALINKS = discovery + listings + agents + leads (call / WhatsApp / visit).
  Money for plots/flats settles OFF platform (builder/agent bank, offline deed).

Ops pointer (when wired):
  integration_setup_docs/27-real-estate-industry-product.txt

--------------------------------------------------------------------------------
READ ORDER
--------------------------------------------------------------------------------
  00-README-INDEX.txt              ← you are here
  01-real-estate-anchor.txt        ← master design
  02-actor-roles-builders-agents.txt
  03-property-types-versatility.txt
  04-listings-inventory-model.txt  ← not ecommerce cart
  05-module-lead-capture.txt
  06-module-agent-desk.txt         ← multi-company agents
  07-module-project-showcase.txt   ← builders / ventures / gated / villas
  08-module-site-visit-booking.txt ← optional slots (uses bookings patterns)
  09-website-plan-layer.txt        ← what main site sells
  10-integration-matrix.txt
  11-billing-skus-pricing.txt
  12-superadmin-catalog.txt
  13-what-we-will-not-build.txt
  14-agent-inventory-privacy-bank.txt  ← Property-Bank privacy (open/teaser/private)
  15-company-vs-agent-separation.txt   ← separate sites; no mix; no approval graph
  16-listing-deal-types-sell-resale-rent-lease.txt

--------------------------------------------------------------------------------
QUICK HARD RULES
--------------------------------------------------------------------------------
  • No “Buy now / Pay online for this plot” as platform commerce.
  • No Artix as property escrow or registration authority.
  • Company website and Agent website are SEPARATE — do not mix accounts.
  • No company-approval of agent links required in v1.
  • Same project MAY appear on many agent sites (each owns listing + leads).
  • Property-Bank (UI name): TEASER default for protective agents; OPEN allowed;
    PRIVATE off-site. Other agents cannot browse others’ banks.
  • Deal types: Sell | Resale | Rent | Lease (company + agent).
  • Price public display = company or agent wish (not platform-forced).
  • Plan limits on listings/projects (e.g. 10 / 50 / 200).
  • Leads → tenant Google Sheet / BYO Supabase.
  • Google Calendar free for site visits when used.


Last index update: 2026-07-16
================================================================================
