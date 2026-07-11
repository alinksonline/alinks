---
name: alinks-feature-workflows
description: Use when implementing ALINKS feature behavior, state transitions, end-to-end flows, error handling, retries, validation, or user-visible workflow logic.
---

# ALINKS Feature Workflows

## Overview

Use this skill when a feature has more than one step or state. The goal is to make workflows predictable, resilient, and easy to reason about.

## Workflow Shape

For each feature, define:

1. Trigger.
2. Preconditions.
3. Happy path.
4. Failure path.
5. Retry or recovery.
6. What gets stored and where.
7. What the user sees.

## Working Rules

- Keep business logic out of components when possible.
- Model state explicitly.
- Handle loading, empty, success, and failure states.
- Keep retries and queues visible to the tenant.
- Prefer deterministic server behavior over hidden side effects.
- Treat client PII carefully and route it to tenant-owned storage only.

## Good Fit

Use this for signup, login, booking, checkout, publish, connect Google, sync failures, share generation, and similar multi-step flows.

## Verification

Confirm the workflow has a clear entry point, exit point, error state, and recovery path before considering it done.

Before marking any auth, signup, billing, storage, or publish workflow complete:

```bash
npm run guardrails:scan
```

Antigravity applies `.agent/rules/compliance-guardrails.md` automatically.
