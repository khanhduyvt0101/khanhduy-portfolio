"""Container wiring checks only; never builds an image or contacts a provider."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ContainerCloudflareTests(unittest.TestCase):
    def test_buildkit_token_is_consumed_only_by_runner_parent(self):
        with tempfile.TemporaryDirectory(dir=os.environ["TMPDIR"]) as tmp:
            root = Path(tmp)
            (root / "scripts").mkdir()
            helper = root / "scripts/container-cloudflare.py"
            self.assertTrue((ROOT / "scripts/container-cloudflare.py").exists(), "BuildKit credential bridge is missing")
            helper.write_bytes((ROOT / "scripts/container-cloudflare.py").read_bytes())
            # A synthetic runner inspects only its own incoming bootstrap boundary.
            (root / "scripts/env-run.py").write_text(
                "import json,os,sys\n"
                "print(json.dumps({'argv':sys.argv[1:], 'token':os.environ.get('CLOUDFLARE_API_TOKEN')}))\n"
            )
            # The real mount location is fixed, so exercise the bridge through its function.
            spec_script = (
                "import importlib.util, pathlib; "
                f"s=importlib.util.spec_from_file_location('bridge',{str(helper)!r}); "
                "m=importlib.util.module_from_spec(s); s.loader.exec_module(m); "
                f"m.main(['test','--','synthetic-child'], token_path=pathlib.Path({str(root / 'token')!r}))"
            )
            (root / "token").write_text("synthetic-provider-token\n")
            result = subprocess.run([sys.executable, "-c", spec_script], cwd=root, env=dict(os.environ, CLOUDFLARE_API_TOKEN="untrusted-inherited"), capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            payload = json.loads(result.stdout)
            self.assertEqual(payload["token"], "synthetic-provider-token")
            self.assertEqual(payload["argv"], ["--env", "prod", "test", "--", "synthetic-child"])

    def test_missing_or_empty_mount_fails_without_starting_runner(self):
        with tempfile.TemporaryDirectory(dir=os.environ["TMPDIR"]) as tmp:
            root = Path(tmp)
            (root / "scripts").mkdir()
            self.assertTrue((ROOT / "scripts/container-cloudflare.py").exists())
            helper = root / "scripts/container-cloudflare.py"
            helper.write_bytes((ROOT / "scripts/container-cloudflare.py").read_bytes())
            (root / "scripts/env-run.py").write_text("raise RuntimeError('RUNNER_MUST_NOT_START')\n")
            token = root / "absent-token"
            for empty in (False, True):
                if empty:
                    token.write_text("\n")
                script = (
                    "import importlib.util,pathlib; "
                    f"s=importlib.util.spec_from_file_location('bridge',{str(helper)!r}); "
                    "m=importlib.util.module_from_spec(s); s.loader.exec_module(m); "
                    f"m.main(['public','--','synthetic-child'],token_path=pathlib.Path({str(token)!r}))"
                )
                result = subprocess.run([sys.executable, "-c", script], capture_output=True, text=True)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("Required Cloudflare BuildKit secret is", result.stderr)
                self.assertNotIn("RUNNER_MUST_NOT_START", result.stderr)

    def test_wrapper_without_provider_auth_never_invokes_docker(self):
        with tempfile.TemporaryDirectory(dir=os.environ["TMPDIR"]) as tmp:
            root = Path(tmp)
            (root / "scripts").mkdir()
            (root / "bin").mkdir()
            (root / "scripts/build-container.sh").write_bytes((ROOT / "scripts/build-container.sh").read_bytes())
            (root / "scripts/env-run.py").write_text("def reject_production_dotenv(root): pass\nclass ConfigError(Exception): pass\n")
            docker = root / "bin/docker"
            docker.write_text("#!/bin/sh\ntouch '" + str(root / "docker-called") + "'\n")
            docker.chmod(0o755)
            env = {k: v for k, v in os.environ.items() if k != "CLOUDFLARE_API_TOKEN"}
            env["PATH"] = str(root / "bin") + ":" + env["PATH"]
            result = subprocess.run(["bash", str(root / "scripts/build-container.sh"), str(root / "out")], env=env, capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Live Cloudflare authentication is required", result.stderr)
            self.assertFalse((root / "docker-called").exists())

    def test_provider_bootstrap_paths_are_excluded_before_copy(self):
        patterns = (ROOT / ".dockerignore").read_text().splitlines()
        for pattern in ("**/.config", "**/.cloudflare", "**/.infisical", "**/cloudflare_token", "**/full-api-token"):
            self.assertIn(pattern, patterns)
        # These files contain IDs only and must remain available to the runner.
        self.assertNotIn(".cloudflare-env.json", patterns)
        self.assertNotIn(".infisical.json", patterns)

    def test_dockerfile_has_no_infisical_or_provider_env_layers(self):
        source = (ROOT / "Dockerfile").read_text()
        self.assertNotIn("infisical", source.lower())
        self.assertNotRegex(source, r"(?im)^\s*(ARG|ENV)\s+.*(?:TOKEN|SECRET|CLIENT_ID)")
        self.assertEqual(source.count("id=cloudflare_token"), 2)
        self.assertIn("container-cloudflare.py test -- bun run test --coverage", source)
        self.assertIn("container-cloudflare.py public --", source)

    def test_wrapper_uses_environment_secret_without_cli_context(self):
        source = (ROOT / "scripts/build-container.sh").read_text()
        self.assertIn("id=cloudflare_token,env=CLOUDFLARE_API_TOKEN", source)
        self.assertIn("--no-cache-filter verified,builder", source)
        self.assertNotIn("--build-context", source)
        self.assertNotIn("infisical", source.lower())


if __name__ == "__main__":
    unittest.main()
