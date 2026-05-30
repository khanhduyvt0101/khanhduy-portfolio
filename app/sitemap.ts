import type { MetadataRoute } from "next";

import { siteUrl } from "~/lib/site/seo";
import { spotterFuel } from "~/lib/spotterfuel/spotterfuel-content";

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
    {
      url: `${siteUrl}${spotterFuel.paths.marketing}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
