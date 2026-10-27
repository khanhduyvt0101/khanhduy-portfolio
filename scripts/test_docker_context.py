"""Real Docker COPY-layer regression; needs Docker/BuildKit, never real secrets."""
import json
import io
import os
from pathlib import Path
import subprocess
import tarfile
import tempfile
import unittest
import uuid

ROOT = Path(__file__).resolve().parents[1]

class DockerContextTests(unittest.TestCase):
    def test_dotenv_never_enters_copy_layer(self):
        with tempfile.TemporaryDirectory(prefix="portfolio-context-", dir=os.environ["TMPDIR"]) as tmp:
            root = Path(tmp)
            (root / ".dockerignore").write_bytes((ROOT / ".dockerignore").read_bytes())
            (root / "Dockerfile").write_text("FROM scratch\nCOPY . /context/\n")
            forbidden = [".env", ".env.local", ".env.example", "config.env", "nested/.env", "nested/.env.local", "nested/.env.example", "nested/config.env", "nested/deep/suffix.env",
                         ".config/cloudflare/full-api-token", ".config/infisical/hermes-vps.env",
                         ".cloudflare/auth.json", ".infisical/auth.json", "cloudflare_token",
                         "nested/.config/cloudflare/full-api-token", "nested/cloudflare_token"]
            marker = b"SYNTHETIC_DOTENV_MUST_NOT_ENTER_LAYER"
            for name in forbidden:
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(marker)
            (root / "safe.txt").write_text("safe context control")
            tag = "portfolio-context-test:" + uuid.uuid4().hex
            def run(*args):
                return subprocess.run(args, check=True, capture_output=True)
            try:
                run("docker", "build", "--tag", tag, str(root))
                image = run("docker", "save", tag).stdout
                with tarfile.open(fileobj=io.BytesIO(image)) as archive:
                    manifest_file = archive.extractfile("manifest.json")
                    assert manifest_file is not None
                    manifest = json.load(manifest_file)
                    layers = [archive.getmember(name) for name in manifest[0]["Layers"]]
                    self.assertTrue(layers, "Docker archive must expose real COPY layers")
                    names = []
                    for member in layers:
                        layer_file = archive.extractfile(member)
                        assert layer_file is not None
                        raw = layer_file.read()
                        with tarfile.open(fileobj=io.BytesIO(raw)) as layer:
                            names += layer.getnames()
                            for entry in layer.getmembers():
                                if entry.isfile():
                                    content = layer.extractfile(entry)
                                    assert content is not None
                                    self.assertNotIn(marker, content.read(), "dotenv content persisted in COPY layer")
                        self.assertNotIn(marker, raw, "dotenv content persisted in COPY layer")
                    self.assertIn("context/safe.txt", names)
                    for name in forbidden:
                        self.assertNotIn("context/" + name, names)
                export = root / "export"
                run("docker", "build", "--output", "type=local,dest=" + str(export), str(root))
                self.assertTrue((export / "context/safe.txt").is_file())
                for name in forbidden:
                    self.assertFalse((export / "context" / name).exists(), name)
            finally:
                subprocess.run(["docker", "image", "rm", tag], capture_output=True)

    def test_wrapper_rejects_dotenv_before_invoking_docker(self):
        with tempfile.TemporaryDirectory(prefix="portfolio-preflight-", dir=os.environ["TMPDIR"]) as tmp:
            root = Path(tmp)
            (root / "scripts").mkdir()
            for name in ["build-container.sh", "env-run.py"]:
                (root / "scripts" / name).write_bytes((ROOT / "scripts" / name).read_bytes())
            (root / "nested").mkdir()
            (root / "nested/config.env").write_text("SYNTHETIC=yes")
            bin_dir = root / "bin"
            bin_dir.mkdir()
            for name in ["docker", "infisical"]:
                p = bin_dir / name
                p.write_text("#!/bin/sh\ntouch '" + str(root / "tool-called") + "'\n")
                p.chmod(0o755)
            env = dict(os.environ, PATH=str(bin_dir) + ":" + os.environ["PATH"])
            result = subprocess.run(["bash", str(root / "scripts/build-container.sh"), str(root / "out")], env=env, capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Production dotenv files are forbidden", result.stderr)
            self.assertFalse((root / "tool-called").exists())

if __name__ == "__main__":
    unittest.main()
