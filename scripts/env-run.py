#!/usr/bin/env python3
"""Run an explicit environment profile without forwarding unrelated credentials.

Only project references and environment-variable names live in the repository.
Production values are fetched on every invocation. No secret-bearing file is
created, and provider output is captured privately rather than copied to logs.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
from pathlib import Path
import re
import shlex
import subprocess
import sys

BASE_KEYS = frozenset({
    "PATH", "HOME", "USER", "LOGNAME", "SHELL", "LANG", "LC_ALL", "LC_CTYPE",
    "TERM", "TMPDIR", "TEMP", "TMP", "XDG_CACHE_HOME", "XDG_CONFIG_HOME",
    "XDG_DATA_HOME", "BUN_INSTALL", "BUN_INSTALL_CACHE_DIR", "SSL_CERT_FILE",
    "SSL_CERT_DIR", "NODE_EXTRA_CA_CERTS",
})
KEY = re.compile(r"^[A-Z][A-Z0-9_]*$")


class ConfigError(Exception):
    """A names-only error safe to show to an operator."""


def base_environment() -> dict[str, str]:
    return {k: v for k, v in os.environ.items() if k in BASE_KEYS}


def read_json(path: Path) -> dict:
    try:
        data = json.loads(path.read_text())
    except (OSError, ValueError) as exc:
        raise ConfigError(f"Cannot read valid config: {path.name}") from exc
    if not isinstance(data, dict):
        raise ConfigError(f"Expected object: {path.name}")
    return data


def bootstrap_environment(base: dict[str, str], domain: str) -> dict[str, str]:
    env = dict(base)
    for key in ("INFISICAL_TOKEN", "INFISICAL_PROFILE", "INFISICAL_ORG"):
        if os.environ.get(key):
            env[key] = os.environ[key]
    if env.get("INFISICAL_TOKEN"):
        return env
    bootstrap = Path.home() / ".config/infisical/hermes-vps.env"
    if not bootstrap.exists():
        raise ConfigError("Live authentication is required: provide INFISICAL_TOKEN or the machine-identity bootstrap; saved CLI/offline cache is not accepted")
    allowed = {"INFISICAL_API_URL", "INFISICAL_UNIVERSAL_AUTH_CLIENT_ID", "INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET"}
    try:
        credentials = {}
        for line in bootstrap.read_text().splitlines():
            tokens = shlex.split(line, comments=True)
            if tokens[:1] == ["export"]:
                tokens = tokens[1:]
            if len(tokens) == 1 and "=" in tokens[0]:
                key, _, value = tokens[0].partition("=")
                if key in allowed:
                    credentials[key] = value
    except (OSError, ValueError) as exc:
        raise ConfigError("Cannot read machine-identity bootstrap") from exc
    if credentials.get("INFISICAL_API_URL", "").rstrip("/") != domain.rstrip("/"):
        raise ConfigError("Infisical binding does not match machine-identity instance")
    if not all(credentials.get(key) for key in allowed):
        raise ConfigError("Incomplete machine-identity bootstrap")
    command = ["infisical", "login", "--method=universal-auth", "--client-id=" + credentials["INFISICAL_UNIVERSAL_AUTH_CLIENT_ID"], "--client-secret=" + credentials["INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET"], "--domain=" + domain, "--silent", "--plain", "--telemetry=false"]
    try:
        result = subprocess.run(command, env=env, capture_output=True, text=True)
    except OSError as exc:
        raise ConfigError("Infisical CLI unavailable") from exc
    if result.returncode or not result.stdout.strip():
        raise ConfigError("Infisical machine authentication failed")
    env["INFISICAL_TOKEN"] = result.stdout.strip()
    return env


def fetch_profile(root: Path, binding: dict, keys: list[str], environment: str) -> dict[str, str]:
    env = bootstrap_environment(base_environment(), binding["domain"])
    env["_APP_ENV_KEYS"] = json.dumps(keys)
    env["INFISICAL_DISABLE_UPDATE_CHECK"] = "true"
    bridge = "import json,os; print(json.dumps({k:os.environ[k] for k in json.loads(os.environ['_APP_ENV_KEYS']) if k in os.environ}))"
    command = [
        "infisical", "run", "--projectId=" + binding["workspaceId"],
        "--env=" + environment, "--domain=" + binding["domain"],
        "--path=/", "--recursive=false", "--include-imports=false",
        "--secret-overriding=false", "--expand=false", "--silent",
        "--telemetry=false", "--", sys.executable, "-I", "-S", "-c", bridge,
    ]
    try:
        result = subprocess.run(command, cwd=root, env=env, capture_output=True, text=True)
    except OSError as exc:
        raise ConfigError("Infisical CLI unavailable; no application started") from exc
    if result.returncode:
        raise ConfigError(f"Infisical injection failed (exit {result.returncode}); no application started")
    try:
        values = json.loads(result.stdout)
    except ValueError as exc:
        raise ConfigError("Invalid private injection response; no application started") from exc
    if not isinstance(values, dict) or any(k not in keys or not isinstance(v, str) for k, v in values.items()):
        raise ConfigError("Invalid injected environment shape")
    return values


def select_profile(root: Path, profile_name: str, keys: list[str], environment: str) -> dict[str, str]:
    """Dispatch configured Pages profiles; retain the Infisical bridge API intact."""
    binding_path = root / ".cloudflare-env.json"
    if binding_path.exists():
        binding = read_json(binding_path)
        path = Path(__file__).with_name("cloudflare-env.py")
        try:
            spec = importlib.util.spec_from_file_location("cloudflare_env", path)
            provider = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(provider)
        except (OSError, ImportError) as exc:
            raise ConfigError("Cloudflare provider module unavailable") from exc
        try:
            profile = provider.plan_profile(binding, profile_name, keys)
            if profile is not None:
                private_keys = profile.get("infisicalKeys", [])
                values = provider.fetch_profile(binding, profile, [key for key in keys if key not in private_keys], environment)
                if private_keys:
                    private_binding = read_json(root / ".infisical.json")
                    if not isinstance(private_binding.get("workspaceId"), str) or not isinstance(private_binding.get("domain"), str):
                        raise ConfigError("Missing Infisical project/domain binding")
                    values.update(fetch_profile(root, private_binding, private_keys, environment))
                return values
        except provider.ConfigError as exc:
            raise ConfigError(str(exc)) from exc
    binding = read_json(root / ".infisical.json")
    if not isinstance(binding.get("workspaceId"), str) or not isinstance(binding.get("domain"), str):
        raise ConfigError("Missing Infisical project/domain binding")
    return fetch_profile(root, binding, keys, environment)


def reject_production_dotenv(root: Path) -> None:
    ignored = {".git", "node_modules", ".next", "out", "dist", "build", ".turbo", "coverage", ".cache"}
    for directory, dirs, files in os.walk(root):
        relative = Path(directory).relative_to(root)
        dirs[:] = [d for d in dirs if d not in ignored and not (relative == Path("packages") and d == "app")]
        for name in files:
            if not (name == ".env" or name.startswith(".env.") or name.endswith(".env")):
                continue
            path = Path(directory) / name
            if name == ".env.example":
                try:
                    lines = path.read_text().splitlines()
                    for line in lines:
                        tokens = shlex.split(line, comments=True)
                        if tokens[:1] == ["export"]:
                            tokens = tokens[1:]
                        if tokens and (len(tokens) != 1 or "=" not in tokens[0] or tokens[0].partition("=")[2]):
                            raise ValueError("nonblank example")
                except (OSError, ValueError) as exc:
                    raise ConfigError("Production dotenv examples must contain names and blank values only: " + str(path.relative_to(root))) from exc
                continue
            raise ConfigError("Production dotenv files are forbidden: " + str(path.relative_to(root)) + "; use live provider configuration (test .env.local is nonproduction only)")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--env", choices=("prod", "dev", "staging", "test"), default="prod")
    parser.add_argument("profile")
    parser.add_argument("command", nargs=argparse.REMAINDER)
    args = parser.parse_args(argv)
    command = args.command[1:] if args.command[:1] == ["--"] else args.command
    if not command:
        raise ConfigError("A command after -- is required")
    root = Path(__file__).resolve().parents[1]
    if args.env in {"prod", "staging"}:
        reject_production_dotenv(root)
    contract = read_json(root / "config/env-contract.json")
    profile = contract.get(args.profile)
    if not isinstance(profile, dict):
        raise ConfigError("Unknown environment profile")
    required, optional = profile.get("required", []), profile.get("optional", [])
    if any(not isinstance(items, list) or any(not isinstance(k, str) or not KEY.fullmatch(k) for k in items) for items in (required, optional)):
        raise ConfigError("Profile must contain environment-variable names only")
    keys = list(dict.fromkeys(required + optional))
    if any(key in BASE_KEYS or key.startswith("INFISICAL_") or key == "CLOUDFLARE_API_TOKEN" for key in keys):
        raise ConfigError("Bootstrap/authentication names may not be application configuration")
    if args.profile.startswith("public") and any(key != "NODE_ENV" and not key.startswith(("NEXT_PUBLIC_", "VITE_", "PUBLIC_")) for key in keys):
        raise ConfigError("Public profiles may only request browser-safe prefixed keys and NODE_ENV")
    values = select_profile(root, args.profile, keys, args.env)
    missing = [key for key in required if not values.get(key)]
    if missing:
        raise ConfigError("Missing required configuration keys: " + ", ".join(missing))
    if args.env in {"prod", "staging"} and "NODE_ENV" in keys and values.get("NODE_ENV") != "production":
        raise ConfigError("Production profiles require NODE_ENV=production from live configuration")
    passthrough = profile.get("passthrough", [])
    if not isinstance(passthrough, list) or any(not isinstance(key, str) or key not in {"CLOUDFLARE_API_TOKEN"} for key in passthrough):
        raise ConfigError("Only explicitly supported provider bootstrap keys may be forwarded")
    if passthrough and not args.profile.startswith(("deploy", "publish")):
        raise ConfigError("Provider bootstrap credentials are restricted to deployment/publisher profiles")
    env = base_environment()
    env.update({key: os.environ[key] for key in passthrough if key in os.environ})
    env.update(values)
    try:
        return subprocess.run(command, cwd=root, env=env).returncode
    except OSError as exc:
        raise ConfigError("Application command unavailable") from exc


if __name__ == "__main__":
    try:
        sys.exit(main())
    except ConfigError as exc:
        print(f"Environment error: {exc}", file=sys.stderr)
        sys.exit(2)
