import type { MetadataRoute } from "next";

import { siteUrl } from "~/lib/seo";

const lastModified = new Date("2026-05-30T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
      images: [`${siteUrl}/opengraph-image`],
    },
  ];
}
