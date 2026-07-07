---
name: alinks-ai-seo-content
description: Use when implementing ALINKS AI, product descriptions, SEO titles, meta descriptions, schema markup, multilingual content, Perplexity or OpenRouter calls, AI credit packs, or AI usage limits.
---

# ALINKS AI SEO Content

## Overview

ALINKS AI helps tenants create content and SEO faster. Included AI is capped by subscription; client-facing AI or overage uses paid credits.

## Source Sections

- Baseline section `16`.
- Baseline Q031-Q032.

## Scope

Supported tenant-facing generation:

- Product descriptions.
- Service and package descriptions.
- SEO titles and meta descriptions.
- Social share captions.
- Business intro/about copy.
- Local search copy and schema fields.

## Provider Rules

- Baseline locks OpenRouter plus Perplexity routing.
- Prefer server-side calls only; never expose provider keys to the browser.
- Use model/task routing so simple copy does not use expensive research paths.
- Store generated tenant content as tenant config after tenant accepts or edits it.

## Limits

- Basic has smaller included caps.
- Pro and Enterprise get larger subscription-included caps.
- Tenant overage and all end-customer AI use paid credit packs.

## Verification

Test prompt injection resistance, usage metering, tier caps, empty provider credentials, retries, and generated metadata escaping.
