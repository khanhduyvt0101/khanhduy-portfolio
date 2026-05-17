import type { Metadata } from "next";

export const siteUrl = "https://www.khanhduy.com";
export const siteName = "Khanh Duy";
export const defaultSeoDescription =
  "Khanh Duy is a software engineer and product builder creating AI products, developer tools, and useful browser utilities.";

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
