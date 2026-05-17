import type { Metadata } from "next";
import { createSeoMetadata, siteName, siteUrl } from "~/lib/site/seo";
import type { AgentBlueprint } from "./agent-catalog";
import { getRuntimeLayer } from "./agent-catalog";

const sharedAgentKeywords = [
  "free AI agent",
  "browser AI agent",
  "private AI tool",
  "Hugging Face browser model",
  "Browser AI",
  "Vercel AI SDK",
];

export function getAgentShortName(agent: AgentBlueprint) {
  return agent.name.replace(/ Agent$/, "");
}

export function getAgentSeo(agent: AgentBlueprint) {
  const shortName = getAgentShortName(agent);
  const runtime = getRuntimeLayer(agent.runtime);
  const path = `/ai-agents/${agent.id}` as const;
  const description = trimDescription(
    `${agent.tagline} Run this free ${shortName.toLowerCase()} AI agent in your browser for ${agent.outputs
      .slice(0, 3)
      .join(", ")} output.`,
  );

  return {
    description,
    imageAlt: `${shortName} free browser AI agent by ${siteName}`,
    keywords: [
      `${shortName} AI agent`,
      `${shortName} browser AI`,
      `${shortName} free AI tool`,
      `${runtime.name}`,
      ...agent.useCases.map((useCase) => `${useCase} AI agent`),
      ...sharedAgentKeywords,
    ],
    path,
    shortName,
    title: `${shortName} | Free Browser AI Agent`,
  };
}

export function createAgentMetadata(agent: AgentBlueprint): Metadata {
  const seo = getAgentSeo(agent);

  return createSeoMetadata({
    title: seo.title,
    description: seo.description,
    imageAlt: seo.imageAlt,
    keywords: seo.keywords,
    path: seo.path,
  });
}

export function createAgentJsonLd(agent: AgentBlueprint) {
  const seo = getAgentSeo(agent);
  const runtime = getRuntimeLayer(agent.runtime);
  const url = `${siteUrl}${seo.path}`;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${seo.shortName} AI Agent`,
    applicationCategory: "ProductivityApplication",
    applicationSubCategory: "AI agent",
    browserRequirements: "Modern web browser",
    creator: {
      "@type": "Person",
      name: siteName,
      url: siteUrl,
    },
    description: seo.description,
    featureList: [
      ...agent.useCases,
      `${runtime.name} runtime`,
      `${agent.privacy} processing`,
      `${agent.inputs.join(", ")} input`,
      `${agent.outputs.join(", ")} output`,
    ],
    isAccessibleForFree: true,
    keywords: seo.keywords.join(", "),
    nameAlternate: agent.name,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: "0",
      priceCurrency: "USD",
    },
    operatingSystem: "Web browser",
    url,
  };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function trimDescription(description: string) {
  if (description.length <= 156) {
    return description;
  }

  return `${description.slice(0, 153).trimEnd()}...`;
}
