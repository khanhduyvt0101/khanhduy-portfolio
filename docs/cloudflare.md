# Cloudflare client configuration

`.cloudflare-env.json` binds the existing `public`, `test`, and `deploy` profiles
to this repository's main Cloudflare Pages project. It contains account/project
identifiers only, never application values or authentication. The names-only
allowlists remain in `config/env-contract.json`.

## Source and authentication

All website public settings, test settings, and nonsecret deployment metadata
come from that project's **Cloudflare Variables**. `--env prod` selects
**Production**; `--env dev`, `--env staging`, and `--env test` select **Preview**.
This includes canonical origins, GA measurement IDs, application/store/support
settings and deployment account/project/branch/redirect metadata when named by
the selected contract. Update both provider environments deliberately; do not
fall back from Preview to Production or to host application variables.

The host must supply `CLOUDFLARE_API_TOKEN` for the runner's direct Cloudflare API
read. Do not use the Infisical CLI or app-specific Infisical project for these
client/deploy profiles. No browser build or test subprocess receives the provider
token; only the explicit deployment profile may pass it to the publisher. No
token belongs in source, image ARG/ENV, application values or generated output.
A fresh provider read is required; missing authentication, missing required
variables, invalid provider responses and unavailable configuration fail closed.

There is **no dotenv fallback**, including for test/Preview profiles. Blank
names-only examples may document names, but may not supply settings. Production
build profiles require provider-sourced `NODE_ENV=production`; `test` intentionally
omits `NODE_ENV` so the test framework selects test mode. Inherited application
variables and unrelated credentials must not shadow the selected profile.

## Existing command interface

With host authentication already available (never print its value):

```sh
python3 -m unittest scripts/test_client_source_binding.py -v
python3 scripts/env-run.py --env prod test -- bun run test
python3 scripts/env-run.py --env prod public --build
```

`--build` uses the canonical runner's build boundary so the configured public
profile is fetched once and authentication is stripped from the compiler child.
Existing project build/check/release wrappers retain their names. Use the manual
release guide for project-specific gates; the commands here authorize no upload,
commit, push, CI/CD or native build.

Consent, revoke, DNT/GPC, exact-origin/preview restrictions, local-host behavior
and existing analytics assertions remain unchanged. Static settings are baked
at build time; changing provider variables does not mutate an uploaded artifact.

## Infisical boundary

`.infisical.json` and the existing app-specific Infisical project are retained
for archives only in this static-client repository. They are not a client config
fallback. Backend secrets in backend services remain in Infisical; this change
neither migrates nor deletes them. These three profiles have no backend reads.

See `../deploy/README.md` for authorized manual publication and readback gates.

## Container builds

`bash scripts/build-container.sh <empty-output-directory>` passes host
`CLOUDFLARE_API_TOKEN` directly through BuildKit's
`--secret id=cloudflare_token,env=CLOUDFLARE_API_TOKEN`. No credential file or
Infisical CLI context is created. Only the verification/build RUNs mount it at
`/run/secrets/cloudflare_token`; `scripts/container-cloudflare.py` loads it for
the runner process, which must strip it before public/test children. The pinned
Node/Bun images and frozen install are unchanged. Both `verified` and `builder`
stages bypass cache to read current provider configuration. No production
server image is exported. Keep dotenv/provider bootstrap material out of every
COPY layer, not merely the final static export.

The static wiring tests do not prove the image build. Actual container execution,
COPY-layer inspection and final artifact credential scans must be separately
authorized after the canonical runner integration; no build is implied here.
