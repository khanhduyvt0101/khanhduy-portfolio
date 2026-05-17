import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  createFreeToolsCollectionMetadata,
  FreeToolsCollectionPage,
  getFreeToolsPageCount,
} from "~/lib/free-tools/free-tools-collection";

type FreeToolsPaginatedPageProps = {
  params: Promise<{
    page: string;
  }>;
};

export function generateStaticParams() {
  return Array.from({ length: getFreeToolsPageCount() - 1 }, (_, index) => ({
    page: String(index + 2),
  }));
}

export async function generateMetadata({
  params,
}: FreeToolsPaginatedPageProps): Promise<Metadata> {
  const pageNumber = Number((await params).page);

  if (!isValidPageNumber(pageNumber)) {
    return {
      title: "Free Tools Page Not Found",
    };
  }

  return createFreeToolsCollectionMetadata(pageNumber);
}

export default async function FreeToolsPaginatedPage({
  params,
}: FreeToolsPaginatedPageProps): Promise<ReactNode> {
  const pageNumber = Number((await params).page);

  if (!isValidPageNumber(pageNumber)) {
    notFound();
  }

  return <FreeToolsCollectionPage pageNumber={pageNumber} />;
}

function isValidPageNumber(pageNumber: number) {
  return (
    Number.isInteger(pageNumber) &&
    pageNumber >= 2 &&
    pageNumber <= getFreeToolsPageCount()
  );
}
