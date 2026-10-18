# VPS deployment runbook

## Current state

Production moved from Vercel to this VPS on **2026-10-18 at 14:31 UTC**.

- Website: `https://www.khanhduy.com`
- Apex redirects to www with HTTP 308, preserving paths and queries.
- Workspace: `/home/hermes/work/khanhduy-portfolio`
- Origin IPv4: `57.129.182.242`
- Registrar remains Namecheap; authoritative DNS remains Cloudflare.
- DNS-only apex A: `57.129.182.242`, TTL 300
- DNS-only www CNAME: `khanhduy.com`, TTL 300
- App: Node 24 standalone Next.js server, nonroot, loopback host port 46480
- Proxy: Caddy 2.11.7 + Cloudflare DNS module 0.2.4, public ports 80/443
- Active config: `deploy/Caddyfile`
- Both production certificates use DNS-01 with automatic renewal.
- Caddy certificate/config volumes persist across container replacement.
- Containers use `unless-stopped` and bounded logs; Docker is enabled at boot.

The former Vercel project was deleted at the owner's explicit request after
migration; lookup by its project ID returned HTTP 404. Vercel is no longer
available as a rollback origin. Use a retained VPS app image for rollback.
**Pushing main does not automatically deploy to either Vercel or this VPS.**
Use the manual release procedure. CI/CD and automatic deploy-on-push are
intentionally not used; run type/local checks before committing and deploy
manually after verification.

## Shared proxy: preserve Infisical

Caddy also serves `infisical.server.khanhduy.com` through
`infisical-backend:8080` on the external Docker network `edge`. Preserve this
site block and network. Do not stop/recreate the Infisical stack for portfolio
updates. Verify its HTTPS endpoint after any proxy change.

The temporary preview `https://57-129-182-242.sslip.io` remains available with a
noindex header during the observation period. Production has no noindex header.
The preview relies on third-party wildcard DNS and is not the permanent URL.

## Credentials

Check memory, the `infisical-secrets` skill, CLI authentication and existing
provider configuration before requesting new credentials or using a browser.

Existing DNS token: `~/.config/cloudflare/dns-api-token` (0600). It is mounted
read-only into Caddy only, then exported by its runtime entrypoint. It is not
baked into images or declared as a Compose environment value. Never print it,
commit it, or dump the Caddy process environment.

The token is source-IP restricted: host Cloudflare API calls must use IPv4.
Caddy's Docker networks are IPv4-only and DNS-01 issuance succeeded. Wrangler's
OAuth credential can read the zone but cannot access DNS records. The accessible
Infisical project did not contain a Cloudflare key during discovery.

Keep the token and Caddy data volume available for renewal. A replacement token
needs Zone DNS Edit + Zone Read for `khanhduy.com`; preserve its source-IP allowance.
Monitor renewal failures. Never run `docker compose down -v` for routine updates.

## Manual app release

```sh
docker compose config --quiet
docker image tag khanhduy-portfolio:production khanhduy-portfolio:rollback
docker compose build app
docker compose up -d --no-deps --wait --wait-timeout 90 app
python deploy/smoke-test.py https://www.khanhduy.com
```

Build successfully before replacing the app. The Docker build enforces frozen
Bun dependencies, TypeScript, Biome, tests with 100% coverage, then `next build`.
Host Node/Bun versions are not used. The runner contains the standalone server,
`.next/static` and `public`, not the full development dependency tree.

If release checks fail, retag the rollback image as `khanhduy-portfolio:production`
and recreate only the app. Keep the prior image until the release is verified.

## Proxy updates

```sh
docker compose build caddy
docker compose up -d --no-deps caddy
curl -4 -fsS -o /dev/null -w '%{http_code}\n' https://infisical.server.khanhduy.com
```

Replacing Caddy briefly interrupts both websites; schedule accordingly.
For config-only validation/reload, invoke the entrypoint so the exec subprocess
loads the runtime secret too:

```sh
docker compose exec -T caddy /usr/local/bin/caddy-entrypoint caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
docker compose exec -T caddy /usr/local/bin/caddy-entrypoint caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
```

Preserve the bind-mounted Caddyfile inode. If an editor replaces the inode and
Caddy sees stale content, recreate only Caddy and verify both services afterward.
Do not substitute the token into the Caddyfile; keep its runtime placeholder.

## Verification evidence

Directory: `/home/hermes/work/khanhduy-portfolio-evidence/`.

- TypeScript/Biome and production build passed.
- 31 tests passed with 100% statement/branch/function/line coverage.
- Production-origin trusted HTTPS passed before DNS changed.
- Post-cutover smoke checks passed: home, robots, sitemap, social PNGs, icon,
  favicon, 404 and 39 referenced assets.
- Actual Chrome connection to VPS IP confirmed; 23 images loaded, gallery,
  dark/light themes, desktop/mobile layout and zero runtime errors passed.
- Authoritative DNS and public resolvers 1.1.1.1 / 8.8.8.8 returned the new origin.
- Independent staging and production deployment reviews passed.
- App restart and certificate persistence tested during staging.
- Infisical remained HTTP 200 after proxy replacement and DNS cutover.

Existing React DOM-mock warnings do not fail unit tests; real-browser checks
passed without JavaScript errors. No off-host uptime monitor or scheduled backup
job was configured. Docker health failure alone does not restart a hung process.

## Historical DNS snapshot (not a current rollback target)

Exact before/after snapshots of all 22 records (0600):

```text
/home/hermes/.config/cloudflare/backups/khanhduy-dns-switch-20261018T143151Z/
```

Twenty unrelated records were compared unchanged, including email and Infisical.
Previous website records:

- ID `89869c3f3d55f62cc83a4f39b93f21e5`: apex A `216.198.79.1`, DNS-only, API TTL 1 (automatic)
- ID `6d10388e07111368d9f54f714f910cad`: www CNAME `4f06cb545aad1028.vercel-dns-017.com`, DNS-only, API TTL 1

These previous records are retained as historical evidence only. Do not restore
them: the old Vercel project was deleted and cannot serve as a fallback. For
application rollback, restore a retained VPS image as described above. Returning
to Vercel would require a new project, deployment and verified domain setup
before changing DNS. Never restore the entire zone over later mail/subdomain
edits; leave nameservers and MX/SPF/DKIM/DMARC unchanged.

## Operations

```sh
docker compose ps
docker compose logs --tail=100 app caddy
docker stats --no-stream
python deploy/smoke-test.py https://www.khanhduy.com
```
