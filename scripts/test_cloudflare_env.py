"""Cloudflare provider tests: synthetic values only; no real provider writes."""
import importlib.util
import io
import json
import os
from pathlib import Path
import unittest
from unittest.mock import patch

MODULE = Path(__file__).with_name("cloudflare-env.py")


def load_module():
    spec = importlib.util.spec_from_file_location("cloudflare_env", MODULE)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class CloudflareTests(unittest.TestCase):
    def test_direct_fetch_rejects_untrusted_identifiers_auth_keys_and_unknown_stage(self):
        cf = load_module()
        cases = [({"accountId": "a/../other"}, {"project": "example"}, ["VITE_LABEL"], "prod"),
                 ({"accountId": "a" * 32}, {"project": "example?query=bad"}, ["VITE_LABEL"], "prod"),
                 ({"accountId": "a" * 32}, {"project": "example"}, ["CLOUDFLARE_API_TOKEN"], "prod"),
                 ({"accountId": "a" * 32}, {"project": "example"}, ["INFISICAL_TOKEN"], "prod"),
                 ({"accountId": "a" * 32}, {"project": "example"}, ["VITE_LABEL"], "unknown")]
        with patch.dict(os.environ, {"CLOUDFLARE_API_TOKEN": "synthetic-bootstrap"}, clear=True), patch("urllib.request.OpenerDirector.open") as request:
            for binding, profile, keys, stage in cases:
                with self.subTest(binding=binding, profile=profile, keys=keys, stage=stage):
                    with self.assertRaises(cf.ConfigError):
                        cf.fetch_profile(binding, profile, keys, stage)
            request.assert_not_called()

    def test_redirects_are_not_followed(self):
        cf = load_module()
        request = __import__("urllib.request", fromlist=["Request"]).Request("https://api.cloudflare.com/client/v4/", headers={"Authorization": "Bearer synthetic-bootstrap"})
        self.assertTrue(hasattr(cf, "NoRedirect"), "Authenticated provider redirects need a deny handler")
        self.assertIsNone(cf.NoRedirect().redirect_request(request, None, 302, "Found", {}, "https://evil.invalid"))

    def test_fetches_only_selected_plaintext_keys_from_fixed_https_endpoint(self):
        self.assertTrue(MODULE.exists(), "Cloudflare provider core is not implemented")
        cf = load_module()
        payload = {"success": True, "result": {"deployment_configs": {"production": {"env_vars": {
            "VITE_LABEL": {"type": "plain_text", "value": "fresh-provider-value"},
            "PRIVATE_SECRET": {"type": "secret_text", "value": "never-return-this"},
        }}}}}
        with patch.dict(os.environ, {"CLOUDFLARE_API_TOKEN": "synthetic-bootstrap"}, clear=True), patch("urllib.request.OpenerDirector.open", return_value=io.BytesIO(json.dumps(payload).encode())) as request:
            self.assertEqual(cf.fetch_profile({"accountId": "a" * 32}, {"project": "example"}, ["VITE_LABEL", "VITE_ABSENT"], "prod"), {"VITE_LABEL": "fresh-provider-value"})
        req = request.call_args.args[0]
        self.assertEqual(req.full_url, "https://api.cloudflare.com/client/v4/accounts/" + "a" * 32 + "/pages/projects/example")
        self.assertEqual(req.get_header("Authorization"), "Bearer synthetic-bootstrap")
        self.assertEqual(req.get_method(), "GET")


