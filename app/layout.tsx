import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import type { PropsWithChildren, ReactNode } from "react";
import { ThemeProvider } from "~/lib/components/theme-provider";
import { PortfolioCommandPalette } from "~/lib/portfolio/portfolio-interactions";

import { ColorSchemeControl } from "~/lib/site/color-scheme-control";
import {
  HeaderCommandSearch,
  HeaderNavigation,
} from "~/lib/site/header-navigation";
import {
  defaultSeoDescription,
  siteKeywords,
  siteName,
  siteUrl,
} from "~/lib/site/seo";

const geist = Geist({
  subsets: ["latin"],
  adjustFontFallback: false,
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  adjustFontFallback: false,
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist-mono",
});

const isVercelRuntime = process.env.VERCEL === "1";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Khanh Duy | Full-Stack Developer & AI Product Builder",
    template: `%s | ${siteName}`,
  },
  description: defaultSeoDescription,
  applicationName: siteName,
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  keywords: siteKeywords,
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
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
    title: "Khanh Duy | Full-Stack Developer & AI Product Builder",
    description: defaultSeoDescription,
    url: "/",
    siteName,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Khanh Duy | Full-Stack Developer & AI Product Builder",
    description: defaultSeoDescription,
  },
};

export default function Layout({ children }: PropsWithChildren): ReactNode {
  return (
    <html suppressHydrationWarning dir="ltr" lang="en-US">
      <body
        className={`${geist.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto max-w-7xl px-4">
              <header className="flex h-16 items-center justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <Link
                    className="shrink-0 truncate bg-[linear-gradient(90deg,var(--foreground),var(--muted-foreground))] bg-clip-text text-xl font-black text-transparent"
                    href="/"
                  >
                    Khanh Duy
                  </Link>
                  <HeaderCommandSearch />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <HeaderNavigation />
                  <ColorSchemeControl />
                </div>
              </header>
            </div>
          </div>
          <PortfolioCommandPalette />
          <main className="flex-1">{children}</main>
          <footer className="mt-auto flex h-14 items-center justify-center border-t">
            <div className="container mx-auto max-w-7xl px-4 text-center">
              <span className="text-sm text-muted-foreground">
                Made by Khanh Duy. Software engineer in Ho Chi Minh City,
                Vietnam.
              </span>
            </div>
          </footer>
        </ThemeProvider>
        {isVercelRuntime ? <Analytics mode="production" /> : null}
        {isVercelRuntime ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
