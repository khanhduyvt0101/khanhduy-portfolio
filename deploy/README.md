# Cloudflare Pages deployment

## Architecture

The portfolio is a pure Next.js static export hosted on Cloudflare Pages.
There is no production Node server, Pages Function, Worker script, database,
VPS origin or Cloudflare Images dependency for this website.

- Main project: `khanhduy-portfolio`
- Production: `https://www.khanhduy.com`
- Preview: `https://khanhduy-portfolio.pages.dev`
- Apex redirect project: `khanhduy-redirect`
- Apex: `https://khanhduy.com` returns 308 to www, preserving path and query.
- Cloudflare account: `4619630cc2fa4da9fb7919dc1bc36889`
- Registrar remains Namecheap; DNS remains Cloudflare.
- Both projects are Direct Upload projects with no Git integration or CI/CD.

A separate tiny static Pages project handles the apex redirect because Pages
`_redirects` rules do not support source-host matching. Its only rule is
`/* https://www.khanhduy.com/:splat 308`. It contains no runtime function and
cannot redirect the www project back to itself.

The projects use only static asset hosting, within Free limits. The initial
export contained 74 files, about 3.06 MB total, largest file 472,350 bytes.
Cloudflare manages production HTTPS; the website does not depend on VPS uptime.

## Build and local validation

With Node 24 and Bun installed:

```sh
bun install --frozen-lockfile
bun run check
bun run test --coverage
bun run build
bun run start
```

`start` uses the installed Wrangler CLI to preview `out/` on localhost:46480;
it is not a permanent production service. `dev` still runs Next development.

Without installing Node/Bun on this VPS, use the verified Docker artifact build:

```sh
docker build --target export --output type=local,dest=out .
wrangler pages dev out --ip 127.0.0.1 --port 46480
```

The Docker build runs TypeScript, Biome, coverage tests and Next static build.
It writes `out/` and does not create a production app image or running server.
Use a different preview port if localhost:46480 is already in use. Stop the
preview process when checks finish.

From another terminal:

```sh
python deploy/smoke-test.py http://127.0.0.1:46480
```

Static exports require `output: "export"`, unoptimized local image files and
explicit `dynamic = "force-static"` on generated metadata routes. `public/_headers`
sets MIME types for the extensionless Open Graph/Twitter PNGs and noindex only
for pages.dev hosts; production remains indexable. There is an exported 404 page.

## Manual release

Follow the owner's workflow: local checks/build, commit/push, manual deploy,
then verify. A Git push does not trigger a deployment.

```sh
wrangler whoami
wrangler pages deploy out --project-name khanhduy-portfolio --branch main
python deploy/smoke-test.py https://www.khanhduy.com
```

`bun run deploy` wraps the main deploy command when Bun is available.
Only redeploy the redirect project when its files change:

```sh
wrangler pages deploy deploy/apex-redirect --project-name khanhduy-redirect --branch main
curl -I 'https://khanhduy.com/example?q=1'
```

Never add a `functions/` directory or `_worker.js` without reviewing its runtime
and billing implications. Keep secrets, env files, output, backups and Wrangler
state out of Git. Do not change any account subscription for static hosting.

## DNS and custom domains

Cloudflare DNS records are proxied CNAMEs with automatic TTL:

- `www.khanhduy.com` -> `khanhduy-portfolio.pages.dev`
- `khanhduy.com` -> `khanhduy-redirect.pages.dev`

Associate the hostname with its Pages project before changing DNS. Read back
both Pages domain status and the exact DNS records. Activation is asynchronous;
do not remove an old origin until both custom domains are active, trusted HTTPS
and public checks pass, and the previous DNS TTL has expired. If validation gets
stuck after correct CNAMEs, the Pages domain PATCH endpoint retries validation;
read back its eventual status, not just the immediate retry response.

Wrangler OAuth handles Pages deployment/domain APIs. The existing administrative
DNS token at `~/.config/cloudflare/dns-api-token` is outside the repository and
source-IP restricted; direct API operations using it must use IPv4. It is not
needed by deployed static assets and must not be uploaded. Reload memory and the
`infisical-secrets` skill before requesting new credentials.

## VPS cleanup and Infisical

The old portfolio app/proxy stack is retired after verified Pages cutover. The
Infisical proxy has its own deployment at `/home/hermes/work/server-edge`, using
the external Docker network `edge` and independent certificate volumes. It
serves only `infisical.server.khanhduy.com`; preserve its container and the
Infisical backend/database/Redis. It does not need the portfolio repository or
Cloudflare DNS token.

Do not run global Docker prune commands. Remove only obsolete portfolio
containers, its private network, retired volumes and images after checking that
nothing else references them. Never delete Infisical or other service data.

## Verification and rollback

Evidence is stored at `/home/hermes/work/khanhduy-portfolio-evidence/`.
The static migration passed TypeScript/Biome, 36 tests with 100% coverage, local
and Pages smoke checks, and real-browser image/gallery/theme/responsive checks.

Smoke checks cover the home page, robots, sitemap, social PNGs, icon, favicon,
404, CSS, JavaScript and exported image files. Verify the apex 308 separately,
including path/query preservation. Both production responses must use trusted
TLS; only pages.dev responses should have the preview noindex header.

For a bad release, manually redeploy a previous known-good static build or use
Pages deployment rollback after confirming the intended project/deployment.
List deployments with:

```sh
wrangler pages deployment list --project-name khanhduy-portfolio
```

The prior VPS DNS snapshot is private at
`/home/hermes/.config/cloudflare/backups/pages-cutover-20261018T150244Z/`.
It is historical after old-runtime cleanup: do not point DNS back to the VPS
without first rebuilding a working origin. Vercel was deleted earlier and is
not a rollback target. Twenty unrelated DNS records, including mail and
Infisical, were compared unchanged during Pages cutover.
