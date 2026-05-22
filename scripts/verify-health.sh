#!/usr/bin/env bash
# Verify backend health endpoint (local or production)
# Usage: ./scripts/verify-health.sh https://lendwise-api.onrender.com

set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:8000}"
HEALTH_URL="${BASE_URL%/}/health"

echo "Checking ${HEALTH_URL} ..."
BODY=$(curl -fsS "${HEALTH_URL}")
STATUS=$(echo "${BODY}" | grep -o '"status"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1)

if echo "${BODY}" | grep -q '"status"[[:space:]]*:[[:space:]]*"ok"'; then
  echo "OK — ${STATUS}"
  echo "${BODY}"
  exit 0
fi

echo "Health check failed:"
echo "${BODY}"
exit 1
