#!/usr/bin/env python3
"""Read selected Pages plaintext settings live; never store or log provider output."""
from __future__ import annotations

import json
import os
import re
import urllib.request

API_BASE = "https://api.cloudflare.com/client/v4"


class NoRedirect(urllib.request.HTTPRedirectHandler):
    """Never forward bearer authentication to a redirected endpoint."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class ConfigError(Exception):
    """Names-only provider failure."""


def plan_profile(binding: dict, name: str, keys: list[str]) -> dict | None:
    if set(binding) != {"accountId", "profiles"} or not isinstance(binding.get("accountId"), str) or not re.fullmatch(r"[a-fA-F0-9]{32}", binding["accountId"]) or not isinstance(binding.get("profiles"), dict):
        raise ConfigError("Invalid Cloudflare binding metadata")
    profiles = binding["profiles"]
    client = name.startswith(("public", "test", "deploy", "publish", "audit"))
    if name not in profiles:
        if client:
            raise ConfigError("Missing Cloudflare profile binding")
        return None
    profile = profiles[name]
    if not client or not isinstance(profile, dict) or set(profile) - {"project", "infisicalKeys"} or not isinstance(profile.get("project"), str) or not re.fullmatch(r"[a-z0-9](?:[a-z0-9-]{0,56}[a-z0-9])?", profile["project"]):
        raise ConfigError("Invalid Cloudflare profile metadata")
    private = profile.get("infisicalKeys", [])
    if not isinstance(private, list) or any(not isinstance(key, str) or key not in keys for key in private) or len(set(private)) != len(private):
        raise ConfigError("Invalid Infisical key allowlist")
    if private and not name.startswith(("test", "audit")):
        raise ConfigError("Only test/audit profiles may mix configuration providers")
    if any(key == "NODE_ENV" or key.startswith(("VITE_", "NEXT_PUBLIC_", "PUBLIC_", "INFISICAL_")) or key == "CLOUDFLARE_API_TOKEN" for key in private):
        raise ConfigError("Public/bootstrap keys may not come from hybrid Infisical")
    if name.startswith("test") and any(key not in {"GOOGLE_GENERATIVE_AI_MODEL", "AI_DAILY_REQUEST_LIMIT", "CORS_ORIGINS"} for key in private):
        raise ConfigError("Test hybrid keys must be approved nonsecret backend settings")
    if name.startswith(("test", "audit")) and any(key not in private and (key != "NODE_ENV" or name.startswith("test")) and not key.startswith(("VITE_", "NEXT_PUBLIC_", "PUBLIC_")) for key in keys):
        raise ConfigError("Test/audit Pages keys must be public-prefixed; test profiles omit NODE_ENV")
    return profile


def fetch_profile(binding: dict, profile: dict, keys: list[str], environment: str) -> dict[str, str]:
    # Validate even direct helper calls; metadata never selects an API origin.
    account, project = binding.get("accountId"), profile.get("project")
    if not isinstance(account, str) or not re.fullmatch(r"[a-fA-F0-9]{32}", account) or not isinstance(project, str) or not re.fullmatch(r"[a-z0-9](?:[a-z0-9-]{0,56}[a-z0-9])?", project):
        raise ConfigError("Invalid Cloudflare source identifiers")
    if environment not in {"prod", "dev", "staging", "test"}:
        raise ConfigError("Unknown Cloudflare environment selection")
    if any(not isinstance(key, str) or not re.fullmatch(r"[A-Z][A-Z0-9_]*", key) or key == "CLOUDFLARE_API_TOKEN" or key.startswith("INFISICAL_") for key in keys):
        raise ConfigError("Invalid Cloudflare application key allowlist")
    token = os.environ.get("CLOUDFLARE_API_TOKEN")
    if not token:
        raise ConfigError("Live Cloudflare authentication required: CLOUDFLARE_API_TOKEN")
    request = urllib.request.Request(
        API_BASE + "/accounts/" + binding["accountId"] + "/pages/projects/" + profile["project"],
        headers={"Authorization": "Bearer " + token, "Accept": "application/json"}, method="GET",
    )
    try:
        with urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect()).open(request, timeout=30) as response:
            payload = json.load(response)
        if not isinstance(payload, dict) or payload.get("success") is not True:
            raise ValueError()
        stage = "production" if environment == "prod" else "preview"
        entries = payload["result"]["deployment_configs"][stage]["env_vars"]
        if not isinstance(entries, dict):
            raise ValueError()
    except (OSError, ValueError, KeyError, TypeError) as exc:
        raise ConfigError("Cloudflare live configuration request failed; no application started") from exc
    values = {}
    for key in keys:
        if key not in entries:
            continue
        entry = entries[key]
        if not isinstance(entry, dict) or entry.get("type") != "plain_text" or not isinstance(entry.get("value"), str) or "\u0000" in entry["value"]:
            raise ConfigError("Cloudflare selected key must be valid plain_text: " + key)
        values[key] = entry["value"]
    return values
