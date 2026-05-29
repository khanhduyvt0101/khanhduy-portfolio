import type { Metadata } from "next";

export const siteUrl = "https://www.khanhduy.com";
export const siteName = "Khanh Duy";
export const defaultSeoDescription =
  "Khanh Duy is a full-stack developer in Ho Chi Minh City building practical apps for focus, fitness, and family logistics, plus free browser tools and AI agents.";

export const siteKeywords = [
  "Khanh Duy",
  "Bui Trong Khanh Duy",
  "full-stack developer Vietnam",
  "software engineer Ho Chi Minh City",
  "LofiHood",
  "SpotterFuel",
  "CampusCue",
  "macOS menu bar app",
  "iPhone fitness app",
  "school notice app",
  "Next.js developer",
  "React TypeScript developer",
  "free browser tools",
  "browser AI agents",
];

type SeoMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}`;
  imageAlt?: string;
  keywords?: string[];
};

export function createSeoMetadata({
  title,
  description,
  path,
  imageAlt,
  keywords,
}: SeoMetadataOptions): Metadata {
  const openGraphImagePath =
    path === "/" ? "/opengraph-image" : `${path}/opengraph-image`;
  const twitterImagePath =
    path === "/" ? "/twitter-image" : `${path}/twitter-image`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: path,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: openGraphImagePath,
          width: 1200,
          height: 630,
          alt: imageAlt ?? title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: twitterImagePath,
          alt: imageAlt ?? title,
        },
      ],
    },
  };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
