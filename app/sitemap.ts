import type { MetadataRoute } from "next";

import { freeTools } from "~/lib/free-tools/tool-meta";
import { siteUrl } from "~/lib/site/seo";

const lastModified = new Date("2026-05-16T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/free-tools`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const toolRoutes = freeTools.map((tool) => ({
    url: `${siteUrl}/free-tools/${tool.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticRoutes, ...toolRoutes];
}
