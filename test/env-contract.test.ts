import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";

it("rejects production builds without injected public configuration", () => {
  const env: NodeJS.ProcessEnv = { ...process.env, NODE_ENV: "production" };
  delete env.NEXT_PUBLIC_SITE_URL;
  delete env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const result = spawnSync(
    process.execPath,
    ["-e", "import('./next.config.ts')"],
    { env, encoding: "utf8" },
  );
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain("NEXT_PUBLIC_SITE_URL");
});

it.each([
  ["http://fixture.example", "G-TESTONLY123", false],
  ["https://fixture.example/path", "G-TESTONLY123", false],
  ["https://fixture.example", "", false],
  ["https://fixture.example", "invalid", false],
  ["https://fixture.example", "G-X", false],
  ["https://fixture.example", "G-TESTONLY123", true],
])(
  "validates injected production origin and ID: %s %s",
  (origin, id, valid) => {
    const result = spawnSync(
      process.execPath,
      ["-e", "import('./next.config.ts')"],
      {
        env: {
          ...process.env,
          NODE_ENV: "production",
          NEXT_PUBLIC_SITE_URL: origin,
          NEXT_PUBLIC_GA_MEASUREMENT_ID: id,
        },
        encoding: "utf8",
      },
    );
    expect(result.status === 0).toBe(valid);
  },
);

it("keeps publish credentials outside frontend build commands", () => {
  const wrapper = readFileSync("scripts/deploy-pages.sh", "utf8");
  expect(wrapper).toContain("bun run build");
  expect(wrapper).toContain(
    "--env prod deploy -- bash scripts/publish-pages.sh",
  );
  expect(readFileSync("scripts/publish-pages.sh", "utf8")).not.toContain(
    "bun run build",
  );
});

it("container production builds require ephemeral Cloudflare authentication", () => {
  const dockerfile = readFileSync("Dockerfile", "utf8");
  expect(dockerfile).toContain("type=secret,id=cloudflare_token,required=true");
  expect(dockerfile).not.toContain("COPY --from=infisical-cli");
  expect(dockerfile).toContain("scripts/container-cloudflare.py public --");
  expect(dockerfile).toContain("scripts/container-cloudflare.py test --");
});

it("generates redirect artifacts from the injected canonical origin", () => {
  const destination = mkdtempSync(join(tmpdir(), "redirect-test-"));
  const result = spawnSync(
    process.execPath,
    ["scripts/build-redirect.mjs", destination],
    {
      env: { ...process.env, NEXT_PUBLIC_SITE_URL: "https://fixture.example" },
      encoding: "utf8",
    },
  );
  expect(result.status).toBe(0);
  expect(readFileSync(join(destination, "_redirects"), "utf8")).toBe(
    "/* https://fixture.example/:splat 308\n",
  );
  expect(readFileSync(join(destination, "index.html"), "utf8")).toContain(
    "https://fixture.example/",
  );
  rmSync(destination, { recursive: true });
});

it("container entrypoint forces a fresh Cloudflare-backed production build", () => {
  expect(readFileSync("scripts/build-container.sh", "utf8")).toContain(
    "--no-cache-filter verified,builder",
  );
});
