# Khanh Duy Portfolio

Personal portfolio site for Khanh Duy, built with Next.js, React, Tailwind CSS, and shadcn-style UI components. The site showcases profile information, projects, social links, and blog content.

Production: https://www.khanhduy.com

## Stack

- Next.js 16 with the App Router
- React 19
- Tailwind CSS 4
- Bun for dependency management and scripts
- TypeScript with a single `tsconfig.json`
- Biome for formatting, import organization, and lint-style checks
- shadcn/ui with Tailwind v4 CSS-first theming
- Vercel for deployment

## Requirements

- Node.js 22 or newer
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

## Scripts

```bash
bun run check
```

Runs TypeScript checking with `tsconfig.json`, then checks formatting with Biome.

```bash
bun run format
```

Formats the project with Biome.

```bash
bun run build
```

Builds the production Next.js app.

```bash
bun run start
```

Serves the production build on port `46480`.

## Tooling Notes

- ESLint and Prettier are not used. Biome is the only formatter/checker.
- Commitlint is not used.
- i18n has been removed. The site currently uses static English copy.
- shadcn/ui is configured for Tailwind v4 without a `tailwind.config.ts` file.
- `check.sh`, `prepare.sh`, `reinstall.sh`, and `tsconfig.app.json` have been removed.
- Husky is not used; run `bun run check` manually before committing.

## Vercel

This repo is linked to the Vercel project:

```text
khanh-duy-projects/khanhduy-portfolio
```

Useful Vercel commands:

```bash
bunx vercel pull --yes
bunx vercel link --yes --project khanhduy-portfolio
```

## Project Structure

```text
app/          App Router pages, layout, and route assets
components/   Shared UI components
lib/          Small utilities
public/       Static assets
```

## Contact

Email: khanhduyvt0101@gmail.com
