import type { Metadata } from "next";
import type { ReactNode } from "react";

import { HeroSection } from "~/components/hero-section";
import {
  createSeoMetadata,
  defaultSeoDescription,
  serializeJsonLd,
  siteKeywords,
  siteName,
  siteUrl,
} from "~/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: siteName,
  description: defaultSeoDescription,
  imageAlt: "Khanh Duy — indie macOS and iOS app developer",
  keywords: siteKeywords,
  path: "/",
});

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      name: siteName,
      alternateName: "Bui Trong Khanh Duy",
      url: siteUrl,
      image: `${siteUrl}/avatar.webp`,
      jobTitle: "Indie App Developer",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Ho Chi Minh City",
        addressCountry: "VN",
      },
      knowsAbout: siteKeywords,
      sameAs: [
        "https://github.com/khanhduyvt0101",
        "https://www.linkedin.com/in/buitrongkhanhduy/",
        "https://x.com/khanhduyvt",
        "https://www.threads.net/@_khanhduy",
        "https://www.instagram.com/_khanhduy",
        "https://www.facebook.com/khanhduyvt0101",
      ],
    },
    {
      "@type": "WebSite",
      name: siteName,
      url: siteUrl,
      description: defaultSeoDescription,
      inLanguage: "en-US",
      publisher: {
        "@type": "Person",
        name: siteName,
      },
    },
    {
      "@type": "ItemList",
      name: "Current apps by Khanh Duy",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "LofiHood",
          url: "https://lofihood.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "SpotterFuel",
          url: "https://spotterfuel.com",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "CampusCue",
          url: "https://campuscue.app",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "WakeArc",
          url: "https://wakearc.com",
        },
        {
          "@type": "ListItem",
          position: 5,
          name: "CafeSignal",
          url: "https://cafesignal.com",
        },
        {
          "@type": "ListItem",
          position: 6,
          name: "Photoday Cleaner",
          url: "https://photoday-cleaner.vercel.app",
        },
        {
          "@type": "ListItem",
          position: 7,
          name: "MoveHalo",
          url: "https://movehalo.vercel.app",
        },
      ],
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
