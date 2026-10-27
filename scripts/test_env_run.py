"""Portable injection tests use an isolated, synthetic Infisical executable."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

SCRIPT = Path(__file__).with_name("env-run.py")


class InjectionTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name) / "repo"
        self.root.mkdir()
        self.home = Path(self.tmp.name) / "home"
        self.home.mkdir()
        self.require_token = False
        (self.root / "scripts").mkdir()
        (self.root / "config").mkdir()
        (self.root / "bin").mkdir()
        if SCRIPT.exists():
            (self.root / "scripts/env-run.py").write_bytes(SCRIPT.read_bytes())
        (self.root / ".infisical.json").write_text(json.dumps({"workspaceId": "11111111-1111-4111-8111-111111111111", "domain": "https://infisical.invalid"}))
        self.contract = {"public": {"required": ["NODE_ENV", "NEXT_PUBLIC_LABEL"], "optional": ["NEXT_PUBLIC_OPTIONAL"]}, "server": {"required": ["NODE_ENV", "SERVER_SECRET"], "optional": []}}
        self.values = {"NODE_ENV": "production", "NEXT_PUBLIC_LABEL": "from-test-vault", "SERVER_SECRET": "synthetic-not-a-real-secret"}
        self.env = {"PATH": str(self.root / "bin") + os.pathsep + os.environ["PATH"], "HOME": str(self.home), "TMPDIR": self.tmp.name, "NEXT_PUBLIC_LABEL": "wrong-host-value", "UNRELATED_PRIVATE_TOKEN": "synthetic-host-token", "INFISICAL_TOKEN": "synthetic-explicit-live-token"}

    def run_child(self, profile="public", extra=()):
        (self.root / "config/env-contract.json").write_text(json.dumps(self.contract))
        fake = self.root / "bin/infisical"
        fake.write_text("#!" + sys.executable + "\nimport os,sys\nif sys.argv[1]=='login':\n print('synthetic-bootstrap-token');sys.exit(0)\nif " + repr(self.require_token) + " and not os.environ.get('INFISICAL_TOKEN'): sys.exit(7)\nos.environ.update(" + repr(self.values) + ")\na=sys.argv[sys.argv.index('--')+1:]\nos.execvpe(a[0],a,os.environ)\n")
        fake.chmod(0o700)
        return subprocess.run([sys.executable, str(self.root / "scripts/env-run.py"), "--env", "prod", profile, "--", sys.executable, "-I", "-c", "import os,json;print(json.dumps(dict(os.environ)))", *extra], cwd=self.root, env=self.env, text=True, capture_output=True)

    def test_saved_cli_login_cannot_supply_production_without_live_authentication(self):
        self.env.pop("INFISICAL_TOKEN", None)
        p = self.run_child()
        self.assertNotEqual(p.returncode, 0)
        self.assertIn("live authentication", p.stderr.lower())
        self.assertEqual(p.stdout, "")

    def test_public_subprofiles_cannot_receive_provider_bootstrap(self):
        self.env["CLOUDFLARE_API_TOKEN"] = "synthetic-provider-bootstrap"
        self.contract["public-website"] = {"required": ["NODE_ENV"], "optional": [], "passthrough": ["CLOUDFLARE_API_TOKEN"]}
        p = self.run_child("public-website")
        self.assertNotEqual(p.returncode, 0)
        self.assertEqual(p.stdout, "")
        self.assertNotIn("synthetic-provider-bootstrap", p.stderr)

    def test_authentication_names_cannot_be_application_config(self):
        self.env["INFISICAL_TOKEN"] = "synthetic-machine-auth"
        self.contract["server"]["required"].append("INFISICAL_TOKEN")
        p = self.run_child("server")
        self.assertNotEqual(p.returncode, 0)
        self.assertNotIn("synthetic-machine-auth", p.stderr)
        self.assertEqual(p.stdout, "")

    def test_production_rejects_nonproduction_node_env_from_vault(self):
        self.values["NODE_ENV"] = "test"
        p = self.run_child()
        self.assertNotEqual(p.returncode, 0)
        self.assertIn("NODE_ENV", p.stderr)

    def test_missing_required_key_cannot_fall_back_to_host(self):
        del self.values["NEXT_PUBLIC_LABEL"]
        p = self.run_child()
        self.assertNotEqual(p.returncode, 0)
        self.assertIn("NEXT_PUBLIC_LABEL", p.stderr)
        self.assertNotIn("wrong-host-value", p.stderr)
        self.assertEqual(p.stdout, "")

    def test_optional_missing_key_is_absent_not_explicitly_empty(self):
        p = self.run_child()
        self.assertEqual(p.returncode, 0, p.stderr)
        self.assertNotIn("NEXT_PUBLIC_OPTIONAL", json.loads(p.stdout))

    def test_server_receives_only_its_declared_secret(self):
        p = self.run_child("server")
        self.assertEqual(p.returncode, 0, p.stderr)
        result = json.loads(p.stdout)
        self.assertEqual(result.get("SERVER_SECRET"), self.values["SERVER_SECRET"])
        self.assertNotIn("NEXT_PUBLIC_LABEL", result)
        self.assertNotIn("UNRELATED_PRIVATE_TOKEN", result)

    def test_blank_example_allowed_but_values_rejected(self):
        (self.root / ".env.example").write_text("# Names only\nNEXT_PUBLIC_LABEL=\n")
        p = self.run_child()
        self.assertEqual(p.returncode, 0, p.stderr)
        (self.root / ".env.example").write_text("NEXT_PUBLIC_LABEL=forbidden-example-value\n")
        p = self.run_child()
        self.assertNotEqual(p.returncode, 0)
        self.assertNotIn("forbidden-example-value", p.stderr)

    def test_public_profile_refuses_server_key_declarations(self):
        self.contract["public"]["required"].append("SERVER_SECRET")
        p = self.run_child()
        self.assertNotEqual(p.returncode, 0)
        self.assertIn("public", p.stderr.lower())
        self.assertNotIn(self.values["SERVER_SECRET"], p.stderr)

    def test_provider_bootstrap_is_forwarded_only_by_explicit_deploy_allowlist(self):
        self.env["CLOUDFLARE_API_TOKEN"] = "synthetic-provider-bootstrap"
        self.contract["deploy"] = {"required": ["NODE_ENV"], "optional": [], "passthrough": ["CLOUDFLARE_API_TOKEN"]}
        public = self.run_child()
        self.assertEqual(public.returncode, 0, public.stderr)
        self.assertNotIn("CLOUDFLARE_API_TOKEN", json.loads(public.stdout))
        deploy = self.run_child("deploy")
        self.assertEqual(deploy.returncode, 0, deploy.stderr)
        self.assertEqual(json.loads(deploy.stdout).get("CLOUDFLARE_API_TOKEN"), "synthetic-provider-bootstrap")

    def test_machine_bootstrap_authentication_does_not_reach_application(self):
        self.require_token = True
        self.env.pop("INFISICAL_TOKEN", None)
        bootstrap = self.home / ".config/infisical/hermes-vps.env"
        bootstrap.parent.mkdir(parents=True)
        bootstrap.write_text("INFISICAL_API_URL=https://infisical.invalid\nINFISICAL_UNIVERSAL_AUTH_CLIENT_ID=synthetic-id\nINFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET=synthetic-secret\n")
        bootstrap.chmod(0o600)
        p = self.run_child()
        self.assertEqual(p.returncode, 0, p.stderr)
        result = json.loads(p.stdout)
        self.assertFalse(any(k.startswith("INFISICAL_") for k in result))

    def test_production_rejects_dotenv_before_running_application(self):
        (self.root / ".env.local").write_text("NEXT_PUBLIC_LABEL=local-test-only\n")
        p = self.run_child()
        self.assertNotEqual(p.returncode, 0)
        self.assertIn("dotenv", p.stderr.lower())
        self.assertNotIn("local-test-only", p.stderr)
        self.assertEqual(p.stdout, "")

    def test_production_uses_vault_not_inherited_values_and_filters_private_keys(self):
        p = self.run_child()
        self.assertEqual(p.returncode, 0, p.stderr)
        result = json.loads(p.stdout)
        self.assertEqual(result["NEXT_PUBLIC_LABEL"], "from-test-vault")
        self.assertEqual(result["NODE_ENV"], "production")
        self.assertNotIn("SERVER_SECRET", result)
        self.assertNotIn("UNRELATED_PRIVATE_TOKEN", result)
        self.assertNotIn("INFISICAL_TOKEN", result)


if __name__ == "__main__":
    unittest.main()
