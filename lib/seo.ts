import type { Metadata } from "next";

export const siteUrl = "https://www.khanhduy.com";
export const siteName = "Khanh Duy";
export const defaultSeoDescription =
  "I'm an indie hacker in Ho Chi Minh City building thoughtful macOS and iOS apps that solve everyday problems with focused, practical experiences.";

type SeoMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}`;
  imageAlt?: string;
};

export function createSeoMetadata({
  title,
  description,
  path,
  imageAlt,
}: SeoMetadataOptions): Metadata {
  const openGraphImagePath =
    path === "/" ? "/opengraph-image" : `${path}/opengraph-image`;
  const twitterImagePath =
    path === "/" ? "/twitter-image" : `${path}/twitter-image`;

  return {
    title,
    description,
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
      type: "profile",
      firstName: "Khanh",
      lastName: "Duy",
      username: "khanhduyvt",
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
      creator: "@khanhduyvt",
      images: [
        {
          url: twitterImagePath,
          alt: imageAlt ?? title,
        },
      ],
    },
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
