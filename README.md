# Khanh Duy Portfolio

Personal portfolio site for Khanh Duy, built with Next.js, React, Tailwind CSS,
TypeScript, and Bun. The single-page site contains a header, profile hero, social
links, and footer.

Production: https://www.khanhduy.com

## Stack

- Next.js 16 with the App Router
- React 19
- Tailwind CSS 4
- shadcn/ui with the Radix Nova style and Lucide component icons
- Bun for dependency management and scripts
- TypeScript 7 with Orchestero-style strict Bun project configuration
- Biome for formatting, import organization, and lint-style checks
- Vitest with 100% coverage thresholds
- Cloudflare Pages for static hosting and manual Wrangler deployments

## Requirements

- Node.js 24
- Bun 1.3 or newer

## Setup

```bash
git clone https://github.com/khanhduyvt0101/khanhduy-portfolio.git
cd khanhduy-portfolio
bun install
```

## Development

```bash
bun run dev
```

The development server runs on:

```text
http://localhost:46480
```

Changes to files under `app/`, `components/`, and `lib/` reload automatically
while the development server is running.

## Validation and tests

```bash
bun --bun tsc --build
bun --bun biome check
bun run check
```

`bun run check` runs the same TypeScript build-mode check and Biome validation in sequence.

```bash
bun run format
```

Formats the project with Biome.

```bash
bun run build
```

Builds the production static export into `out/`; no production Node server is needed.

```bash
bun run test
bun run test --coverage
```

Runs the Vitest suite, optionally enforcing 100% statement, branch, function, and line coverage.

Before committing, run the complete local validation sequence:

```bash
bun run check
bun run test --coverage
bun run build
```

```bash
bun run start
```

Previews `out/` locally with the installed Wrangler CLI on port `46480`. Stop the preview after checks.

## Project conventions

- ESLint and Prettier are not used. Biome is the only formatter/checker.
- Commitlint is not used.
- i18n has been removed. The site currently uses static English copy.
- Handwritten source follows one-export-per-file and kebab-case filename conventions.
- Suppression comments, unsafe double casts, `any` casts, and non-null assertions are not accepted in handwritten code.
- `check.sh`, `prepare.sh`, `reinstall.sh`, and `tsconfig.app.json` have been removed.
- Husky is not used; run the validation commands above manually before
  committing.

## Adding shadcn components

The shadcn configuration uses the `~` import alias and writes components to
`components/ui/`:

```bash
bunx --bun shadcn@latest add button
```

Registry settings, aliases, styling, and icon defaults are defined in
`components.json`.

## Production deployment

Production is a pure static export on Cloudflare Pages, with Cloudflare-managed
HTTPS. Namecheap remains the domain registrar. There is no VPS app process,
Pages Function, Worker script, or Git-triggered deployment.

After local checks/build and separate release authorization, deploy manually (commit/push is separately authorized):

```bash
bun run deploy
python deploy/smoke-test.py https://www.khanhduy.com
```

If Node/Bun are not installed locally, generate the verified artifact with Docker:

```bash
bun run build:container -- <empty-output-directory>
```

The Docker build runs TypeScript, Biome, coverage tests and Next static export;
it does not start a server. A separate static Pages project, `khanhduy-redirect`,
redirects the apex domain to www. See `deploy/README.md` for the manual workflow,
preview commands, custom domains, verification, and rollback.

CI/CD is intentionally not used. The former Vercel project was deleted; the old
VPS website runtime is retired. Infisical's independent VPS proxy is unrelated
to portfolio releases and must be preserved.

## Project Structure

```text
app/          App Router pages, layout, and route assets
components/   Header, hero, footer, and theme components
lib/          Shared SEO and Open Graph logic
public/       Static assets
test/         Vitest tests and browser-like test setup
```

## Contact

Email: khanhduyvt0101@gmail.com

Production configuration and authenticated local checks: see `docs/cloudflare.md`. Docker builds use an ephemeral BuildKit Cloudflare token secret, not an Infisical CLI or machine-bootstrap mount; no app values are supplied as build arguments.

`build:container` requires an empty destination, passes the host token with `--secret id=cloudflare_token,env=CLOUDFLARE_API_TOKEN`, and disables both verification/build-stage caching so each reads current Cloudflare Variables. No token file or external CLI build context is created. Never pass app values as Docker build arguments.
