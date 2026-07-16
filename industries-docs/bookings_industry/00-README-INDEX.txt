================================================================================
ALINKS — BOOKINGS INDUSTRY DOCS (INDEX)
================================================================================
Folder: industries-docs/bookings_industry/
Purpose: Anchor specs for appointment / reservation style businesses — clinics,
         professional consultations, lawyers, function & banquet halls, and
         related subtypes. Source of truth for product + Superadmin + Billing
         modules for BOOKINGS (not food delivery, not fashion inventory).

Shared engine note:
  One booking/slots engine powers many verticals; COMPLIANCE + fields + modules
  differ by type (see alinks-appointments skill + these docs).

Ops pointer:
  integration_setup_docs/25-bookings-industry-product-modules.txt

--------------------------------------------------------------------------------
READ ORDER
--------------------------------------------------------------------------------
  00-README-INDEX.txt                 ← you are here
  01-bookings-industry-anchor.txt     ← master principles
  02-types-compatibility-matrix.txt
  03-website-plan-layer.txt           ← site + catalogue + WhatsApp/book CTA
  04-module-appointments-core.txt     ← slots, staff/resources, calendar
  05-module-clinic-healthcare.txt
  06-module-professional-consult.txt  ← coaches, advisors, general consults
  07-module-legal-lawyers.txt
  08-module-venue-banquet-hall.txt    ← function / banquet hall bookings
  09-module-payments-deposits.txt     ← pay-to-confirm, deposits (tenant PG)
  10-module-reminders-noshow.txt
  11-resources-inventory-categories.txt  ← services, rooms, halls, packages
  12-subtype-distinctions.txt
  13-module-integration-matrix.txt
  14-billing-skus-pricing-charm.txt
  15-superadmin-industry-catalog.txt
  16-registration-upsell-flow.txt
  17-multi-branch-multi-location.txt
  18-coupon-codes-seasonal-discounts.txt
  19-module-google-calendar-gmail.txt   ← FREE Gmail → Google Calendar (all industries)

--------------------------------------------------------------------------------
QUICK HARD RULES
--------------------------------------------------------------------------------
  • Patient/client PII → tenant Sheets/BYO Supabase — NOT platform Postgres long-term.
  • Clinic/doctor: license on file + approval before booking goes live.
  • No diagnosis / prescription marketplace in MVP clinic booking.
  • Lawyers: engagement/consultation booking — not full case management v1.
  • Banquet halls: date + slot + capacity/package — not restaurant table QR (food).
  • Platform Billing (tenant→Artix) ≠ tenant Checkout (client pays professional).
  • Website plan first (presence + book CTA / WA); modules upgrade ops depth.
  • Google Calendar = tenant’s own Gmail/Workspace (OAuth), FREE, all industries
    where applicable (bookings + catering, etc.) — not a paid module.
  • Google setup for tenants = one-click Connect (no tenant API keys); platform
    guide: integration_setup_docs/26-google-tenant-integrations-guide.txt
  • ALINKS is system of record for bookings; Calendar is sync convenience.
  • Tenants may use bookings FREE for clients (no charge) — pay-to-book is optional.

Last index update: 2026-07-16
================================================================================
