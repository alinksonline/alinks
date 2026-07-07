---
name: alinks-payments-billing
description: Use when implementing ALINKS tenant subscriptions, billing plans, trials, Razorpay, PhonePe, UPI, COD, payment facilitation, payment webhooks, checkout enablement, refunds, invoices, or launch promo logic.
---

# ALINKS Payments Billing

## Overview

ALINKS has two payment domains: tenants pay Artix for SaaS subscriptions, and tenant customers may pay through Artix-facilitated commerce flows once legally approved.

## Source Sections

- Baseline section `4`, `6B`, Q005, Q033-Q039.
- Legal docs `04-PAYMENT-FACILITATION-ADDENDUM.txt` and `19-SUBSCRIPTION-REFUND-POLICY.txt`.

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

## Commerce Payment Rules

- Artix-facilitated Razorpay/PhonePe model requires lawyer review.
- COD defaults on for Indian shops but tenant bears risk.
- Payment addendum acceptance is required before on-site checkout.
- Store payment references needed for reconciliation; do not store buyer PII long term in platform DB.

## Verification

Test webhook idempotency, plan gates, trial expiry, unpublish behavior, refund policy display, and legal gate blocking.
