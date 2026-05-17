import { createOgImage, ogImageContentType, ogImageSize } from "./og-image";
import { defaultSeoDescription } from "./seo";

export const alt = "Khanh Duy software engineer and product builder";
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return createOgImage({
    title: "Khanh Duy",
    eyebrow: "Software Engineer",
    description: defaultSeoDescription,
    kind: "Portfolio",
  });
}
