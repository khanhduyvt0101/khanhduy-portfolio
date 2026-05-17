import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  agentBlueprints,
  getAgentBlueprint,
} from "~/lib/ai-agents/agent-catalog";
import {
  createAgentJsonLd,
  createAgentMetadata,
  serializeJsonLd,
} from "~/lib/ai-agents/agent-seo";
import { AgentWorkbench } from "~/lib/ai-agents/agent-workbench";
import { createSeoMetadata } from "~/lib/site/seo";

type AgentPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return agentBlueprints.map((agent) => ({
    slug: agent.id,
  }));
}

export async function generateMetadata({
  params,
}: AgentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const agent = getAgentBlueprint(slug);

  if (!agent) {
    return createSeoMetadata({
      title: "Free Browser AI Agent",
      description:
        "Run free browser-first AI agents for summaries, file extraction, data cleaning, prompt building, and structured JSON schema work.",
      path: "/ai-agents",
    });
  }

  return createAgentMetadata(agent);
}

export default async function AgentPage({
  params,
}: AgentPageProps): Promise<ReactNode> {
  const { slug } = await params;
  const agent = getAgentBlueprint(slug);

  if (!agent) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from static agent data and escapes tag starts.
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(createAgentJsonLd(agent)),
        }}
      />
      <AgentWorkbench agent={agent} />
    </>
  );
}
