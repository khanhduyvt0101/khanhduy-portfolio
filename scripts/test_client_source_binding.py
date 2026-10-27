"""Names-only Cloudflare source bindings; no network access or application build."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ClientSourceBindingTests(unittest.TestCase):
    def test_all_client_profiles_bind_the_main_pages_project(self):
        binding_path = ROOT / ".cloudflare-env.json"
        self.assertTrue(binding_path.is_file(), "Cloudflare client source binding is missing")
        binding = json.loads(binding_path.read_text())
        self.assertEqual(binding, {
            "accountId": "4619630cc2fa4da9fb7919dc1bc36889",
            "profiles": {name: {"project": ROOT.name} for name in ("public", "test", "deploy")},
        })

    def test_test_profile_omits_node_env_and_browser_profiles_omit_auth(self):
        contract = json.loads((ROOT / "config/env-contract.json").read_text())
        self.assertEqual(set(contract), {"public", "test", "deploy"})
        for name in ("public", "test"):
            profile = contract[name]
            keys = profile["required"] + profile.get("optional", [])
            self.assertNotIn("CLOUDFLARE_API_TOKEN", keys)
            self.assertFalse(profile.get("passthrough"))
            if name == "test":
                self.assertNotIn("NODE_ENV", keys)
        self.assertEqual(contract["deploy"].get("passthrough"), ["CLOUDFLARE_API_TOKEN"])


if __name__ == "__main__":
    unittest.main()
