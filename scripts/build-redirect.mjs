import { mkdirSync, writeFileSync } from "node:fs";

const origin = process.env.NEXT_PUBLIC_SITE_URL;
if (!origin) throw new Error("Missing NEXT_PUBLIC_SITE_URL");
const url = new URL(origin);
if (
  url.protocol !== "https:" ||
  url.origin !== origin ||
  url.username ||
  url.password
)
  throw new Error(
    "Invalid NEXT_PUBLIC_SITE_URL: expected an exact HTTPS origin",
  );
const destination = process.argv[2] ?? "deploy/apex-redirect-out";
mkdirSync(destination, { recursive: true });
writeFileSync(`${destination}/_redirects`, `/* ${origin}/:splat 308\n`);
writeFileSync(
  `${destination}/index.html`,
  `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Khanh Duy</title></head><body><a href="${origin}/">Visit Khanh Duy</a></body></html>\n`,
);
