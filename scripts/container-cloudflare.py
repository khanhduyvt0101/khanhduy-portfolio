#!/usr/bin/env python3
"""Bridge a BuildKit secret to the configuration runner, never to app settings."""
import os
from pathlib import Path
import sys


TOKEN_PATH = Path("/run/secrets/cloudflare_token")


def main(argv=None, *, token_path=TOKEN_PATH):
    args = list(sys.argv[1:] if argv is None else argv)
    if len(args) < 3 or args[0] not in {"public", "test"} or args[1] != "--":
        raise SystemExit("Usage: container-cloudflare.py public|test -- COMMAND [ARGS...]")
    try:
        token = token_path.read_text().strip()
    except OSError:
        raise SystemExit("Required Cloudflare BuildKit secret is unavailable") from None
    if not token:
        raise SystemExit("Required Cloudflare BuildKit secret is empty")
    env = dict(os.environ, CLOUDFLARE_API_TOKEN=token)
    root = Path(__file__).resolve().parents[1]
    os.chdir(root)
    # The canonical runner fetches the selected Cloudflare profile and strips this
    # authentication token before launching the public/test command.
    os.execve(sys.executable, [sys.executable, str(root / "scripts/env-run.py"), "--env", "prod", *args], env)


if __name__ == "__main__":
    main()
