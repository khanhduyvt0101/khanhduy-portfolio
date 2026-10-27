#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
python3 scripts/env-run.py --env prod public -- node scripts/build-redirect.mjs
exec python3 scripts/env-run.py --env prod deploy -- bash scripts/publish-redirect.sh
