import type { Metadata } from "next";
import type { ReactNode } from "react";

import { HeroSection } from "~/components/hero-section";
import {
  appLinks,
  profileSameAs,
  profileTopics,
  profileUpdatedAt,
} from "~/lib/profile";
import {
  createSeoMetadata,
  defaultSeoDescription,
  serializeJsonLd,
  siteName,
  siteUrl,
} from "~/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: siteName,
  description: defaultSeoDescription,
  imageAlt: "Khanh Duy — indie macOS and iOS app developer",
  path: "/",
});

const profilePageId = `${siteUrl}/#profile`;
const personId = `${siteUrl}/#person`;
const websiteId = `${siteUrl}/#website`;

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfilePage",
      "@id": profilePageId,
      url: siteUrl,
      name: siteName,
      description: defaultSeoDescription,
      dateModified: profileUpdatedAt,
      mainEntity: { "@id": personId },
      isPartOf: { "@id": websiteId },
    },
    {
      "@type": "Person",
      "@id": personId,
      name: siteName,
      alternateName: "Bui Trong Khanh Duy",
      url: siteUrl,
      description: defaultSeoDescription,
      image: {
        "@type": "ImageObject",
        url: `${siteUrl}/avatar.webp`,
        contentUrl: `${siteUrl}/avatar.webp`,
        width: 1920,
        height: 1920,
        caption: "Portrait of Khanh Duy",
      },
      jobTitle: "Indie App Developer",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Ho Chi Minh City",
        addressCountry: "VN",
      },
      knowsAbout: profileTopics,
      sameAs: profileSameAs,
      mainEntityOfPage: { "@id": profilePageId },
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: siteName,
      url: siteUrl,
      description: defaultSeoDescription,
      inLanguage: "en-US",
      publisher: { "@id": personId },
    },
    {
      "@type": "ItemList",
      name: "Current apps by Khanh Duy",
      itemListElement: appLinks.map(({ href, label }, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: label,
        url: href,
      })),
    },
  ],
};

export default function Page(): ReactNode {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from static profile data and escapes tag starts.
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(homeJsonLd),
        }}
      />
      <HeroSection />
    </>
  );
}
