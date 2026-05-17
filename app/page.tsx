import type { ReactNode } from "react";

import { PortfolioCommandCenter } from "~/lib/portfolio/portfolio-command-center";
import {
  defaultSeoDescription,
  serializeJsonLd,
  siteKeywords,
  siteName,
  siteUrl,
} from "~/lib/site/seo";

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
