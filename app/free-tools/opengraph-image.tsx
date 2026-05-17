import { createOgImage, ogImageContentType, ogImageSize } from "../og-image";

export const alt = "Free tools gallery by Khanh Duy";
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return createOgImage({
    title: "Free Tools Gallery",
    eyebrow: "Browser Utilities",
    description:
      "QR codes, JSON formatting, images, PDFs, colors, timestamps, passwords, and more.",
    kind: "Free Tools",
  });
}
