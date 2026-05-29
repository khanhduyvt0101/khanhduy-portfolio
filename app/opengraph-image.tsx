import {
  createOgImage,
  ogImageContentType,
  ogImageSize,
} from "~/lib/site/og-image";
import { defaultSeoDescription } from "~/lib/site/seo";

export const alt =
  "Khanh Duy portfolio for LofiHood, SpotterFuel, and CampusCue";
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return createOgImage({
    title: "Khanh Duy",
    eyebrow: "Product Builder",
    description: defaultSeoDescription,
    kind: "LofiHood / SpotterFuel / CampusCue",
  });
}
