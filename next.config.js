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
  devIndicators: false,
  experimental: {
    viewTransition: true,
  },
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
      {
        protocol: "https",
        hostname: "lofihood.com",
        pathname: "/opengraph-image.png",
      },
      {
        protocol: "https",
        hostname: "spotterfuel.com",
        pathname: "/opengraph-image",
      },
      {
        protocol: "https",
        hostname: "campuscue.app",
        pathname: "/opengraph-image",
      },
    ],
  },
};

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: on(globalThis?.process?.env?.ANALYZE_BUNDLE),
});

export default withBundleAnalyzer(nextConfig);
