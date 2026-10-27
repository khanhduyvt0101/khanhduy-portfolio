#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
destination="${1:?Usage: bash scripts/build-container.sh EMPTY_OUTPUT_DIRECTORY}"
shopt -s nullglob dotglob
entries=("$destination"/*)
if [[ -e "$destination" && ! -d "$destination" ]] || (( ${#entries[@]} > 0 )); then
  printf '%s\n' 'Refusing to merge a build into existing output; choose an empty output directory.' >&2
  exit 2
fi
# Reject production dotenv files before Docker can receive or cache the context.
python3 - <<'PY'
import importlib.util
from pathlib import Path
import sys
spec = importlib.util.spec_from_file_location("env_runner", "scripts/env-run.py")
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)
try:
    runner.reject_production_dotenv(Path.cwd())
except runner.ConfigError as exc:
    print(f"Environment error: {exc}", file=sys.stderr)
    sys.exit(2)
PY
: "${CLOUDFLARE_API_TOKEN:?Live Cloudflare authentication is required for client configuration}"
# BuildKit reads the host environment directly; no token file or CLI context exists.
docker build --no-cache-filter verified,builder \
  --secret "id=cloudflare_token,env=CLOUDFLARE_API_TOKEN" \
  --target export --output "type=local,dest=$destination" .
