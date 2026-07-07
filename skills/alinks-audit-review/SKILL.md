---
name: alinks-audit-review
description: Use when reviewing ALINKS code, content, legal gates, publish rules, logs, or traceability; when checking that a feature matches the baseline; or when auditing for regressions, missing tests, or compliance gaps.
---

# ALINKS Audit Review

## Overview

Audit work is about proving what the system does, not what we hope it does. Compare implementation against the baseline, legal drafts, and data rules.

## What to Check

- Does code match the locked product decision?
- Does the feature violate tenant-data boundaries?
- Are publish gates enforced?
- Are legal versions and acceptances logged?
- Are there tests or at least a clear verification path?
- Did the change add hidden coupling across layers?

## Review Lens

- Findings first.
- Severity ordered by user impact and compliance risk.
- Mention exact files and lines when possible.
- Separate implemented behavior from planned behavior.
- Call out missing tests and residual risk plainly.

## Audit Sources

- `ALINKS_BASELINE.txt`
- `src/ARCHITECTURE.txt`
- `legal/20-LEGAL-ACCEPTANCE-MATRIX.txt`
- platform DB schema and routing code

## Verification

Treat a successful audit as evidence-based: the code, docs, and behavior must align. If they do not, name the gap directly.
