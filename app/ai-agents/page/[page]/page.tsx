import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  AiAgentsCollectionPage,
  createAiAgentsCollectionMetadata,
  getAiAgentsPageCount,
} from "~/lib/ai-agents/ai-agents-collection";

type AiAgentsPaginatedPageProps = {
  params: Promise<{
    page: string;
  }>;
};

export function generateStaticParams() {
  return Array.from({ length: getAiAgentsPageCount() - 1 }, (_, index) => ({
    page: String(index + 2),
  }));
}

export async function generateMetadata({
  params,
}: AiAgentsPaginatedPageProps): Promise<Metadata> {
  const pageNumber = Number((await params).page);

  if (!isValidPageNumber(pageNumber)) {
    return {
      title: "AI Agents Page Not Found",
    };
  }

  return createAiAgentsCollectionMetadata(pageNumber);
}

export default async function AiAgentsPaginatedPage({
  params,
}: AiAgentsPaginatedPageProps): Promise<ReactNode> {
  const pageNumber = Number((await params).page);

  if (!isValidPageNumber(pageNumber)) {
    notFound();
  }

  return <AiAgentsCollectionPage pageNumber={pageNumber} />;
}

function isValidPageNumber(pageNumber: number) {
  return (
    Number.isInteger(pageNumber) &&
    pageNumber >= 2 &&
    pageNumber <= getAiAgentsPageCount()
  );
}
