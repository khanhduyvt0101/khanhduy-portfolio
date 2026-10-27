# syntax=docker/dockerfile:1
FROM oven/bun:1.3.14@sha256:e10577f0db68676a7024391c6e5cb4b879ebd17188ab750cf10024a6d700e5c4 AS bun

FROM node:24-bookworm-slim@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5 AS dependencies
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
RUN apt-get update && apt-get install -y --no-install-recommends python3 ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM dependencies AS source
COPY . .

FROM source AS verified
RUN --mount=type=secret,id=cloudflare_token,required=true \
    python3 scripts/container-cloudflare.py public -- bun run check && \
    python3 scripts/container-cloudflare.py test -- bun run test --coverage

FROM verified AS builder
RUN --mount=type=secret,id=cloudflare_token,required=true \
    python3 scripts/container-cloudflare.py public -- bun x --no-install next build

# Build artifact only: no production container or server process is needed.
FROM scratch AS export
COPY --from=builder /app/out/ /
