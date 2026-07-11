# ALINKS Skill Pack

Project-local skills for future ALINKS work:

- `alinks-project-orientation`: start here for context.
- `alinks-architecture-guardrails`: layer boundaries and import rules.
- `alinks-tenant-routing`: handles, path routing, subdomains, custom domains.
- `alinks-platform-db`: Drizzle and platform Postgres data boundaries.
- `alinks-tenant-storage`: Google Sheets, Supabase, StorageAdapter, Redis cache.
- `alinks-legal-compliance-gates`: legal acceptances, publish gates, regulated verticals. (canonical: `legal/skills/`)
- `alinks-public-site-builder`: tenant mini-sites and 5-page templates.
- `alinks-dashboard-builder`: tenant dashboard and superadmin workflows.
- `alinks-commerce`: catalog, WhatsApp ordering, checkout, COD.
- `alinks-appointments`: salon packages, clinic booking, slots, patient tabs.
- `alinks-payments-billing`: subscriptions, trials, Razorpay, PhonePe, launch promos.
- `alinks-tap-blast-sharing`: share cards, OG images, social sharing, analytics.
- `alinks-ai-seo-content`: AI text generation, SEO metadata, credit caps.
- `alinks-launch-roadmap`: phase gates and launch readiness.
- `alinks-ui-styling-system`: shared components, styling, and reusable UI tokens.
- `alinks-tenant-customization`: tenant theming, branding, and overrides.
- `alinks-feature-workflows`: feature behavior, state transitions, and recovery paths.
- `alinks-audit-review`: implementation audits, publish gates, and traceability. (canonical: `legal/skills/`)
- `alinks-dpdp-compliance`: DPDP Act 2023 audit, user rights, grievance, cookie notice. (canonical: `legal/skills/`)
- `alinks-compliance-security-guardrails`: Security, secrets, DPDP deploy audit. Run `npm run guardrails:scan`. (canonical: `legal/skills/`)

Legal/compliance skills live in `legal/skills/`; symlinks in `skills/` for discovery.

- `alinks-devops`: Vercel, Cloudflare, GitHub CI, env vars, deploy. (canonical: `integration_setup_docs/skills/`)
- `alinks-coderabbit`: CodeRabbit PR reviews, local CLI, Agentic API key. (canonical: `integration_setup_docs/skills/`)

DevOps/review skills live in `integration_setup_docs/skills/`; symlinks in `skills/` for discovery.

These are draft project skills. Harden high-risk skills individually with pressure tests before installing them globally.
