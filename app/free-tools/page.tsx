import type { ReactNode } from "react";
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from "~/components/kibo-ui/announcement";
import { FreeToolsGallery } from "~/lib/free-tools/free-tools-gallery";
import { createSeoMetadata } from "~/lib/site/seo";

export const metadata = createSeoMetadata({
  title: "Free Tools",
  description:
    "Free browser tools for QR codes, JSON formatting, images, PDFs, colors, timestamps, passwords, and more.",
  path: "/free-tools",
});

export default function FreeToolsPage(): ReactNode {
  return (
    <div className="bg-background">
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
