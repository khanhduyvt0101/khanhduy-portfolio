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
import { createSeoMetadata, serializeJsonLd, siteUrl } from "~/lib/site/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Free Browser AI Agents for Email, Files and Data",
  description:
    "Run free browser AI agents for email summaries, file extraction, day planning, data cleaning, prompt building, private summarization, and JSON schema generation.",
  imageAlt: "Free browser AI agents by Khanh Duy",
  keywords: [
    "free browser AI agents",
    "browser AI agents",
    "free AI tools",
    "AI email summarizer",
    "AI day planner",
    "AI data cleaner",
    "AI prompt builder",
    "AI JSON schema generator",
    "private AI summarizer",
    "file to data AI",
    "private AI tools",
    "Hugging Face browser model",
    "Chrome AI tools",
  ],
  path: "/ai-agents",
});

const aiAgentsJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Free Browser AI Agents",
  description: metadata.description,
  url: `${siteUrl}/ai-agents`,
  mainEntity: {
    "@type": "ItemList",
    itemListElement: agentBlueprints.map((agent, index) => {
      const seo = getAgentSeo(agent);

      return {
        "@type": "ListItem",
        position: index + 1,
        name: `${seo.shortName} AI Agent`,
        url: `${siteUrl}${seo.path}`,
      };
    }),
  },
};

export default function AiAgentsPage(): ReactNode {
  return (
    <div className="bg-background">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from static agent catalog data and escapes tag starts.
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(aiAgentsJsonLd),
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
              Free AI agents you can use directly in the browser.
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Paste text, upload supported files, and get summaries, cleaned
              tables, JSON, schemas, reply drafts, and reusable prompts. Browser
              AI runs when available; Hugging Face models run through Vercel AI
              SDK when supported; a deterministic fallback keeps the agents
              working.
            </p>
          </div>
        </div>
      </section>

      <AiAgentMarketplace />
    </div>
  );
}
