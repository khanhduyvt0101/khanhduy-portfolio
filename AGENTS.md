# Repository workflow

- Keep deployment manual. Do not add CI/CD, GitHub Actions, or deploy-on-push unless the owner explicitly changes the workflow.
- Before committing, run type/local checks (`bun run check`) and verify changed behavior locally. Tests are available with `bun run test`; the Docker static artifact build also enforces checks and coverage.
- Production is Cloudflare Pages static hosting: `output: "export"`, local unoptimized images, build-time metadata routes. Never add Functions, a Worker script or paid image processing without approval.
- Commit/push only intended source/config/docs. Never commit secrets, env files, host backups, generated `out/`, or Wrangler state.
- Deploy manually using `deploy/README.md`. Pushing Git does not deploy. The separate `khanhduy-redirect` Pages project handles only apex-to-www redirects.
- No portfolio process needs to run on the VPS. Infisical and its independent `/home/hermes/work/server-edge` proxy are unrelated infrastructure: do not stop or alter them for website releases.
- Use Node 24, Bun, TypeScript, Biome and kebab-case filenames. Prefer CLI/API, check authentication and existing credential configuration before requesting credentials or using a browser.
