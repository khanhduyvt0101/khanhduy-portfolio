import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from "~/components/kibo-ui/announcement";
import { Pill } from "~/components/kibo-ui/pill";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { freeTools, getFreeTool } from "~/lib/free-tools/tool-meta";
import { ToolWorkbench } from "~/lib/free-tools/tool-workbench";
import { createSeoMetadata } from "~/lib/site/seo";

type ToolPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return freeTools.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({
  params,
}: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getFreeTool(slug);

  if (!tool) {
    return {
      title: "Free Tool Not Found",
    };
  }

  return createSeoMetadata({
    title: `${tool.title} | Free Tools`,
    description: tool.summary,
    path: `/free-tools/${tool.slug}`,
  });
}

export default async function ToolPage({
  params,
}: ToolPageProps): Promise<ReactNode> {
  const { slug } = await params;
  const tool = getFreeTool(slug);

  if (!tool) {
    notFound();
  }

  return (
    <div className="bg-background">
      <section className="border-b bg-muted/30">
        <div className="container mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 md:py-14">
          <div>
            <Button asChild size="sm" variant="ghost">
              <Link href="/free-tools">
                <ArrowLeftIcon data-icon="inline-start" />
                Free Tools
              </Link>
            </Button>
          </div>

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex max-w-3xl flex-col gap-4">
              <Announcement themed className="w-fit">
                <AnnouncementTag>{tool.category}</AnnouncementTag>
                <AnnouncementTitle>Free browser tool</AnnouncementTitle>
              </Announcement>
              <div className="flex flex-col gap-3">
                <h1 className="text-4xl font-black leading-tight text-foreground md:text-6xl">
                  {tool.title}
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  {tool.summary}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Pill variant="outline">No signup</Pill>
              <Pill variant="outline">Responsive</Pill>
              <Pill variant="outline">Client-first</Pill>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
        <Card className="rounded-lg">
          <CardContent className="p-4 md:p-6">
            <ToolWorkbench tool={tool} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
