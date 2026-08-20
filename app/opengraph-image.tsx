import { createOgImage, ogImageContentType, ogImageSize } from "~/lib/og-image";
import { defaultSeoDescription } from "~/lib/seo";

export const alt =
  "Khanh Duy portfolio for LofiHood, SpotterFuel, CampusCue, WakeArc, and CafeSignal";
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return createOgImage({
    title: "Khanh Duy",
    eyebrow: "Product Builder",
    description: defaultSeoDescription,
    kind: "LofiHood / SpotterFuel / CampusCue / WakeArc / CafeSignal",
  });
}
