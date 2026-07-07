---
name: alinks-tap-blast-sharing
description: Use when implementing ALINKS Tap and Blast, product sharing, package sharing, WhatsApp messages, Instagram or Facebook share assets, Open Graph cards, share image generation, QR codes, short links, or share analytics.
---

# ALINKS Tap and Blast Sharing

## Overview

Tap and Blast is ALINKS' social sharing engine. It should create a polished mobile sharing flow, not just copy raw links.

## Source Sections

- Baseline section `15`.
- Baseline Q028-Q030.

## Feature Rules

- Share shop links and product links for all tiers.
- Basic share cards include ALINKS watermark.
- Pro and Enterprise cards are tenant-branded without ALINKS watermark.
- Pro adds format picker, story/feed/status formats, multi-product blast, QR, and analytics.
- Customer-side product sharing is Phase 2.

## Share Targets

Prioritize WhatsApp chat, WhatsApp status, Instagram story/feed, Facebook post/story/groups, Telegram, native share sheet, copy link, QR, and SMS fallback.

## Implementation Notes

- Generate images server-side and store final assets in R2 or equivalent object storage.
- Cache generated card URLs in Redis with appropriate TTL.
- Use Open Graph metadata on public product and package pages.
- Track aggregate clicks only; do not store who clicked.
- Rate limit generation per tenant.

## Verification

Test mobile share fallbacks, OG image rendering, deleted product links, watermark gating, and analytics without client PII.
