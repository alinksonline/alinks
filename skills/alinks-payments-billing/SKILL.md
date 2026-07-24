---
name: alinks-payments-billing
description: Use when implementing ALINKS tenant subscriptions, billing plans, trials, Razorpay, PhonePe, UPI, COD, payment facilitation, payment webhooks, checkout enablement, refunds, invoices, or launch promo logic.
---

# ALINKS Payments Billing

## Overview

ALINKS has **two payment domains** (Q005 dual rails, re-locked 2026-07):

1. **Platform billing** — Tenant → Artix (SaaS subscriptions, Select modules, AI credits). Artix is merchant of record.
2. **Tenant storefront** — Customer → shop via **tenant BYO Razorpay keys**. Tenant is seller of record; money settles to their merchant account. Artix does not hold shop GMV.

Optional Artix-facilitated PayFac for shop sales is **parked** until lawyer review (`legal/04` Part III).

## Source Sections

- Baseline Q005 (dual rails), Q020 (COD), Q033–Q039.
- `legal/04-PAYMENT-FACILITATION-ADDENDUM.txt` (Payment Domains Addendum v0.2).
- `legal/19-SUBSCRIPTION-REFUND-POLICY.txt`.
- Code: `src/platform/payments/tenant-gateway.ts`, `src/app/actions/commerce.ts`, `src/platform/payments/razorpay.ts`.

## Subscription Rules

- No forever-free tier.
- 14-day Pro trial requires phone OTP, business name, and vertical.
- Public publish requires paid plan unless a valid trial rule explicitly allows otherwise.
- Day 15 unpaid unpublishes the site.
- Basic monthly INR 599, Pro INR 1599, Enterprise INR 6999.
- Annual per-month equivalents: Basic INR 499, Pro INR 1499, Enterprise INR 4999.

## Launch Promos

- First 500 annual subscribers get founders lock.
- First 100 annual subscribers pay 10 months and get 12.
- No monthly launch discount.

## Storefront Payment Rules (BYO)

- Pro (or entitled commerce path) required for on-site online checkout.
- Tenant connects own Razorpay Key ID + secret; secret encrypted at rest.
- Log `TENANT_BYO_GATEWAY` acceptance when keys connect.
- COD defaults on for Indian shops; tenant bears COD risk.
- Store payment refs (`checkout_sessions`) only — no long-term buyer PII in platform DB.
- Presence industry: never enable shop cart/checkout.

## Do not

- Treat Artix as seller of shop goods.
- Use `razorpaySubMerchantId` for live BYO checkout.
- Ship PayFac/sub-merchant onboarding without reopening Q005 + lawyer.

## Verification

Test identity + industry gates on `/api/create-order`, key connect/disconnect, COD path, plan gates, trial expiry/unpublish, and legal evidence logging.
