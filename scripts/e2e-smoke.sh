#!/usr/bin/env bash
# ALINKS route + static smoke (no auth). Optional BASE_URL=http://localhost:3000
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BASE_URL="${BASE_URL:-}"
PASS=0
FAIL=0

ok() { echo "[OK] $1"; PASS=$((PASS + 1)); }
bad() { echo "[FAIL] $1"; FAIL=$((FAIL + 1)); }

echo "=== ALINKS E2E smoke ==="

# 1) Unit / gate smoke via vitest focused files
echo ""
echo "--- Vitest industry + payment gates ---"
npx vitest run \
  src/core/utils/industry-smoke.test.ts \
  src/platform/payments/create-order-gate.test.ts \
  src/platform/legal/publish-gate.test.ts \
  src/core/config/module-gates.test.ts \
  --reporter=dot

# 2) Critical source presence
echo ""
echo "--- Source presence ---"
for f in \
  "src/app/(marketing)/cookies/page.tsx" \
  "src/components/legal/cookie-notice.tsx" \
  "src/app/(marketing)/grievance/page.tsx" \
  "src/platform/payments/tenant-gateway.ts" \
  "src/app/actions/presence.ts"
do
  if [[ -f "$f" ]]; then ok "exists $f"; else bad "missing $f"; fi
done

# 3) Optional HTTP smoke when server is up
if [[ -n "$BASE_URL" ]]; then
  echo ""
  echo "--- HTTP GET against $BASE_URL ---"
  for path in "/" "/terms" "/privacy" "/aup" "/grievance" "/cookies" "/login" "/signup"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path" || echo "000")
    if [[ "$code" == "200" || "$code" == "307" || "$code" == "308" || "$code" == "302" ]]; then
      ok "HTTP $code $path"
    else
      bad "HTTP $code $path"
    fi
  done
else
  echo ""
  echo "(Skip HTTP smoke — set BASE_URL=http://localhost:3000 with npm run dev)"
fi

echo ""
echo "=== Smoke summary: pass=$PASS fail=$FAIL ==="
if [[ "$FAIL" -gt 0 ]]; then exit 1; fi
