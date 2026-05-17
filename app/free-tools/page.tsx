import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  createFreeToolsCollectionMetadata,
  FreeToolsCollectionPage,
} from "~/lib/free-tools/free-tools-collection";

export const metadata: Metadata = createFreeToolsCollectionMetadata();

export default function FreeToolsPage(): ReactNode {
  return <FreeToolsCollectionPage />;
}
