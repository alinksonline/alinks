# Guardrails scan (pre-deploy)

Run the automated compliance and security scan, then summarize findings.

## Steps

1. Execute: `npm run guardrails:scan`
2. If Critical > 0: fix issues and re-run until Critical = 0
3. Read `legal/skills/alinks-compliance-security-guardrails/references/audit-checklist.md` for manual gaps
4. Output findings as: Critical → High → Medium → OK

## Also run before merge to main

```bash
npm run test && npm run lint && npm run build
```