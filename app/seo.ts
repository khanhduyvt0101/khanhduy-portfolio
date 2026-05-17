import type { Metadata } from "next";

export const siteUrl = "https://www.khanhduy.com";
export const siteName = "Khanh Duy";
export const defaultSeoDescription =
  "Khanh Duy is a software engineer and product builder creating AI products, developer tools, and useful browser utilities.";

type SeoMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}`;
};

export function createSeoMetadata({
  title,
  description,
  path,
}: SeoMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
