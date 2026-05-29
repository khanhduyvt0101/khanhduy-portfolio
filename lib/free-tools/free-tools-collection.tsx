import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from "~/components/kibo-ui/announcement";
import { FreeToolsGallery } from "~/lib/free-tools/free-tools-gallery";
import { freeTools } from "~/lib/free-tools/tool-meta";
import { getFreeToolSeo } from "~/lib/free-tools/tool-seo";
import {
  catalogItemsPerPage,
  getCatalogPageCount,
  getCatalogPageHref,
  getCatalogPageItems,
} from "~/lib/site/catalog-pagination";
import { createSeoMetadata, serializeJsonLd, siteUrl } from "~/lib/site/seo";

const freeToolsBasePath = "/free-tools";

const freeToolsKeywords = [
  "free online developer tools",
  "free browser tools",
  "JSON formatter",
  "JWT decoder",
  "QR code generator",
  "image compressor",
  "images to PDF converter",
  "timestamp converter",
  "password generator",
  "CSS gradient generator",
  "color converter",
];

export function getFreeToolsPageCount() {
  return getCatalogPageCount(freeTools);
}

export function getFreeToolsPageItems(pageNumber: number) {
  return getCatalogPageItems(freeTools, pageNumber);
}

export function getFreeToolsPagePath(pageNumber: number) {
  return getCatalogPageHref(freeToolsBasePath, pageNumber) as `/${string}`;
}

export function createFreeToolsCollectionMetadata(pageNumber = 1): Metadata {
  const pageCount = getFreeToolsPageCount();
  const isFirstPage = pageNumber === 1;

  return createSeoMetadata({
    title: isFirstPage
      ? "Free Browser Tools by Khanh Duy"
      : `Free Browser Tools by Khanh Duy - Page ${pageNumber}`,
    description: isFirstPage
      ? "A collection of private browser utilities for developer work, images, PDFs, text cleanup, colors, timestamps, passwords, and quick everyday tasks. No signup required."
      : `Page ${pageNumber} of ${pageCount}: browse free browser tools for developer utilities, image work, PDFs, text cleanup, colors, timestamps, and no-signup workflows.`,
    imageAlt: "Free online browser tools by Khanh Duy",
    keywords: isFirstPage
      ? freeToolsKeywords
      : [
          `free online developer tools page ${pageNumber}`,
          `free browser tools page ${pageNumber}`,
          ...freeToolsKeywords,
        ],
    path: getFreeToolsPagePath(pageNumber),
  });
}

export function createFreeToolsCollectionJsonLd(pageNumber = 1) {
  const tools = getFreeToolsPageItems(pageNumber);
  const pageOffset = (pageNumber - 1) * catalogItemsPerPage;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name:
      pageNumber === 1
        ? "Free Browser Tools by Khanh Duy"
        : `Free Browser Tools by Khanh Duy - Page ${pageNumber}`,
    description: createFreeToolsCollectionMetadata(pageNumber).description,
    url: `${siteUrl}${getFreeToolsPagePath(pageNumber)}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: tools.map((tool, index) => {
        const seo = getFreeToolSeo(tool);

        return {
          "@type": "ListItem",
          position: pageOffset + index + 1,
          name: seo.title,
          url: `${siteUrl}/free-tools/${tool.slug}`,
        };
      }),
    },
  };
}

export function FreeToolsCollectionPage({
  pageNumber = 1,
}: {
  pageNumber?: number;
}): ReactNode {
  const pageCount = getFreeToolsPageCount();
  const tools = getFreeToolsPageItems(pageNumber);

  return (
    <div className="bg-background">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from static free-tool catalog data and escapes tag starts.
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(createFreeToolsCollectionJsonLd(pageNumber)),
        }}
      />
      <section className="border-b bg-muted/30">
        <div className="container mx-auto flex max-w-5xl flex-col gap-8 px-4 py-14 md:py-20">
          <Announcement themed className="w-fit">
            <AnnouncementTag>Workbench</AnnouncementTag>
            <AnnouncementTitle>Private browser utilities</AnnouncementTitle>
          </Announcement>

          <div className="flex max-w-3xl flex-col gap-4">
            <h1 className="text-4xl font-black leading-tight text-foreground md:text-6xl">
              {pageNumber === 1
                ? "Free browser tools by Khanh Duy."
                : `Free browser tools by Khanh Duy, page ${pageNumber}.`}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              A collection of private browser utilities for developer work,
              images, PDFs, text cleanup, colors, timestamps, passwords, and
              quick everyday tasks. No signup required.
            </p>
            <Link
              className="w-fit text-sm font-semibold text-primary underline-offset-4 hover:underline"
              href="/#workbench"
              transitionTypes={["nav-back"]}
            >
              Back to the workbench
            </Link>
          </div>
        </div>
      </section>

      <FreeToolsGallery
        basePath={freeToolsBasePath}
        currentPage={pageNumber}
        pageCount={pageCount}
        tools={tools}
      />
    </div>
  );
}
