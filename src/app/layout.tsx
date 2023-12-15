import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Header from "@/components/header";
import BackToTop from "@/components/back-to-top";

const montserrat = Montserrat({ subsets: ["latin"] });

export default function RootLayout({
  children,
  pageMetadata,
}: {
  children: React.ReactNode;
  pageMetadata: Metadata;
}) {
  return (
    <html lang="en">
      <head>
        <title>Khanh Duy | Personal</title>
        <meta
          name="description"
          content="Khanh Duy's personal portfolio website"
        />

        <meta property="og:url" content="https://www.khanhduy.site/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Khanh Duy | Personal" />
        <meta
          property="og:description"
          content="Khanh Duy's personal portfolio website"
        />
        <meta
          property="og:image"
          content="https://www.khanhduy.site/avatar.png"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="khanhduy.site" />
        <meta property="twitter:url" content="https://www.khanhduy.site/" />
        <meta name="twitter:title" content="Khanh Duy | Personal" />
        <meta
          name="twitter:description"
          content="Khanh Duy's personal portfolio website"
        />
        <meta
          name="twitter:image"
          content="https://www.khanhduy.site/avatar.png"
        />
      </head>
      <body className={montserrat.className}>
        <Header />
        <main className="container lg:px-28">{children}</main>
        <BackToTop />
      </body>
    </html>
  );
}
