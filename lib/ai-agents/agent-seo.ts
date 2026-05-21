import type { Metadata } from "next";
import { createSeoMetadata, siteName, siteUrl } from "~/lib/site/seo";
import type { AgentBlueprint } from "./agent-catalog";
import { getRuntimeLayer } from "./agent-catalog";

const sharedAgentKeywords = [
  "free browser AI agent",
  "free AI tool",
  "private AI tool",
  "local AI agent",
  "no signup AI tool",
  "AI productivity tool",
  "Hugging Face browser model",
  "Chrome AI tool",
  "Vercel AI SDK",
];

const agentKeywordOverrides: Record<string, string[]> = {
  "pantry-meal-planner": [
    "pantry meal planner",
    "grocery list generator",
    "cook from pantry",
    "meal planning AI tool",
    "food waste reduction tool",
    "pantry inventory meal plan",
    "budget grocery planner",
  ],
  "return-warranty": [
    "return window tracker",
    "warranty tracker",
    "receipt organizer",
    "return deadline reminder",
    "warranty claim checklist",
    "purchase receipt AI tool",
    "refund tracker",
  ],
  "subscription-audit": [
    "subscription tracker",
    "recurring bill tracker",
    "subscription audit",
    "cancel subscriptions checklist",
    "renewal reminder tool",
    "personal finance AI tool",
    "local subscription manager",
  ],
  "travel-packing": [
    "travel packing list generator",
    "AI packing list",
    "carry-on packing checklist",
    "trip packing planner",
    "family travel packing list",
    "pre-trip checklist",
    "offline packing list tool",
  ],
};

export function getAgentShortName(agent: AgentBlueprint) {
  return agent.name.replace(/ Agent$/, "");
}

export function getAgentSeo(agent: AgentBlueprint) {
  const shortName = getAgentShortName(agent);
  const runtime = getRuntimeLayer(agent.runtime);
  const path = `/ai-agents/${agent.id}` as const;
  const description = trimDescription(
    `${agent.tagline} Free browser AI agent for ${formatUseCases(agent.useCases.slice(0, 3))}.`,
  );

  return {
    description,
    imageAlt: `${shortName} free browser AI agent by ${siteName}`,
    keywords: [
      `${shortName} AI agent`,
      `free ${shortName.toLowerCase()} AI agent`,
      `${shortName} browser AI tool`,
      `${shortName} free AI tool`,
      `${runtime.name}`,
      ...agent.outputs.map((output) => `${output} AI tool`),
      ...agent.useCases.map((useCase) => `${useCase} AI agent`),
      ...(agentKeywordOverrides[agent.id] ?? []),
      ...sharedAgentKeywords,
    ],
    path,
    shortName,
    title: `${shortName} AI Agent | Free Browser Tool`,
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

function formatUseCases(useCases: string[]) {
  return useCases.map(lowerFirstLetter).join(", ");
}

function lowerFirstLetter(value: string) {
  return `${value.charAt(0).toLowerCase()}${value.slice(1)}`;
}
