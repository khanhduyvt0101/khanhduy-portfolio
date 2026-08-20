import "./styles.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { type PropsWithChildren, type ReactNode, ViewTransition } from "react";
import { SiteFooter } from "~/components/site-footer";
import { SiteHeader } from "~/components/site-header";
import { ThemeProvider } from "~/components/theme-provider";

import { defaultSeoDescription, siteName, siteUrl } from "~/lib/seo";

const geist = Geist({
  subsets: ["latin"],
  adjustFontFallback: false,
  display: "swap",
  variable: "--font-geist",
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
  title: siteName,
  description: defaultSeoDescription,
  applicationName: siteName,
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
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
    title: siteName,
    description: defaultSeoDescription,
    url: "/",
    siteName,
    type: "profile",
    locale: "en_US",
    firstName: "Khanh",
    lastName: "Duy",
    username: "khanhduyvt",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: defaultSeoDescription,
    creator: "@khanhduyvt",
  },
};

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
          <SiteHeader />
          <ViewTransition
            default="page-soft"
            enter="page-forward"
            exit="page-soft"
          >
            <main className="flex-1">{children}</main>
          </ViewTransition>
          <SiteFooter />
        </ThemeProvider>
        {isVercelRuntime ? <Analytics mode="production" /> : null}
        {isVercelRuntime ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
