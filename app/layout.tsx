import "./styles.css";

import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { type PropsWithChildren, type ReactNode, ViewTransition } from "react";
import { AnalyticsChoices } from "~/components/analytics-choices";
import { ThemeProvider } from "~/components/theme-provider";
import { portfolioAnalytics } from "~/lib/analytics-config";

import { defaultSeoDescription, homeTitle, siteName, siteUrl } from "~/lib/seo";

const geist = Geist({
  subsets: ["latin"],
  adjustFontFallback: false,
  display: "swap",
  variable: "--font-geist",
});

export const viewport: Viewport = {
  themeColor: "#1d2430",
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: homeTitle,
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
        className={`${geist.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ViewTransition
            default="page-soft"
            enter="page-forward"
            exit="page-soft"
          >
            <main className="w-full max-w-full flex-1 overflow-x-clip">
              {children}
            </main>
          </ViewTransition>
        </ThemeProvider>
        <AnalyticsChoices config={portfolioAnalytics} />
      </body>
    </html>
  );
}
