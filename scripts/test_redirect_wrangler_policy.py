"""Installed Wrangler CLI acceptance, with every outbound transport denied."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

SOURCE = Path(__file__).resolve().parents[1]


class WranglerRedirectPolicyTests(unittest.TestCase):
    def test_redirect_publisher_reaches_exact_project_get_without_network(self):
        self.assertIsNotNone(shutil.which("wrangler"), "Installed Wrangler is required")
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            home = root / "home"
            home.mkdir()
            artifact = root / "deploy/apex-redirect-out"
            subprocess.run(["node", str(SOURCE / "scripts/build-redirect.mjs"), str(artifact)], env={"PATH": os.environ["PATH"], "NEXT_PUBLIC_SITE_URL": "https://canonical.example"}, check=True, capture_output=True)
            preload = root / "deny-network.cjs"
            preload.write_text('''const fs = require('node:fs');
const path = require('node:path');
require('node:diagnostics_channel').subscribe('undici:request:create', ({ request }) => {
  fs.appendFileSync(path.join(process.env.HOME, 'requests.jsonl'), JSON.stringify({method: request.method, origin: String(request.origin), path: request.path}) + '\\n');
  throw new Error('POLICY_DENIED_BEFORE_DISPATCH');
});
for (const mod of ['node:net', 'node:tls', 'node:http', 'node:https']) {
 const transport = require(mod);
 for (const key of ['connect', 'createConnection', 'request', 'get']) {
  if (typeof transport[key] === 'function') transport[key] = () => { throw new Error('POLICY_DENIED_TRANSPORT'); };
 }
}
''')
            env = {"PATH": os.environ["PATH"], "HOME": str(home), "TMPDIR": tmp,
                   "CLOUDFLARE_API_TOKEN": "synthetic-provider-only-not-real", "CLOUDFLARE_ACCOUNT_ID": "1" * 32,
                   "CLOUDFLARE_REDIRECT_PROJECT": "fixture-redirect-project", "DEPLOY_BRANCH": "main",
                   "NODE_OPTIONS": "--require=" + str(preload), "WRANGLER_SEND_METRICS": "false", "CI": "true"}
            for args in (["init", "-q"], ["add", "."], ["-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "commit", "-qm", "fixture"]):
                subprocess.run(["git", *args], cwd=root, env=env, check=True, capture_output=True)
            p = subprocess.run(["bash", str(SOURCE / "scripts/publish-redirect.sh")], cwd=root, env=env, text=True, capture_output=True, timeout=45)
            self.assertNotEqual(p.returncode, 0, "Network denial must prevent upload")
            requests = [json.loads(line) for line in (home / "requests.jsonl").read_text().splitlines()]
            self.assertTrue(any(r["method"] == "GET" and r["origin"] == "https://api.cloudflare.com" and r["path"] == "/client/v4/accounts/" + "1" * 32 + "/pages/projects/fixture-redirect-project" for r in requests), "Real Wrangler never reached the intended project lookup")
            self.assertNotIn("synthetic-provider-only-not-real", p.stdout + p.stderr)


if __name__ == "__main__":
    unittest.main()
