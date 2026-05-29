import {
  createOgImage,
  ogImageContentType,
  ogImageSize,
} from "~/lib/site/og-image";

export const alt = "Free tools gallery by Khanh Duy";
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return createOgImage({
    title: "Free Browser Tools",
    eyebrow: "Khanh Duy Workbench",
    description:
      "Private browser utilities for developer work, images, PDFs, text cleanup, colors, timestamps, and everyday tasks.",
    kind: "Workbench",
  });
}
