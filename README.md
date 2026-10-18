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
- Docker Compose and Caddy for VPS deployment

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

Builds the production Next.js app.

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

Serves the production build on port `46480`.

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

Production is self-hosted on the VPS using Docker Compose, a Node.js 24
standalone Next.js server, and Caddy with automatic HTTPS. Cloudflare manages
DNS; Namecheap remains the domain registrar.

```bash
docker compose build app
docker compose up -d --no-deps --wait --wait-timeout 90 app
python deploy/smoke-test.py https://www.khanhduy.com
```

The build runs TypeScript, Biome, and tests with coverage before producing the
production image. See `deploy/README.md` for initial setup, credentials,
shared Infisical proxy precautions, releases, verification, and rollback.

The former Vercel project was deleted at the owner's request after migration.
There is no Vercel fallback. Pushing `main` does not automatically deploy to this
VPS; use the documented manual release process. CI/CD is intentionally not used.

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
