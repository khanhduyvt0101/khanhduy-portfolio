import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PortfolioCommandCenter } from "~/lib/portfolio/portfolio-command-center";
import {
  createSeoMetadata,
  defaultSeoDescription,
  serializeJsonLd,
  siteKeywords,
  siteName,
  siteUrl,
} from "~/lib/site/seo";

export const metadata: Metadata = createSeoMetadata({
  title:
    "Khanh Duy | Product Builder for LofiHood, SpotterFuel, CampusCue & WakeArc",
  description:
    "Khanh Duy builds LofiHood, SpotterFuel, CampusCue, and WakeArc: focused apps for Mac playback, crowded gyms, school-notice follow-through, and sleep-cycle alarms.",
  imageAlt:
    "Khanh Duy portfolio showing LofiHood, SpotterFuel, CampusCue, and WakeArc",
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
      jobTitle: "Full-stack Developer",
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
      <PortfolioCommandCenter />
    </>
  );
}
