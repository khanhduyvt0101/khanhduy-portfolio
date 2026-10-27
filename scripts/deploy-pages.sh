#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
python3 scripts/env-run.py --env prod public -- bun install --frozen-lockfile
python3 scripts/env-run.py --env prod public -- bun run check
python3 scripts/env-run.py --env prod test -- bun --bun node_modules/vitest/vitest.mjs run --coverage
bun run build
exec python3 scripts/env-run.py --env prod deploy -- bash scripts/publish-pages.sh
