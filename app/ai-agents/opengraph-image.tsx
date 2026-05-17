import {
  createOgImage,
  ogImageContentType,
  ogImageSize,
} from "~/lib/site/og-image";

export const alt = "Free browser AI agents by Khanh Duy";
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return createOgImage({
    title: "Free AI Agents",
    eyebrow: "Browser AI",
    description:
      "Run useful agents for email summaries, file extraction, data cleanup, prompt building, and JSON schemas.",
    kind: "AI Agent Shelf",
  });
}
