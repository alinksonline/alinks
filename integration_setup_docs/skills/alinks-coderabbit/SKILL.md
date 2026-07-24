---
name: alinks-coderabbit
description: Use when running CodeRabbit PR reviews, local CLI review (npm run review), configuring .coderabbit.yaml, Agentic API keys, GitHub App setup, or fixing CodeRabbit auth/CLI errors on alinksonline/alinks.
---

# ALINKS CodeRabbit

## Overview

CodeRabbit reviews ALINKS code **outside** the Next.js runtime — via GitHub App on PRs (primary) and optional CLI for local pre-push review. Config and scripts already exist in the repo; follow doc 23.

## Source Files

- `integration_setup_docs/23-coderabbit.txt` — full setup, troubleshooting, PR workflow
- `.coderabbit.yaml` — repo config (`auto_review.enabled: true`, profile: chill)
- `scripts/coderabbit-review.sh` — local review wrapper
- `.github/workflows/coderabbit-review.yml` — optional CI CLI review
- `integration_setup_docs/18-github-actions-ci.txt` — `CODERABBIT_API_KEY` secret

## Two Integration Modes

| Mode | Needs API key? | How |
|------|----------------|-----|
| GitHub App | No | Install on `alinksonline/alinks`; auto-reviews PRs |
| CLI (local/CI) | Yes — **Agentic** key | `npm run review`, `coderabbit review --agent` |

**Critical:** CLI rejects **User API keys**. Create an **Agentic API key** at https://app.coderabbit.ai/settings/api-keys (may need Usage-based Add-on).

## npm Scripts

```bash
npm run review              # diff vs main (plain text)
npm run review:agent        # JSON output for agents/Cursor
npm run review:uncommitted  # working tree only
npm run review:doctor       # CLI health check
```

Wrapper: `scripts/coderabbit-review.sh` — sources `.env`, auto-authenticates.

## Local Setup

```bash
brew install coderabbit
# Add to .env (gitignored):
# CODERABBIT_API_KEY=cr-...   ← Agentic key only
npm run review:doctor
npm run review
```

## PR Workflow (use every PR)

1. Branch from `main`, make changes
2. `npm run test && npm run lint && npm run build`
3. `npm run review` or `npm run review:agent` (optional — needs Agentic key)
4. Push, open PR on GitHub
5. Wait for **coderabbitai[bot]** + CI green
6. Fix inline comments; comment `@coderabbitai review` to re-run
7. Merge → Vercel auto-deploys

## PR Comment Commands

```
@coderabbitai review    → manual review
@coderabbitai summary   → PR summary
@coderabbitai pause     → pause auto reviews
@coderabbitai resume    → resume auto reviews
```

## Agent Workflow

When asked to review before push:

1. Run `npm run review:agent` (or `coderabbit review --agent --base main`)
2. Fix **critical** findings only — do not over-refactor for style nits
3. Re-run if large changes made
4. Open PR for GitHub App second pass

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| No PR review | Install GitHub App on `alinksonline/alinks` |
| "User API keys not supported" | Create **Agentic** key, update `.env` |
| CLI auth fails | `npm run review:doctor`; re-run auth login |
| Key exposed | Rotate at dashboard; update `.env` + GitHub secret |

## Secrets Storage

- Local: `ALINKS/.env` → `CODERABBIT_API_KEY=cr-...`
- CI (optional): GitHub → Settings → Secrets → `CODERABBIT_API_KEY`
- Never commit `cr-...` keys

## Verify Checklist

- [x] GitHub App on `alinksonline/alinks`
- [x] `.coderabbit.yaml` in repo
- [ ] Agentic key in `.env` (for CLI)
- [ ] `npm run review:doctor` passes
- [x] PR gets `coderabbitai[bot]` comment