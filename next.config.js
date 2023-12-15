/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  env: {
    METADATA_BASE: "https://www.khanhduy.site",
  },
};

module.exports = nextConfig;
