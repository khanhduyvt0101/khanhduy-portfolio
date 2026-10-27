// Production values must be injected from the repository's Infisical project.
if (process.env.NODE_ENV === "production") {
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
  if (
    !/^G-[A-Z0-9]{6,20}$/.test(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "")
  )
    throw new Error("Missing or invalid NEXT_PUBLIC_GA_MEASUREMENT_ID");
}

import createBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

function on(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return ["1", "true", "on", "yes", "y"].includes(value.toLowerCase());
}

const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
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
