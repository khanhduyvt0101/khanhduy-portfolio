import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "https://www.khanhduy.com",
      },
    },
    include: ["test/**/*.test.{ts,tsx}"],
    setupFiles: ["test/setup.ts"],
    coverage: {
      provider: "istanbul",
      include: [
        "hooks/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
        "app/**/*.{ts,tsx}",
      ],
      // The WebGL room and its scroll choreography need a real GPU browser; they
      // are verified with browser smoke tests. Their server-rendered copy is
      // covered through the home page tests.
      exclude: ["test/**/*", "components/room/**"],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
