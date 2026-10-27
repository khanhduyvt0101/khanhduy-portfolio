"""Local manual producer boundaries; never invoke a publisher."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class ManualProducerTests(unittest.TestCase):
    def test_install_check_and_test_have_individual_sanitized_profiles(self):
        source = (ROOT / 'scripts/deploy-pages.sh').read_text()
        self.assertIn('python3 scripts/env-run.py --env prod public -- bun install --frozen-lockfile', source)
        self.assertIn('python3 scripts/env-run.py --env prod public -- bun run check', source)
        self.assertIn('python3 scripts/env-run.py --env prod test -- bun --bun node_modules/vitest/vitest.mjs run --coverage', source)
        self.assertIn('\nbun run build\n', source)
        self.assertIn('exec python3 scripts/env-run.py --env prod deploy -- bash scripts/publish-pages.sh', source)

if __name__ == '__main__':
    unittest.main()
