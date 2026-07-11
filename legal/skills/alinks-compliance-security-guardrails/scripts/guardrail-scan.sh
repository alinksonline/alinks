#!/usr/bin/env bash
# ALINKS compliance & security guardrail scan — see legal/skills/alinks-compliance-security-guardrails/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
YEL='\033[1;33m'
GRN='\033[0;32m'
NC='\033[0m'

CRITICAL=0
HIGH=0
WARN=0

fail() { echo -e "${RED}[CRITICAL]${NC} $1"; CRITICAL=$((CRITICAL + 1)); }
warn() { echo -e "${YEL}[HIGH]${NC} $1"; HIGH=$((HIGH + 1)); }
note() { echo -e "${YEL}[WARN]${NC} $1"; WARN=$((WARN + 1)); }
ok()   { echo -e "${GRN}[OK]${NC} $1"; }

echo "=== ALINKS Guardrail Scan ==="
echo "Root: $ROOT"
echo ""

# --- Secrets in tracked files ---
SECRET_PATTERNS='(rzp_live_|rzp_test_[a-zA-Z0-9]{10,}|re_[a-zA-Z0-9]{20,}|cr-[a-zA-Z0-9]{20,}|npg_[a-zA-Z0-9]{10,}|postgresql://[^@]+@)'
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  TRACKED=$(git ls-files)
  if echo "$TRACKED" | xargs grep -lE "$SECRET_PATTERNS" 2>/dev/null | grep -vE '\.env\.example|guardrail-scan\.sh|SKILL\.md|audit-checklist\.md|\.txt$' >/dev/null; then
    fail "Possible secrets in tracked files — run: git ls-files | xargs grep -lE '$SECRET_PATTERNS'"
  else
    ok "No obvious secret patterns in tracked source"
  fi
else
  note "Not a git repo — skip secret pattern scan"
fi

# --- .env gitignore ---
if grep -q '^\.env$' .gitignore 2>/dev/null; then
  ok ".env is gitignored"
else
  fail ".env is NOT in .gitignore"
fi

# --- Security headers in next.config ---
if grep -q 'headers' next.config.mjs 2>/dev/null; then
  ok "Security headers configured in next.config.mjs"
else
  warn "Missing headers() in next.config.mjs — add baseline security headers"
fi

# --- DEV_OTP in production hint ---
if [[ -f .env ]]; then
  # shellcheck disable=SC1091
  source .env 2>/dev/null || true
fi
if [[ "${NODE_ENV:-development}" == "production" && -n "${DEV_OTP:-}" ]]; then
  fail "DEV_OTP is set while NODE_ENV=production — remove before public launch"
fi

# --- DATABASE_URL ---
if [[ -z "${DATABASE_URL:-}" ]]; then
  if [[ "${CI:-}" == "true" || "${GITHUB_ACTIONS:-}" == "true" ]]; then
    ok "DATABASE_URL not in CI env (expected — production uses Vercel + Supabase)"
  else
    warn "DATABASE_URL not set in environment — auth/signup will fail locally"
  fi
else
  ok "DATABASE_URL is set"
fi

# --- PII logging heuristic ---
PII_LOGS=$(grep -rn 'console\.log' src --include='*.ts' --include='*.tsx' 2>/dev/null \
  | grep -v 'seed\.ts' \
  | grep -iE 'phone|email|otp|password|token' || true)
if [[ -n "$PII_LOGS" ]]; then
  warn "Possible PII in console.log — review:"
  echo "$PII_LOGS" | head -5
else
  ok "No obvious PII patterns in console.log"
fi

# --- Customer PII tables in platform schema (heuristic) ---
if grep -qE 'pgTable\("(customers|patients|orders)"' src/platform/db/schema 2>/dev/null; then
  fail "Platform schema may contain customer PII tables — violates data boundary"
else
  ok "No obvious customer PII tables in platform schema"
fi

# --- DPDP P0 routes (heuristic) ---
[[ -f src/app/\(marketing\)/grievance/page.tsx ]] && ok "/grievance route exists" || warn "Missing /grievance page (DPDP P0)"
grep -rq 'deleteAccountAction\|Delete my account' src/app 2>/dev/null && ok "Delete account flow present" || warn "Missing delete account flow (DPDP P0)"
grep -rq 'exportTenantData\|Export my data' src/app 2>/dev/null && ok "Export data flow present" || warn "Missing export data flow (DPDP P0)"

# --- Auth readiness module ---
[[ -f src/platform/auth/readiness.ts ]] && ok "Auth readiness helper present" || note "Auth readiness helper missing"

echo ""
echo "=== Summary ==="
echo "Critical: $CRITICAL | High: $HIGH | Warn: $WARN"

if [[ $CRITICAL -gt 0 ]]; then
  echo -e "${RED}BLOCKED — fix critical findings before deploy${NC}"
  exit 1
fi

if [[ $HIGH -gt 0 ]]; then
  echo -e "${YEL}Review high findings before production deploy${NC}"
  exit 0
fi

echo -e "${GRN}Guardrail scan passed${NC}"
exit 0