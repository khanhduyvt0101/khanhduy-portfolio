import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Header from "@/components/header";
import BackToTop from "@/components/back-to-top";

const montserrat = Montserrat({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "KhanhDuy | Personal",
  authors: [{ name: "Khanh Duy", url: "https://github.com/khanhduyvt0101" }],
  description: "Khanh Duy's personal portfolio website",
  openGraph: {
    title: "Khanh Duy | Personal",
    description: "Khanh Duy's personal portfolio website",
    url: process.env.METADATA_BASE,
    images: [
      {
        url: `${process.env.METADATA_BASE}/avatar.png`,
        alt: "Khanh Duy | Personal",
        width: 600,
        height: 600,
      },
    ],
  },
  alternates: {
    canonical: process.env.METADATA_BASE,
  },
};

export default function RootLayout({
  children,
  pageMetadata,
}: {
  children: React.ReactNode;
  pageMetadata: Metadata;
}) {
  const meta = { ...metadata, ...pageMetadata };
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <Header />
        <main className="container lg:px-28">{children}</main>
        <BackToTop />
      </body>
    </html>
  );
}
