# ALINKS Compliance Skills

Agent skills for legal gates, audits, and DPDP compliance. Canonical location: `legal/skills/`.

Symlinked from `.agents/skills/` and `skills/` for agent discovery.

| Skill | Use when |
|-------|----------|
| `alinks-legal-compliance-gates` | Legal acceptances, publish gates, regulated verticals, disclaimers, AUP |
| `alinks-audit-review` | Code/content audits, baseline alignment, traceability, compliance gap review |
| `alinks-dpdp-compliance` | DPDP Act 2023 audit, delete/export/grievance, cookie notice, status audit updates |
| `alinks-compliance-security-guardrails` | Pre-deploy security, secrets, headers, third-party resilience, insurance-grade audit (`npm run guardrails:scan`) |

Related docs: `legal/00-README-LEGAL-OVERVIEW.txt`, `legal/21-DPDP-ALINKS-STATUS-AUDIT.txt`.

**Antigravity:** skills symlinked in `.agents/skills/` — auto-invoked by description or ask agent to run `npm run guardrails:scan`.