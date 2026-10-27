#!/usr/bin/env bash
set -euo pipefail
: "${CLOUDFLARE_PAGES_PROJECT:?}" "${DEPLOY_BRANCH:?}" "${CLOUDFLARE_ACCOUNT_ID:?}"
revision="$(git rev-parse HEAD)"
dirty=false
if [[ -n "$(git status --porcelain)" ]]; then dirty=true; fi
wrangler pages deploy out --project-name "$CLOUDFLARE_PAGES_PROJECT" --branch "$DEPLOY_BRANCH" --commit-hash "$revision" --commit-dirty="$dirty"
