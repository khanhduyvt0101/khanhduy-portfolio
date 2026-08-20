import { createOgImage, ogImageContentType, ogImageSize } from "~/lib/og-image";
import { defaultSeoDescription } from "~/lib/seo";

export const alt = "Khanh Duy — indie macOS and iOS app developer";
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return createOgImage({
    title: "Khanh Duy",
    eyebrow: "Indie Hacker",
    description: defaultSeoDescription,
    kind: "Thoughtful macOS and iOS apps",
  });
}
