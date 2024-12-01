import createBundleAnalyzer from "@next/bundle-analyzer";

function on(value) {
  if (!value) return false;
  const lowerCaseValue = value.toLowerCase();
  return (
    lowerCaseValue === "1" ||
    lowerCaseValue === "true" ||
    lowerCaseValue === "on" ||
    lowerCaseValue === "yes" ||
    lowerCaseValue === "y"
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  logging: on(process.env.LOG_FETCH)
    ? { fetches: { fullUrl: true } }
    : undefined,
  experimental: {
    optimizePackageImports: [
      "@mantine/core",
      "@mantine/hooks",
      "@mantine/charts",
    ],
  },
};

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: on(process.env.ANALYZE_BUNDLE),
});

export default withBundleAnalyzer(nextConfig);
