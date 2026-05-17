import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  AiAgentsCollectionPage,
  createAiAgentsCollectionMetadata,
} from "~/lib/ai-agents/ai-agents-collection";

export const metadata: Metadata = createAiAgentsCollectionMetadata();

export default function AiAgentsPage(): ReactNode {
  return <AiAgentsCollectionPage />;
}
