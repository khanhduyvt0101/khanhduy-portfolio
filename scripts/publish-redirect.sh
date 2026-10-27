#!/usr/bin/env bash
set -euo pipefail
: "${CLOUDFLARE_REDIRECT_PROJECT:?}" "${DEPLOY_BRANCH:?}" "${CLOUDFLARE_ACCOUNT_ID:?}"
revision="$(git rev-parse HEAD)"
dirty=false
if [[ -n "$(git status --porcelain)" ]]; then dirty=true; fi
wrangler pages deploy deploy/apex-redirect-out --project-name "$CLOUDFLARE_REDIRECT_PROJECT" --branch "$DEPLOY_BRANCH" --commit-hash "$revision" --commit-dirty="$dirty"
