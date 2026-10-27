"""Redirect producer tests: isolated Git repo, fake vault/provider, real renderer."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

SOURCE = Path(__file__).resolve().parents[1]


class RedirectDeployTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name) / "repo"
        self.root.mkdir()
        self.home = Path(self.tmp.name) / "home"
        self.home.mkdir()
        for directory in ("scripts", "config", "bin"):
            (self.root / directory).mkdir()
        for name in ("env-run.py", "build-redirect.mjs", "deploy-redirect.sh", "publish-redirect.sh", "publish-pages.sh"):
            source = SOURCE / "scripts" / name
            if source.exists():
                shutil.copy(source, self.root / "scripts" / name)
        shutil.copy(SOURCE / "config/env-contract.json", self.root / "config/env-contract.json")
        shutil.copy(SOURCE / ".infisical.json", self.root / ".infisical.json")
        (self.root / ".gitignore").write_text("bin/\ndeploy/apex-redirect-out/\n")
        self.values = {
            "NODE_ENV": "production", "NEXT_PUBLIC_SITE_URL": "https://canonical.example",
            "NEXT_PUBLIC_GA_MEASUREMENT_ID": "G-SYNTHETIC", "CLOUDFLARE_ACCOUNT_ID": "synthetic-account",
            "CLOUDFLARE_PAGES_PROJECT": "synthetic-main", "CLOUDFLARE_REDIRECT_PROJECT": "synthetic-redirect",
            "DEPLOY_BRANCH": "fixture-production", "PRIVATE_APP_KEY": "synthetic-private-app-value",
        }
        self.env = {"PATH": str(self.root / "bin") + os.pathsep + os.environ["PATH"], "HOME": str(self.home), "TMPDIR": self.tmp.name,
                    "INFISICAL_TOKEN": "synthetic-vault-auth", "CLOUDFLARE_API_TOKEN": "synthetic-provider-auth",
                    "NEXT_PUBLIC_SITE_URL": "https://wrong-host.example", "CLOUDFLARE_REDIRECT_PROJECT": "wrong-host-project"}
        node = shutil.which("node")
        self.executable("node", "import os,sys\nassert not any(k.startswith(('CLOUDFLARE_', 'INFISICAL_')) for k in os.environ)\nassert 'PRIVATE_APP_KEY' not in os.environ\nopen(os.path.join(os.environ['HOME'],'built'),'w').write('public-only')\nos.execv(" + repr(node) + ", [" + repr(node) + "]+sys.argv[1:])\n")
        self.executable("wrangler", "import os,sys,json\nassert os.path.exists(os.path.join(os.environ['HOME'],'built'))\nassert os.environ['CLOUDFLARE_API_TOKEN']=='synthetic-provider-auth'\nassert not any(k.startswith('INFISICAL_') for k in os.environ)\nassert 'PRIVATE_APP_KEY' not in os.environ\nopen(os.path.join(os.environ['HOME'],'published'),'w').write(json.dumps(sys.argv[1:]))\n")
        self.git("init", "-q")
        self.git("add", ".")
        self.git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "commit", "-qm", "fixture")

    def executable(self, name, code):
        path = self.root / "bin" / name
        path.write_text("#!" + sys.executable + "\n" + code)
        path.chmod(0o700)

    def git(self, *args):
        return subprocess.check_output(["git", *args], cwd=self.root, env=self.env, text=True).strip()

    def run_deploy(self):
        self.executable("infisical", "import os,sys\nos.environ.update(" + repr(self.values) + ")\na=sys.argv[sys.argv.index('--')+1:]\nos.execvpe(a[0],a,os.environ)\n")
        return subprocess.run(["bash", "scripts/deploy-redirect.sh"], cwd=self.root, env=self.env, text=True, capture_output=True)

    def test_dirty_checkout_reports_actual_baseline_without_refusing_release(self):
        (self.root / "untracked-approved-change").write_text("fixture change")
        p = self.run_deploy()
        self.assertEqual(p.returncode, 0, p.stderr)
        args = json.loads((self.home / "published").read_text())
        self.assertIn("--commit-dirty=true", args)
        self.assertEqual(args[args.index("--commit-hash") + 1], self.git("rev-parse", "HEAD"))

    def test_absent_or_empty_redirect_project_cannot_fall_back_to_host_or_main(self):
        for value in (None, ""):
            with self.subTest(value=value):
                if value is None:
                    self.values.pop("CLOUDFLARE_REDIRECT_PROJECT", None)
                else:
                    self.values["CLOUDFLARE_REDIRECT_PROJECT"] = value
                p = self.run_deploy()
                self.assertNotEqual(p.returncode, 0)
                self.assertIn("CLOUDFLARE_REDIRECT_PROJECT", p.stderr)
                self.assertFalse((self.home / "published").exists())

    def test_optional_redirect_project_does_not_change_main_publisher(self):
        self.values.pop("CLOUDFLARE_REDIRECT_PROJECT")
        self.executable("infisical", "import os,sys\nos.environ.update(" + repr(self.values) + ")\na=sys.argv[sys.argv.index('--')+1:]\nos.execvpe(a[0],a,os.environ)\n")
        (self.home / "built").write_text("main artifact already prepared")
        p = subprocess.run([sys.executable, "scripts/env-run.py", "--env", "prod", "deploy", "--", "bash", "scripts/publish-pages.sh"], cwd=self.root, env=self.env, text=True, capture_output=True)
        self.assertEqual(p.returncode, 0, p.stderr)
        args = json.loads((self.home / "published").read_text())
        self.assertEqual(args[:5], ["pages", "deploy", "out", "--project-name", "synthetic-main"])

    def test_build_failure_never_starts_provider(self):
        self.values["NEXT_PUBLIC_SITE_URL"] = "http://unsafe.example"
        p = self.run_deploy()
        self.assertNotEqual(p.returncode, 0)
        self.assertFalse((self.home / "published").exists())

    def test_manual_producer_builds_public_artifact_then_publishes_redirect_project(self):
        p = self.run_deploy()
        self.assertEqual(p.returncode, 0, p.stderr)
        args = json.loads((self.home / "published").read_text())
        self.assertEqual(args, ["pages", "deploy", "deploy/apex-redirect-out", "--project-name", "synthetic-redirect", "--branch", "fixture-production", "--commit-hash", self.git("rev-parse", "HEAD"), "--commit-dirty=false"])
        output = self.root / "deploy/apex-redirect-out"
        self.assertEqual(sorted(p.name for p in output.iterdir()), ["_redirects", "index.html"])
        self.assertEqual((output / "_redirects").read_text(), "/* https://canonical.example/:splat 308\n")
        self.assertIn('href="https://canonical.example/"', (output / "index.html").read_text())
        for path in output.iterdir():
            for value in ("synthetic-provider-auth", "synthetic-vault-auth", "synthetic-private-app-value", "wrong-host"):
                self.assertNotIn(value, path.read_text())


if __name__ == "__main__":
    unittest.main()
