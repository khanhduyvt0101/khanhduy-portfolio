#!/bin/sh
set -eu
# Read the token at runtime: never bake it into an image or Compose environment.
IFS= read -r CLOUDFLARE_API_TOKEN < /run/secrets/cloudflare_dns_api_token || true
: "${CLOUDFLARE_API_TOKEN:?Cloudflare DNS API token is required}"
export CLOUDFLARE_API_TOKEN
exec "$@"
