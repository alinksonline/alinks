#!/usr/bin/env bash
# CodeRabbit local review — see integration_setup_docs/23-coderabbit.txt
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v coderabbit >/dev/null 2>&1; then
  echo "CodeRabbit CLI not found. Install: brew install coderabbit"
  exit 1
fi

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

MODE="${1:-plain}"
BASE="${2:-main}"

if [[ "$MODE" == "doctor" ]]; then
  coderabbit doctor
  exit 0
fi

if [[ -z "${CODERABBIT_API_KEY:-}" ]]; then
  echo "CODERABBIT_API_KEY missing. Add Agentic key (cr-...) to .env"
  echo "Create at: https://app.coderabbit.ai/settings/api-keys"
  exit 1
fi

if ! coderabbit auth status 2>&1 | grep -q "signed in"; then
  echo "Authenticating CodeRabbit CLI..."
  if ! coderabbit auth login --api-key "$CODERABBIT_API_KEY"; then
    echo ""
    echo "Auth failed. Use an Agentic API key (not User API key)."
    echo "https://app.coderabbit.ai/settings/api-keys"
    exit 1
  fi
fi

case "$MODE" in
  plain)
    coderabbit review --plain --base "$BASE" --api-key "$CODERABBIT_API_KEY"
    ;;
  agent)
    coderabbit review --agent --base "$BASE" --api-key "$CODERABBIT_API_KEY"
    ;;
  uncommitted)
    coderabbit review --plain --type uncommitted --api-key "$CODERABBIT_API_KEY"
    ;;
  *)
    echo "Usage: $0 [plain|agent|doctor|uncommitted] [base-branch]"
    exit 1
    ;;
esac