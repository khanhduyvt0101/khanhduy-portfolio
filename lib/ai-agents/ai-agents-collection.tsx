import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from "~/components/kibo-ui/announcement";
import { agentBlueprints } from "~/lib/ai-agents/agent-catalog";
import { getAgentSeo } from "~/lib/ai-agents/agent-seo";
import { AiAgentMarketplace } from "~/lib/ai-agents/ai-agent-marketplace";
import {
  catalogItemsPerPage,
  getCatalogPageCount,
  getCatalogPageHref,
  getCatalogPageItems,
} from "~/lib/site/catalog-pagination";
import { createSeoMetadata, serializeJsonLd, siteUrl } from "~/lib/site/seo";

const aiAgentsBasePath = "/ai-agents";

const aiAgentKeywords = [
  "free browser AI agents",
  "browser AI agents",
  "free AI tools",
  "AI email summarizer",
  "AI day planner",
  "AI data cleaner",
  "AI prompt builder",
  "AI JSON schema generator",
  "AI document renewal tracker",
  "passport renewal reminder",
  "AI home maintenance planner",
  "home maintenance reminder",
  "private AI summarizer",
  "file to data AI",
  "private AI tools",
  "Hugging Face browser model",
  "Chrome AI tools",
];

export function getAiAgentsPageCount() {
  return getCatalogPageCount(agentBlueprints);
}

export function getAiAgentsPageItems(pageNumber: number) {
  return getCatalogPageItems(agentBlueprints, pageNumber);
}

export function getAiAgentsPagePath(pageNumber: number) {
  return getCatalogPageHref(aiAgentsBasePath, pageNumber) as `/${string}`;
}

export function createAiAgentsCollectionMetadata(pageNumber = 1): Metadata {
  const pageCount = getAiAgentsPageCount();
  const isFirstPage = pageNumber === 1;

  return createSeoMetadata({
    title: isFirstPage
      ? "Free Browser AI Agents for Email, Files and Data"
      : `Free Browser AI Agents - Page ${pageNumber}`,
    description: isFirstPage
      ? "Run free browser AI agents for email summaries, file extraction, day planning, document renewals, home maintenance, data cleaning, prompt building, private summarization, and JSON schema generation."
      : `Page ${pageNumber} of ${pageCount}: browse free browser AI agents for private summaries, structured extraction, data cleanup, prompt building, and browser-first workflows.`,
    imageAlt: "Free browser AI agents by Khanh Duy",
    keywords: isFirstPage
      ? aiAgentKeywords
      : [
          `free browser AI agents page ${pageNumber}`,
          `AI agents page ${pageNumber}`,
          ...aiAgentKeywords,
        ],
    path: getAiAgentsPagePath(pageNumber),
  });
}

export function createAiAgentsCollectionJsonLd(pageNumber = 1) {
  const agents = getAiAgentsPageItems(pageNumber);
  const pageOffset = (pageNumber - 1) * catalogItemsPerPage;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name:
      pageNumber === 1
        ? "Free Browser AI Agents"
        : `Free Browser AI Agents - Page ${pageNumber}`,
    description: createAiAgentsCollectionMetadata(pageNumber).description,
    url: `${siteUrl}${getAiAgentsPagePath(pageNumber)}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: agents.map((agent, index) => {
        const seo = getAgentSeo(agent);

        return {
          "@type": "ListItem",
          position: pageOffset + index + 1,
          url: `${siteUrl}${seo.path}`,
        };
      }),
    },
  };
}

export function AiAgentsCollectionPage({
  pageNumber = 1,
}: {
  pageNumber?: number;
}): ReactNode {
  const pageCount = getAiAgentsPageCount();
  const agents = getAiAgentsPageItems(pageNumber);

  return (
    <div className="bg-background">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from static agent catalog data and escapes tag starts.
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(createAiAgentsCollectionJsonLd(pageNumber)),
        }}
      />
      <section className="border-b bg-muted/30">
        <div className="container mx-auto flex max-w-7xl flex-col gap-8 px-4 py-14 md:py-20">
          <Announcement themed className="w-fit">
            <AnnouncementTag>AI Agents</AnnouncementTag>
            <AnnouncementTitle>Runnable browser agents</AnnouncementTitle>
          </Announcement>

          <div className="flex max-w-4xl flex-col gap-4">
            <h1 className="text-4xl font-black leading-tight text-foreground md:text-6xl">
              {pageNumber === 1
                ? "Free AI agents you can use directly in the browser."
                : `Free AI agents you can use directly in the browser, page ${pageNumber}.`}
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Paste text, upload supported files, and get summaries, cleaned
              tables, JSON, schemas, reply drafts, renewal trackers, home
              maintenance plans, and reusable prompts. Browser AI runs when
              available; Hugging Face models run through Vercel AI SDK when
              supported; a deterministic fallback keeps the agents working.
            </p>
          </div>
        </div>
      </section>

      <AiAgentMarketplace
        agents={agents}
        basePath={aiAgentsBasePath}
        currentPage={pageNumber}
        pageCount={pageCount}
      />
    </div>
  );
}
