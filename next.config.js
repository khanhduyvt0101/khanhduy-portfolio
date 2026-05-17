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
  devIndicators: false,
  logging: on(globalThis?.process?.env?.LOG_FETCH)
    ? { fetches: { fullUrl: true } }
    : undefined,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-*",
        search: "?w=800&h=400&fit=crop",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["@tabler/icons-react", "lucide-react"],
  },
};

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: on(globalThis?.process?.env?.ANALYZE_BUNDLE),
});

export default withBundleAnalyzer(nextConfig);
