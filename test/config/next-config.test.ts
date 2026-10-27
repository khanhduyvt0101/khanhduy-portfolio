import { afterEach, describe, expect, it, vi } from "vitest";
import nextConfig from "../../next.config";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("static production configuration", () => {
  it("exports static files without requiring a Node.js server", () => {
    expect(nextConfig.output).toBe("export");
  });

  it("serves exported image files without a runtime optimizer", () => {
    expect(nextConfig.images?.unoptimized).toBe(true);
  });

  it.each([
    [undefined, false],
    ["", false],
    ["false", false],
    ["YES", true],
  ])("handles LOG_FETCH=%s", async (value, enabled) => {
    vi.stubEnv("LOG_FETCH", value);
    vi.resetModules();
    const { default: config } = await import("../../next.config");
    expect(config.logging).toEqual(
      enabled ? { fetches: { fullUrl: true } } : undefined,
    );
  });
});

describe("production public configuration validation", () => {
  it.each([
    [undefined, "G-TESTONLY123", "Missing NEXT_PUBLIC_SITE_URL"],
    ["http://fixture.example", "G-TESTONLY123", "Invalid NEXT_PUBLIC_SITE_URL"],
    [
      "https://fixture.example/path",
      "G-TESTONLY123",
      "Invalid NEXT_PUBLIC_SITE_URL",
    ],
    ["https://fixture.example", undefined, "NEXT_PUBLIC_GA_MEASUREMENT_ID"],
    ["https://fixture.example", "invalid", "NEXT_PUBLIC_GA_MEASUREMENT_ID"],
  ])(
    "rejects invalid public build values: %s %s",
    async (origin, id, error) => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", origin);
      vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", id);
      vi.resetModules();
      await expect(import("../../next.config")).rejects.toThrow(error);
    },
  );
  it("accepts an injected exact HTTPS origin and measurement ID", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fixture.example");
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TESTONLY123");
    vi.resetModules();
    expect((await import("../../next.config")).default.output).toBe("export");
  });
});
