import type { ReactNode } from "react";
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from "~/components/kibo-ui/announcement";

import { AiAgentMarketplace } from "~/lib/ai-agents/ai-agent-marketplace";
import { createSeoMetadata } from "~/lib/site/seo";

export const metadata = createSeoMetadata({
  title: "Free AI Agents",
  description:
    "Free browser-first AI agents for email summaries, file extraction, data cleaning, prompt building, and JSON schema generation.",
  imageAlt: "Free browser AI agents by Khanh Duy",
  keywords: [
    "free AI agents",
    "browser AI agents",
    "AI agent marketplace",
    "private AI tools",
    "Hugging Face browser model",
    "Browser AI",
  ],
  path: "/ai-agents",
});

export default function AiAgentsPage(): ReactNode {
  return (
    <div className="bg-background">
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
