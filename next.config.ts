import createBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

function on(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return ["1", "true", "on", "yes", "y"].includes(value.toLowerCase());
}

const nextConfig = {
  agentRules: false,
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  logging: on(process.env.LOG_FETCH)
    ? { fetches: { fullUrl: true } }
    : undefined,
} satisfies NextConfig;

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: on(process.env.ANALYZE_BUNDLE),
});

export default withBundleAnalyzer(nextConfig);
