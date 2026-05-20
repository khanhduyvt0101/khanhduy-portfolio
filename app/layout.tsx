import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { type PropsWithChildren, type ReactNode, ViewTransition } from "react";
import { ThemeProvider } from "~/lib/components/theme-provider";
import { PortfolioCommandPaletteLoader } from "~/lib/portfolio/portfolio-command-palette-loader";

import { ColorSchemeControl } from "~/lib/site/color-scheme-control";
import { HeaderCommandSearch } from "~/lib/site/header-command-search";
import { HeaderNavigationLoader } from "~/lib/site/header-navigation-loader";
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
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  adjustFontFallback: false,
  display: "swap",
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
          <div className="site-header-transition sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto max-w-7xl px-4">
              <header className="flex h-16 items-center justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <Link
                    className="shrink-0 truncate bg-[linear-gradient(90deg,var(--foreground),var(--muted-foreground))] bg-clip-text text-xl font-black text-transparent"
                    href="/"
                    transitionTypes={["nav-forward"]}
                  >
                    Khanh Duy
                  </Link>
                  <HeaderCommandSearch />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <HeaderNavigationLoader />
                  <ColorSchemeControl />
                </div>
              </header>
            </div>
          </div>
          <PortfolioCommandPaletteLoader />
          <ViewTransition
            default="page-soft"
            enter="page-forward"
            exit="page-soft"
          >
            <main className="flex-1">{children}</main>
          </ViewTransition>
          <footer className="mt-auto border-t">
            <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center md:flex-row md:text-left">
              <span className="text-sm text-muted-foreground">
                Made by Khanh Duy. Software engineer in Ho Chi Minh City,
                Vietnam.
              </span>
              <nav
                aria-label="SpotterFuel legal links"
                className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-muted-foreground text-sm"
              >
                <Link
                  className="transition-colors hover:text-foreground"
                  href="/spotterfuel"
                  transitionTypes={["nav-forward"]}
                >
                  SpotterFuel
                </Link>
                <Link
                  className="transition-colors hover:text-foreground"
                  href="/spotterfuel/support"
                  transitionTypes={["nav-forward"]}
                >
                  Support
                </Link>
                <Link
                  className="transition-colors hover:text-foreground"
                  href="/spotterfuel/privacy"
                  transitionTypes={["nav-forward"]}
                >
                  Privacy
                </Link>
                <Link
                  className="transition-colors hover:text-foreground"
                  href="/spotterfuel/terms"
                  transitionTypes={["nav-forward"]}
                >
                  Terms
                </Link>
              </nav>
            </div>
          </footer>
        </ThemeProvider>
        {isVercelRuntime ? <Analytics mode="production" /> : null}
        {isVercelRuntime ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
