================================================================================
ALINKS / ARTIX — LEGAL DOCUMENTS FOLDER
================================================================================
Created: 2026-07-04 (planning session)
Status: DRAFT — ALL FILES REQUIRE LAWYER REVIEW BEFORE PUBLICATION OR USE
Entity: Artix (Proprietorship → Artix Private Limited before public launch)
Product: ALINKS — alinks.online
Founder: Benjamin Anand, Andhra Pradesh, India
================================================================================

PURPOSE
-------
This folder contains draft legal text derived from ALINKS_BASELINE.txt (Section 5C,
5, 6A, 6B). These are PLANNING DRAFTS for a qualified Indian lawyer to review,
revise, and approve. Do NOT publish or bind users without lawyer sign-off.

CORE PRINCIPLE (LOCKED)
-----------------------
"Any business they conduct is their headache, not ours."
Artix rents software. Tenants run their businesses. Legal docs enforce this.

TWO LAYERS
----------
Layer A — Artix ↔ Tenant (platform documents)
Layer B — Tenant ↔ Customer (templates tenants publish on mini-sites)

FILE INDEX
----------
00  README (this file)
01  Platform Terms of Service (Tenant Agreement)
02  Platform Privacy Policy (DPDP-aligned draft)
03  End-User Notice (footer / short notice)
04  Payment Domains Addendum (BYO shop + Artix SaaS; PayFac parked — Q005 2026-07)
05  Acceptable Use Policy
06  Data & Storage Addendum (Google Sheets / Supabase BYO)
07  Tenant Privacy Policy Template
08  Tenant Terms — Salon / Beauty
09  Tenant Terms — E-commerce (general shop)
10  Tenant Terms — Grocery / Food
11  Tenant Terms — Restaurant / Cloud kitchen
12  Tenant Terms — Clinic / Doctor
13  Tenant Terms — Pharmacy (OTC, Phase 2)
14  Tenant Terms — General business
15  Sector disclaimers & microcopy (customer-facing snippets)
16  Touchpoint checkbox text (signup, checkout, booking)
17  Lawyer task list & launch legal checklist
18  DPDP grievance officer notice
19  ALINKS subscription refund & cancellation policy
20  Legal acceptance matrix (what to log in database)
21  DPDP Act 2023 — ALINKS status audit (product vs policy; living doc)

AGENT SKILLS (legal/skills/)
----------------------------
  INDEX.md                         — skill pack index
  alinks-legal-compliance-gates  — publish gates, acceptances, sector rules
  alinks-audit-review              — baseline audits, traceability, gap review
  alinks-dpdp-compliance           — DPDP checklist, user rights, grievance
  alinks-compliance-security-guardrails — pre-deploy security & compliance audit

Symlinked from .agents/skills/ for Google Antigravity agent discovery.
Automatic: .agent/rules/compliance-guardrails.md (always on)
           npm pretest + GitHub CI on every test/PR
On demand:  /guardrails-scan workflow in Antigravity

TWO DOC TYPES IN THIS FOLDER
----------------------------
  01–20  Draft legal TEXT — lawyer review before publication
  21     Living PRODUCT AUDIT — what the app implements today (update after shipping)

REGISTRATIONS REQUIRED (NOT IN THIS FOLDER — ACTION ITEMS)
----------------------------------------------------------
[ ] Artix Private Limited incorporation
[ ] GST registration (SaaS ~18%)
[ ] DPDP grievance officer appointed
[ ] Razorpay Partner + PhonePe Partner applications
[ ] Lawyer sign-off on payment facilitation model (PA license exemption)

URLS (WHEN LIVE)
----------------
Platform:  https://alinks.online/terms
           https://alinks.online/privacy
           https://alinks.online/aup
           https://alinks.online/payment-terms
Tenant:    https://[handle].alinks.online/terms
           https://[handle].alinks.online/privacy

VERSIONING
----------
Every published doc: version number (v1.0), effective date, change log.
Database table: legal_acceptances (user_id, doc_type, version, ip, timestamp)

================================================================================
END README
================================================================================