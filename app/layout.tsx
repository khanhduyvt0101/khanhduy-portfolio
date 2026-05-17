import "./globals.css";

import { Provider } from "jotai";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import type { PropsWithChildren, ReactNode } from "react";
import { ThemeProvider } from "~/components/theme-provider";
import { Button } from "~/components/ui/button";

import { ColorSchemeControl } from "./color-scheme-control";
import { defaultSeoDescription, siteName, siteUrl } from "./seo";

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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Khanh Duy | Software Engineer & Product Builder",
    template: `%s | ${siteName}`,
  },
  description: defaultSeoDescription,
  applicationName: siteName,
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  keywords: [
    "Khanh Duy",
    "software engineer",
    "product builder",
    "AI products",
    "developer tools",
    "free browser tools",
  ],
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
    title: "Khanh Duy | Software Engineer & Product Builder",
    description: defaultSeoDescription,
    url: "/",
    siteName,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Khanh Duy | Software Engineer & Product Builder",
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
          <Provider>
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
              <div className="container mx-auto px-4 max-w-5xl">
                <header className="flex h-14 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-xl font-black text-transparent"
                      href="/"
                    >
                      Khanh Duy
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="ghost">
                      <Link href="/free-tools">Free Tools</Link>
                    </Button>
                    <ColorSchemeControl />
                  </div>
                </header>
              </div>
            </div>
            <main className="flex-1">{children}</main>
            <footer className="h-14 flex items-center justify-center border-t mt-auto">
              <div className="container mx-auto px-4 max-w-5xl text-center">
                <span className="text-sm text-muted-foreground">
                  Made by Khanh Duy
                </span>
              </div>
            </footer>
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
