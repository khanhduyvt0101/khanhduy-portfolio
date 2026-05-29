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
    title: "Free Browser AI Agents",
    eyebrow: "Khanh Duy Workbench",
    description:
      "Run agents for summaries, extraction, planning, data cleaning, prompt building, and JSON schema generation.",
    kind: "Workbench",
  });
}
