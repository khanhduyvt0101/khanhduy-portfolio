import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from "~/components/kibo-ui/announcement";
import { FreeToolsGallery } from "~/lib/free-tools/free-tools-gallery";
import { freeTools } from "~/lib/free-tools/tool-meta";
import { getFreeToolSeo } from "~/lib/free-tools/tool-seo";
import { createSeoMetadata, serializeJsonLd, siteUrl } from "~/lib/site/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Free Online Developer Tools",
  description:
    "Use free browser tools for JSON formatting, JWT decoding, QR codes, image compression, PDFs, colors, timestamps, passwords, and more. No signup.",
  imageAlt: "Free online browser tools by Khanh Duy",
  keywords: [
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
  ],
  path: "/free-tools",
});

const freeToolsJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Free Online Developer Tools",
  description: metadata.description,
  url: `${siteUrl}/free-tools`,
  mainEntity: {
    "@type": "ItemList",
    itemListElement: freeTools.map((tool, index) => {
      const seo = getFreeToolSeo(tool);

      return {
        "@type": "ListItem",
        position: index + 1,
        name: seo.title,
        url: `${siteUrl}/free-tools/${tool.slug}`,
      };
    }),
  },
};

export default function FreeToolsPage(): ReactNode {
  return (
    <div className="bg-background">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from static free-tool catalog data and escapes tag starts.
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(freeToolsJsonLd),
        }}
      />
      <section className="border-b bg-muted/30">
        <div className="container mx-auto flex max-w-5xl flex-col gap-8 px-4 py-14 md:py-20">
          <Announcement themed className="w-fit">
            <AnnouncementTag>Free Tools</AnnouncementTag>
            <AnnouncementTitle>Private browser utilities</AnnouncementTitle>
          </Announcement>

          <div className="flex max-w-3xl flex-col gap-4">
            <h1 className="text-4xl font-black leading-tight text-foreground md:text-6xl">
              Free tools gallery.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Useful browser tools for everyday work. Open a tool, paste your
              content, and get the result without extra setup.
            </p>
          </div>
        </div>
      </section>

      <FreeToolsGallery />
    </div>
  );
}
