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
- Vercel for deployment

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

## Vercel

Vercel deploys only commits pushed to `main`. That branch is the production
branch; preview deployments for every other branch are disabled by
`vercel.json`.

Keep project environment variables scoped to Production only. This repository
does not require Vercel Preview or Development environment variables.

The expected Vercel project is:

```text
khanh-duy-projects/khanhduy-portfolio
```

After the Git repository is connected in Vercel and its production branch is
set to `main`, deployment is automatic:

```bash
git push origin main
```

Do not run `vercel deploy` or `vercel --prod` for the normal release flow.

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
