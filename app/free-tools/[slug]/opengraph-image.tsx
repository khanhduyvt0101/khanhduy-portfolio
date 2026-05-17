import { notFound } from "next/navigation";
import { createOgImage, ogImageContentType, ogImageSize } from "../../og-image";
import { freeTools, getFreeTool } from "../tool-meta";

type ToolOgImageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const alt = "Free browser tool by Khanh Duy";
export const size = ogImageSize;
export const contentType = ogImageContentType;

export function generateStaticParams() {
  return freeTools.map((tool) => ({
    slug: tool.slug,
  }));
}

export default async function Image({ params }: ToolOgImageProps) {
  const { slug } = await params;
  const tool = getFreeTool(slug);

  if (!tool) {
    notFound();
  }

  return createOgImage({
    title: tool.title,
    eyebrow: tool.category,
    description: tool.summary,
    kind: "Free Tool",
  });
}
