import { createOgImage, ogImageContentType, ogImageSize } from "~/lib/og-image";

export const dynamic = "force-static";

export const alt = "Khanh Duy's 3D desk at night, with his Mac and iPhone apps";
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return createOgImage({
    title: "Khanh Duy",
    description: "Small, calm apps for Mac, iPhone, Apple Watch and Discord.",
    footer: "Indie developer in Ho Chi Minh City",
  });
}
