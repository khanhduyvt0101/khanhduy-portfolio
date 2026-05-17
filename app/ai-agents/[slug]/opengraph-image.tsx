import { notFound } from "next/navigation";

import {
  agentBlueprints,
  getAgentBlueprint,
  getRuntimeLayer,
} from "~/lib/ai-agents/agent-catalog";
import { getAgentSeo } from "~/lib/ai-agents/agent-seo";
import {
  createOgImage,
  ogImageContentType,
  ogImageSize,
} from "~/lib/site/og-image";

type AgentOgImageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const alt = "Free browser AI agent by Khanh Duy";
export const size = ogImageSize;
export const contentType = ogImageContentType;

export function generateStaticParams() {
  return agentBlueprints.map((agent) => ({
    slug: agent.id,
  }));
}

export default async function Image({ params }: AgentOgImageProps) {
  const { slug } = await params;
  const agent = getAgentBlueprint(slug);

  if (!agent) {
    notFound();
  }

  const seo = getAgentSeo(agent);
  const runtime = getRuntimeLayer(agent.runtime);

  return createOgImage({
    title: `${seo.shortName} Agent`,
    eyebrow: "Free AI Agent",
    description: seo.description,
    kind: `${runtime.shortName} / ${agent.privacy}`,
  });
}
