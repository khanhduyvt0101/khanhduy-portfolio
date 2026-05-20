import type { MetadataRoute } from "next";

import { agentBlueprints } from "~/lib/ai-agents/agent-catalog";
import { freeTools } from "~/lib/free-tools/tool-meta";
import {
  getCatalogPageCount,
  getCatalogPageHref,
} from "~/lib/site/catalog-pagination";
import { siteUrl } from "~/lib/site/seo";
import { spotterFuel } from "~/lib/spotterfuel/spotterfuel-content";

const lastModified = new Date("2026-05-20T00:00:00.000Z");

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
    {
      url: `${siteUrl}/ai-agents`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}${spotterFuel.paths.marketing}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}${spotterFuel.paths.support}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}${spotterFuel.paths.privacy}`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}${spotterFuel.paths.terms}`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  const toolRoutes = freeTools.map((tool) => ({
    url: `${siteUrl}/free-tools/${tool.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const agentRoutes = agentBlueprints.map((agent) => ({
    url: `${siteUrl}/ai-agents/${agent.id}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const freeToolsPageRoutes = Array.from(
    { length: getCatalogPageCount(freeTools) - 1 },
    (_, index) => ({
      url: `${siteUrl}${getCatalogPageHref("/free-tools", index + 2)}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  );

  const aiAgentsPageRoutes = Array.from(
    { length: getCatalogPageCount(agentBlueprints) - 1 },
    (_, index) => ({
      url: `${siteUrl}${getCatalogPageHref("/ai-agents", index + 2)}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  );

  return [
    ...staticRoutes,
    ...freeToolsPageRoutes,
    ...aiAgentsPageRoutes,
    ...toolRoutes,
    ...agentRoutes,
  ];
}
