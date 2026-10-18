# Repository workflow

- Keep deployment manual. Do not add CI/CD, GitHub Actions, or automatic deploy-on-push unless the owner explicitly requests a workflow change.
- Before committing, run the project's type/local checks (`bun run check`) and verify changed behavior locally. Existing tests are available with `bun run test`; production Docker builds also run the checks and coverage suite.
- Commit and push only the intended source/config/documentation changes. Never commit secrets, `.env` files, host backup files, build outputs, or credentials.
- Deploy manually after verification using `deploy/README.md`. A Git push alone does not deploy the website. The former Vercel project has been deleted.
- The shared Caddy proxy also serves Infisical. Preserve its route and external `edge` network; normally replace only the portfolio app during a release.
- Use the existing README conventions: Node 24, Bun, TypeScript, Biome, and kebab-case filenames. Prefer CLI/API over browser automation and check existing credential configuration before requesting credentials.