class DispatcherTests(unittest.TestCase):
    def setUp(self):
        import tempfile
        from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
        import threading
        self.tmp = tempfile.TemporaryDirectory(dir=os.environ.get("TMPDIR"))
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        (self.root / "scripts").mkdir()
        (self.root / "config").mkdir()
        (self.root / "bin").mkdir()
        (self.root / "home").mkdir()
        for name in ("env-run.py", "cloudflare-env.py"):
            source = MODULE.with_name(name)
            if source.exists():
                (self.root / "scripts" / name).write_bytes(source.read_bytes())
        self.contract = {"public": {"required": ["NODE_ENV", "VITE_LABEL"], "optional": ["VITE_ABSENT"]}}
        self.binding = {"accountId": "a" * 32, "profiles": {"public": {"project": "example"}}}
        self.entries = {"NODE_ENV": {"type": "plain_text", "value": "production"}, "VITE_LABEL": {"type": "plain_text", "value": "fresh-provider-value"}, "SERVER_SECRET": {"type": "secret_text", "value": "synthetic-private"}}
        self.status = 200
        self.payload = None
        self.raw_response = None
        self.requests = []
        owner = self
        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *_):
                pass
            def do_GET(self):
                owner.requests.append((self.path, self.headers.get("Authorization")))
                if self.path == "/infisical":
                    body = {"GOOGLE_GENERATIVE_AI_MODEL": "synthetic-model", "AI_DAILY_REQUEST_LIMIT": "5", "CORS_ORIGINS": "https://example.invalid", "SERVER_SECRET": "synthetic-private", "VITE_LABEL": "wrong-vault-public", "CLOUDFLARE_API_TOKEN": "poison-vault-provider", "INFISICAL_TOKEN": "poison-vault-auth"}
                    status = 200
                else:
                    body = owner.payload if owner.payload is not None else {"success": True, "result": {"deployment_configs": {"production": {"env_vars": owner.entries}, "preview": {"env_vars": {**owner.entries, "VITE_LABEL": {"type": "plain_text", "value": "preview-provider-value"}}}}}}
                    status = owner.status
                self.send_response(status)
                if status == 302:
                    self.send_header("Location", "/redirect-must-not-be-followed")
                self.end_headers()
                self.wfile.write(owner.raw_response if owner.raw_response is not None else json.dumps(body).encode())
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.addCleanup(self.stop_server)
        self.endpoint = "http://127.0.0.1:" + str(self.server.server_port)
        self.env = {"PATH": str(self.root / "bin") + os.pathsep + os.environ["PATH"], "HOME": str(self.root / "home"), "TMPDIR": self.tmp.name, "CLOUDFLARE_API_TOKEN": "synthetic-bootstrap", "INFISICAL_TOKEN": "synthetic-auth", "VITE_LABEL": "wrong-host", "SERVER_SECRET": "wrong-private", "UNRELATED_PRIVATE_TOKEN": "wrong-unrelated", "NODE_ENV": "wrong-host-node"}
        fake = self.root / "bin/infisical"
        import sys
        fake.write_text("#!" + sys.executable + "\nimport os,sys,json,urllib.request\nwith urllib.request.urlopen(" + repr(self.endpoint + "/infisical") + ") as r: os.environ.update(json.load(r))\na=sys.argv[sys.argv.index('--')+1:]\nos.execvpe(a[0],a,os.environ)\n")
        fake.chmod(0o700)
        (self.root / ".infisical.json").write_text(json.dumps({"workspaceId": "synthetic-project", "domain": "https://infisical.invalid"}))

    def stop_server(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()

    def run_child(self, profile="public", environment="prod"):
        import subprocess
        import sys
        (self.root / "config/env-contract.json").write_text(json.dumps(self.contract))
        (self.root / ".cloudflare-env.json").write_text(json.dumps(self.binding))
        script = self.root / "scripts/env-run.py"
        # Intercept only in this disposable process; core API origin stays fixed.
        launcher = "import urllib.request,runpy,sys\noriginal=urllib.request.OpenerDirector.open\ndef bridge(self,req,*a,**kw):\n assert req.full_url.startswith('https://api.cloudflare.com/client/v4/accounts/'), 'unexpected provider origin'\n req=urllib.request.Request(" + repr(self.endpoint) + "+req.full_url.split('api.cloudflare.com',1)[1],headers=dict(req.header_items()),method=req.get_method())\n return original(self,req,*a,**kw)\nurllib.request.OpenerDirector.open=bridge\nsys.argv=" + repr([str(script), "--env", environment, profile, "--", sys.executable, "-I", "-c", "import json,os; print(json.dumps(dict(os.environ)))"]) + "\nrunpy.run_path(" + repr(str(script)) + ",run_name='__main__')\n"
        return subprocess.run([sys.executable, "-I", "-c", launcher], env=self.env, cwd=self.root, text=True, capture_output=True)

    def test_real_http_redirect_does_not_forward_bearer_or_launch_child(self):
        self.status = 302
        result = self.run_child()
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.stdout, "")
        self.assertNotIn("Traceback", result.stderr)
        self.assertEqual(len(self.requests), 1)
        self.assertNotIn("redirect-must-not-be-followed", self.requests[0][0])

    def test_malformed_real_http_json_never_prints_body_or_launches_child(self):
        self.raw_response = b"not-json synthetic-sensitive-error-body"
        result = self.run_child()
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.stdout, "")
        self.assertNotIn("synthetic-sensitive-error-body", result.stderr)
        self.assertNotIn("Traceback", result.stderr)
        self.assertEqual(len(self.requests), 1)

    def test_pure_test_profile_needs_no_infisical_binding_auth_or_executable(self):
        (self.root / ".infisical.json").unlink()
        (self.root / "bin/infisical").unlink()
        self.env.pop("INFISICAL_TOKEN")
        self.contract["test"] = {"required": ["VITE_LABEL"]}
        self.binding["profiles"]["test"] = {"project": "example"}
        result = self.run_child("test")
        self.assertEqual(result.returncode, 0, result.stderr)
        child = json.loads(result.stdout)
        self.assertNotIn("NODE_ENV", child)
        self.assertNotIn("CLOUDFLARE_API_TOKEN", child)
        self.assertEqual(child["VITE_LABEL"], "fresh-provider-value")
        self.assertEqual(len(self.requests), 1)

    def test_hybrid_failure_stops_child_without_private_fallback(self):
        self.contract["audit"] = {"required": ["VITE_LABEL", "SERVER_SECRET"]}
        self.binding["profiles"]["audit"] = {"project": "example", "infisicalKeys": ["SERVER_SECRET"]}
        (self.root / "bin/infisical").write_text("#!/bin/sh\nexit 7\n")
        result = self.run_child("audit")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.stdout, "")
        self.assertIn("Infisical", result.stderr)
        self.assertEqual(len(self.requests), 1)

    def test_provider_failures_never_start_child_or_fall_back(self):
        for status, payload in ((503, {"private": "synthetic-api-error"}), (200, {"success": False, "errors": [{"message": "synthetic-api-error"}]}), (200, []), (200, {"success": True, "result": {}}), (200, {"success": True, "result": {"deployment_configs": {"production": {"env_vars": []}}}})):
            with self.subTest(status=status, payload=payload):
                self.status, self.payload = status, payload
                self.requests.clear()
                result = self.run_child()
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(result.stdout, "")
                self.assertNotIn("synthetic-api-error", result.stderr)
                self.assertNotIn("Traceback", result.stderr)
                self.assertEqual(len(self.requests), 1)

    def test_selected_secret_text_or_nonstring_value_is_rejected(self):
        for entry in ({"type": "secret_text", "value": "synthetic-private"}, {"type": "plain_text", "value": None}, {"type": "plain_text", "value": "synthetic-private\u0000"}, {"value": "synthetic-private"}, "synthetic-private"):
            with self.subTest(entry=entry):
                self.entries["VITE_LABEL"] = entry
                result = self.run_child()
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(result.stdout, "")
                self.assertIn("VITE_LABEL", result.stderr)
                self.assertNotIn("synthetic-private", result.stderr)
                self.assertNotIn("Traceback", result.stderr)

    def test_empty_required_pages_value_does_not_use_host_or_vault(self):
        self.entries["VITE_LABEL"]["value"] = ""
        result = self.run_child()
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.stdout, "")
        self.assertIn("VITE_LABEL", result.stderr)
        self.assertEqual(len(self.requests), 1)

    def test_optional_empty_is_preserved_but_missing_is_absent(self):
        self.entries["VITE_EMPTY"] = {"type": "plain_text", "value": ""}
        self.contract["public"]["optional"].append("VITE_EMPTY")
        result = self.run_child()
        self.assertEqual(result.returncode, 0, result.stderr)
        child = json.loads(result.stdout)
        self.assertEqual(child["VITE_EMPTY"], "")
        self.assertNotIn("VITE_ABSENT", child)

    def test_cf_auth_is_required_and_never_supplied_by_infisical(self):
        self.env.pop("CLOUDFLARE_API_TOKEN")
        result = self.run_child()
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.stdout, "")
        self.assertIn("CLOUDFLARE_API_TOKEN", result.stderr)
        self.assertEqual(self.requests, [])

    def test_offline_cloudflare_never_falls_back_to_inherited_or_vault(self):
        self.stop_server()
        self.stop_server = lambda: None
        result = self.run_child()
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.stdout, "")
        self.assertIn("Cloudflare", result.stderr)
        self.assertEqual(self.requests, [])

    def test_all_nonprod_modes_select_preview_and_reads_are_fresh(self):
        for stage in ("dev", "staging", "test"):
            with self.subTest(stage=stage):
                result = self.run_child(environment=stage)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(json.loads(result.stdout)["VITE_LABEL"], "preview-provider-value")
        self.entries["VITE_LABEL"]["value"] = "updated-provider-value"
        result = self.run_child()
        self.assertEqual(json.loads(result.stdout)["VITE_LABEL"], "updated-provider-value")
        self.assertEqual(len(self.requests), 4)

    def test_production_node_env_must_come_from_pages_and_be_production(self):
        self.entries["NODE_ENV"]["value"] = "development"
        result = self.run_child()
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.stdout, "")
        self.assertIn("NODE_ENV", result.stderr)

    def test_deploy_reads_only_pages_and_forwards_only_explicit_host_token(self):
        (self.root / ".infisical.json").unlink()
        self.entries["DEPLOY_BRANCH"] = {"type": "plain_text", "value": "main"}
        self.entries["CLOUDFLARE_API_TOKEN"] = {"type": "secret_text", "value": "poison-provider-token"}
        self.contract["deploy-app"] = {"required": ["DEPLOY_BRANCH"], "passthrough": ["CLOUDFLARE_API_TOKEN"]}
        self.binding["profiles"]["deploy-app"] = {"project": "other-app"}
        result = self.run_child("deploy-app")
        self.assertEqual(result.returncode, 0, result.stderr)
        child = json.loads(result.stdout)
        self.assertEqual(child["CLOUDFLARE_API_TOKEN"], "synthetic-bootstrap")
        self.assertEqual(child["DEPLOY_BRANCH"], "main")
        self.assertNotIn("VITE_LABEL", child)
        self.assertFalse(any(k.startswith("INFISICAL_") for k in child))
        self.assertEqual(len(self.requests), 1)
        self.assertTrue(self.requests[0][0].endswith("/other-app"))
        self.contract["deploy-app"].pop("passthrough")
        result = self.run_child("deploy-app")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertNotIn("CLOUDFLARE_API_TOKEN", json.loads(result.stdout))

    def test_audit_combines_expected_public_pages_with_only_private_infisical_fields(self):
        self.contract["audit"] = {"required": ["VITE_LABEL", "SERVER_SECRET"], "optional": ["MISSING_PRIVATE"]}
        self.binding["profiles"]["audit"] = {"project": "example", "infisicalKeys": ["SERVER_SECRET", "MISSING_PRIVATE"]}
        result = self.run_child("audit")
        self.assertEqual(result.returncode, 0, result.stderr)
        child = json.loads(result.stdout)
        self.assertEqual(child["VITE_LABEL"], "fresh-provider-value")
        self.assertEqual(child["SERVER_SECRET"], "synthetic-private")
        self.assertNotIn("MISSING_PRIVATE", child)
        self.assertNotIn("INFISICAL_TOKEN", child)
        self.assertNotIn("CLOUDFLARE_API_TOKEN", child)
        self.assertEqual(len(self.requests), 2)

    def test_unbound_server_api_admin_preserve_infisical_only_semantics(self):
        self.env.pop("CLOUDFLARE_API_TOKEN")
        for name in ("server", "api", "admin"):
            with self.subTest(profile=name):
                self.requests.clear()
                self.contract[name] = {"required": ["SERVER_SECRET"]}
                result = self.run_child(name)
                self.assertEqual(result.returncode, 0, result.stderr)
                child = json.loads(result.stdout)
                self.assertEqual(child["SERVER_SECRET"], "synthetic-private")
                self.assertNotIn("VITE_LABEL", child)
                self.assertNotIn("CLOUDFLARE_API_TOKEN", child)
                self.assertEqual(self.requests, [("/infisical", None)])

    def test_invalid_hybrid_routing_never_fetches_either_provider(self):
        cases = [("deploy", ["SERVER_SECRET"]), ("test", ["SERVER_SECRET"]), ("audit", ["VITE_LABEL"]), ("test", ["UNKNOWN_KEY"]), ("audit", ["SERVER_SECRET", "SERVER_SECRET"])]
        for name, private in cases:
            with self.subTest(name=name, private=private):
                self.contract[name] = {"required": ["VITE_LABEL", "SERVER_SECRET"]}
                self.binding["profiles"][name] = {"project": "example", "infisicalKeys": private}
                self.requests.clear()
                result = self.run_child(name)
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(result.stdout, "")
                self.assertEqual(self.requests, [])

    def test_public_prefix_guard_and_provider_passthrough_guard_still_apply(self):
        for contract in ({"required": ["SERVER_SECRET"]}, {"required": ["VITE_LABEL"], "passthrough": ["CLOUDFLARE_API_TOKEN"]}, {"required": ["VITE_LABEL"], "passthrough": ["INFISICAL_TOKEN"]}, {"required": ["VITE_LABEL"], "passthrough": [{}]}):
            with self.subTest(contract=contract):
                self.contract["public"] = contract
                result = self.run_child()
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(result.stdout, "")
                self.assertNotIn("synthetic-bootstrap", result.stderr)
                self.assertNotIn("Traceback", result.stderr)

    def test_dotenv_is_rejected_before_pages_request(self):
        (self.root / ".env.local").write_text("VITE_LABEL=synthetic-local\n")
        result = self.run_child()
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.stdout, "")
        self.assertEqual(self.requests, [])
        self.assertNotIn("synthetic-local", result.stderr)

    def test_missing_cloudflare_required_key_has_names_only_provider_neutral_error(self):
        del self.entries["VITE_LABEL"]
        result = self.run_child()
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.stdout, "")
        self.assertIn("VITE_LABEL", result.stderr)
        self.assertNotIn("Infisical", result.stderr)
        self.assertNotIn("wrong-host", result.stderr)
        self.assertEqual(len(self.requests), 1)

    def test_client_test_cannot_request_private_keys_or_node_env_from_pages(self):
        self.binding["profiles"]["test"] = {"project": "example"}
        for key in ("SERVER_SECRET", "NODE_ENV"):
            with self.subTest(key=key):
                self.contract["test"] = {"required": [key]}
                self.requests.clear()
                result = self.run_child("test", "test")
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(result.stdout, "")
                self.assertEqual(self.requests, [])

    def test_cloudflare_token_is_never_application_configuration(self):
        self.contract["deploy"] = {"required": ["CLOUDFLARE_API_TOKEN"]}
        self.binding["profiles"]["deploy"] = {"project": "example"}
        self.entries["CLOUDFLARE_API_TOKEN"] = {"type": "plain_text", "value": "poison-provider-value"}
        result = self.run_child("deploy")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.stdout, "")
        self.assertNotIn("poison-provider-value", result.stderr)
        self.assertEqual(self.requests, [])

    def test_invalid_provider_bindings_fail_closed_before_any_provider_request(self):
        cases = [
            {"accountId": "https://evil.invalid", "profiles": {"public": {"project": "example"}}},
            {"accountId": "a" * 32, "profiles": {"public": {"project": "../other"}}},
            {"accountId": "a" * 32, "profiles": {"public": {"project": "example", "apiBase": "https://evil.invalid"}}},
            {"accountId": "a" * 32, "profiles": {"public": {"project": "example", "infisicalKeys": ["VITE_LABEL"]}}},
            {"accountId": "a" * 32, "profiles": {"public": {"project": "example", "infisicalKeys": "VITE_LABEL"}}},
            {"accountId": "a" * 32, "profiles": []},
            {"accountId": "a" * 32, "profiles": {}},
        ]
        for binding in cases:
            with self.subTest(binding=binding):
                self.binding = binding
                result = self.run_child()
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(result.stdout, "")
                self.assertNotIn("Traceback", result.stderr)
                self.assertEqual(self.requests, [])

    def test_hybrid_test_uses_preview_public_and_only_three_declared_backend_keys(self):
        backend = ["GOOGLE_GENERATIVE_AI_MODEL", "AI_DAILY_REQUEST_LIMIT", "CORS_ORIGINS"]
        self.contract["test"] = {"required": ["VITE_LABEL"] + backend}
        self.binding["profiles"]["test"] = {"project": "example", "infisicalKeys": backend}
        result = self.run_child("test", "test")
        self.assertEqual(result.returncode, 0, result.stderr)
        child = json.loads(result.stdout)
        self.assertEqual(child["VITE_LABEL"], "preview-provider-value")
        self.assertEqual(child["GOOGLE_GENERATIVE_AI_MODEL"], "synthetic-model")
        self.assertNotIn("NODE_ENV", child)
        self.assertNotIn("SERVER_SECRET", child)
        self.assertNotIn("INFISICAL_TOKEN", child)
        self.assertNotIn("CLOUDFLARE_API_TOKEN", child)
        self.assertEqual([p for p, _ in self.requests].count("/infisical"), 1)

    def test_public_works_without_infisical_and_strips_poison(self):
        (self.root / ".infisical.json").unlink()
        (self.root / "bin/infisical").unlink()
        self.env.pop("INFISICAL_TOKEN")
        result = self.run_child()
        self.assertEqual(result.returncode, 0, result.stderr)
        child = json.loads(result.stdout)
        self.assertEqual(child["VITE_LABEL"], "fresh-provider-value")
        self.assertEqual(child["NODE_ENV"], "production")
        self.assertNotIn("VITE_ABSENT", child)
        self.assertFalse(any(k.startswith("INFISICAL_") or k in {"SERVER_SECRET", "CLOUDFLARE_API_TOKEN", "UNRELATED_PRIVATE_TOKEN"} for k in child))
        self.assertEqual(len(self.requests), 1)
        self.assertEqual(self.requests[0][1], "Bearer synthetic-bootstrap")


if __name__ == "__main__":
    unittest.main()
