import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { type PropsWithChildren, type ReactNode, ViewTransition } from "react";
import { ThemeProvider } from "~/lib/components/theme-provider";
import { PortfolioCommandPalette } from "~/lib/portfolio/portfolio-interactions";

import { ColorSchemeControl } from "~/lib/site/color-scheme-control";
import { HeaderCommandSearch } from "~/lib/site/header-command-search";
import { HeaderNavigation } from "~/lib/site/header-navigation";
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
    default:
      "Khanh Duy | Product Builder for LofiHood, SpotterFuel & CampusCue",
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
    title: "Khanh Duy | Product Builder for LofiHood, SpotterFuel & CampusCue",
    description: defaultSeoDescription,
    url: "/",
    siteName,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Khanh Duy | Product Builder for LofiHood, SpotterFuel & CampusCue",
    description: defaultSeoDescription,
  },
};

const footerGroups = [
  {
    label: "Apps",
    links: [
      { label: "LofiHood", href: "https://lofihood.com", external: true },
      { label: "SpotterFuel", href: "https://spotterfuel.com", external: true },
      { label: "CampusCue", href: "https://campuscue.app", external: true },
    ],
  },
  {
    label: "Workbench",
    links: [
      { label: "AI Agents", href: "/ai-agents" },
      { label: "Free Tools", href: "/free-tools" },
    ],
  },
  {
    label: "Connect",
    links: [
      {
        label: "Email",
        href: "mailto:khanhduyvt0101@gmail.com",
        external: true,
      },
      {
        label: "GitHub",
        href: "https://github.com/khanhduyvt0101",
        external: true,
      },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/buitrongkhanhduy/",
        external: true,
      },
    ],
  },
];

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
                  <HeaderNavigation />
                  <ColorSchemeControl />
                </div>
              </header>
            </div>
          </div>
          <PortfolioCommandPalette />
          <ViewTransition
            default="page-soft"
            enter="page-forward"
            exit="page-soft"
          >
            <main className="flex-1">{children}</main>
          </ViewTransition>
          <footer className="mt-auto border-t">
            <div className="container mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
              <div>
                <p className="text-sm font-bold text-foreground">Khanh Duy</p>
                <p className="mt-3 max-w-sm text-muted-foreground text-sm leading-6">
                  Product builder in Ho Chi Minh City shipping practical apps
                  for focus, fitness, and family logistics.
                </p>
              </div>
              {footerGroups.map((group) => (
                <nav aria-label={group.label} key={group.label}>
                  <h2 className="text-sm font-bold text-foreground">
                    {group.label}
                  </h2>
                  <ul className="mt-3 grid gap-2 text-muted-foreground text-sm">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        {"external" in link && link.external ? (
                          <a
                            className="transition-colors hover:text-foreground"
                            href={link.href}
                            rel={
                              link.href.startsWith("http")
                                ? "noreferrer"
                                : undefined
                            }
                            target={
                              link.href.startsWith("http")
                                ? "_blank"
                                : undefined
                            }
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            className="transition-colors hover:text-foreground"
                            href={link.href}
                            transitionTypes={["nav-forward"]}
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
            <div className="border-t px-4 py-5 text-center text-muted-foreground text-xs">
              Made by Khanh Duy. Ho Chi Minh City, Vietnam.
            </div>
          </footer>
        </ThemeProvider>
        {isVercelRuntime ? <Analytics mode="production" /> : null}
        {isVercelRuntime ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
