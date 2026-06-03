import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { type PropsWithChildren, type ReactNode, ViewTransition } from "react";
import { ThemeProvider } from "~/lib/components/theme-provider";

import { ColorSchemeControl } from "~/lib/site/color-scheme-control";
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
      "Khanh Duy | Product Builder for LofiHood, SpotterFuel, CampusCue, WakeArc & CafeSignal",
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
  icons: {
    icon: [
      { url: "/brand/kd-signature-icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
  openGraph: {
    title:
      "Khanh Duy | Product Builder for LofiHood, SpotterFuel, CampusCue, WakeArc & CafeSignal",
    description: defaultSeoDescription,
    url: "/",
    siteName,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Khanh Duy | Product Builder for LofiHood, SpotterFuel, CampusCue, WakeArc & CafeSignal",
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
      { label: "WakeArc", href: "https://wakearc.com", external: true },
      { label: "CafeSignal", href: "https://cafesignal.com", external: true },
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
    <html
      suppressHydrationWarning
      className="scroll-pt-28 md:scroll-pt-24"
      dir="ltr"
      lang="en-US"
    >
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
                    aria-label="Khanh Duy home"
                    className="flex h-11 w-[82px] shrink-0 items-center text-foreground transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 md:w-24"
                    href="/"
                    transitionTypes={["nav-forward"]}
                  >
                    <KdSignatureLogo />
                  </Link>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <ColorSchemeControl />
                </div>
              </header>
            </div>
          </div>
          <ViewTransition
            default="page-soft"
            enter="page-forward"
            exit="page-soft"
          >
            <main className="flex-1">{children}</main>
          </ViewTransition>
          <footer className="mt-auto border-t">
            <div className="container mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_repeat(2,minmax(0,1fr))]">
              <div>
                <p className="text-sm font-bold text-foreground">Khanh Duy</p>
                <p className="mt-3 max-w-sm text-muted-foreground text-sm leading-6">
                  Product builder in Ho Chi Minh City shipping practical apps
                  for focus, fitness, family logistics, sleep, and public Wi-Fi.
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

function KdSignatureLogo(): ReactNode {
  return (
    <svg
      aria-hidden="true"
      className="h-auto w-full"
      fill="none"
      viewBox="0 0 176 56"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.5 43.5c3.6-12.9 8.8-24 17-31.1M29.5 32.6c13.5-14.5 27.3-22 34-15.7 6.2 5.9-10.2 15.4-33.1 18.8 12.9.4 23.3 4.9 31.4 12.5M77.5 46.2c4.9-13.7 10.4-25 18.1-33.7m-5.1 10.7c17.5-11.1 41.3-8.7 49.5 5.8 9.9 17.4-13.8 29-38.2 21.4-13.3-4.1-17.3-14.9-8.3-20.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5.6"
      />
      <path
        d="M138.7 33.3c9.4-.8 17.8-4.5 25-10.9"
        stroke="#14b8a6"
        strokeLinecap="round"
        strokeWidth="5.6"
      />
    </svg>
  );
}
