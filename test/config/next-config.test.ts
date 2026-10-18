import { afterEach, describe, expect, it, vi } from "vitest";
import nextConfig from "../../next.config";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("self-hosted production configuration", () => {
  it("produces a standalone Node.js server for the production container", () => {
    expect(nextConfig.output).toBe("standalone");
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
