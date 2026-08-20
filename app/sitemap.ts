import type { MetadataRoute } from "next";

import { profileUpdatedAt } from "~/lib/profile";
import { siteUrl } from "~/lib/seo";

const lastModified = new Date(profileUpdatedAt);

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
      images: [`${siteUrl}/avatar.webp`],
    },
  ];
}
