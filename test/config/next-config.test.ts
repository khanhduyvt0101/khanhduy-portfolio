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
