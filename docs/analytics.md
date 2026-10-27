# Optional website measurement

Public production values come only from this repository’s Cloudflare Variables. `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_SITE_URL` are required at production build time; there is no production fallback. Never use server Measurement Protocol secrets in a website build.

Collection starts automatically only on HTTPS `www.khanhduy.com`, pathname `/`, without Do Not Track / Global Privacy Control. This is a site-owner collection policy, not visitor consent. No Analytics choices panel is rendered and no automatic consent grant is saved. Existing `website-analytics-v1=denied` preferences are still honored; inaccessible storage fails closed. Other hosts, previews, technical paths and unknown routes fail closed. Disabling collection removes the isolated collector and its host-only `public_analytics_*` cookies. Cookie lifetime is configured to 30 days. Cross-tab storage changes, focus and visibility changes recheck eligibility.

Google runs only inside the inert same-origin `public/analytics-frame.html`, created only when collection is eligible with `referrerpolicy=no-referrer`. It sees no parent-page form/link/title/history surface. Every manual event has canonical origin + allowlisted pathname, static title, empty referrer and no query/fragment. The frame is an automatic-measurement isolation/lifecycle boundary, not a security sandbox against malicious same-origin scripts. Do not move the Google tag into the main document. Deploy the frame file with the static export.

## Fixed event schema

- `page_view`: one initial/public pathname view; no query/hash-only views. Revisiting a different approved page would be a new view. Portfolio currently has only `/`.
- `select_content`: fixed `content_type=owner_product|developer_project`, slug `item_id`, `link_placement=owner_showcase|developer_showcase|footer`.
- `contact_click`: fixed `contact_method=email|linkedin`, `link_placement=hero|footer`.

There are 21 approved CTA keys in `lib/analytics-config.ts` (7 owner cards, 3 developer cards, 7 footer product links, 4 email/LinkedIn placements). Matching literal href and key are required. Other social links and unknown metadata are ignored. No URL, mail destination, DOM text or arbitrary attribute is sent. Product referrals and contact clicks are intent, not purchases, installs, messages sent or leads accepted. Vercel telemetry mounts were removed; their unused dependencies were not churned.

## Local validation (no deploy)

```sh
python3 scripts/env-run.py --env prod public -- bun install --frozen-lockfile
python3 scripts/env-run.py --env prod public -- bun run check
python3 scripts/env-run.py --env prod test -- bun --bun node_modules/vitest/vitest.mjs run --coverage
bun run build
```

Browser validation must use Camofox with interception installed before navigation. Capture/fulfill collection locally and block unknown external requests; never generate production analytics events for QA. Verify automatic startup without a saved grant, DNT/GPC, existing denial, alias/preview/private exclusion, and sanitized payloads. The historical `deploy/analytics-browser.mjs` requires Chrome and opt-in controls and is not compatible with this policy; do not run it. Browser checks do not prove Google reporting ingestion.

**Historical acceptance finding:** the runtime downloaded during the original opt-in rollout emitted automatic `scroll`; strict browser QA correctly rejected it. Parent subsequently confirmed authenticated readback of Enhanced Measurement OFF, redaction, key events and dimensions. Use a current, explicitly pinned runtime fixture for real-SDK verification. Retain disabled ad signals/personalization.

The owner explicitly authorized manual publication of the automatic-analytics policy change. The existing manual release path is `bun run deploy` (Cloudflare-backed deployment profile). IDs are baked at build time; setting runtime env after upload does nothing. Historical evidence: `/home/hermes/work/project-migrations/ga-implementation-reference.md`.

