import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Header from "@/components/header";
import BackToTop from "@/components/back-to-top";
import avatar from "@/assets/photo/squareavatar.jpeg";

const montserrat = Montserrat({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "KhanhDuy | Personal",
  authors: [{ name: "Khanh Duy", url: "https://github.com/khanhduyvt0101" }],
  description: "Khanh Duy's personal portfolio website",
  openGraph: {
    title: "Khanh Duy | Personal",
    description: "Khanh Duy's personal portfolio website",
    url: "https://www.khanhduy.site",
    images: [
      {
        url: avatar.src,
        alt: "Khanh Duy | Personal",
        width: 630,
        height: 800,
      },
    ],
  },
  alternates: {
    canonical: "https://www.khanhduy.site",
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
