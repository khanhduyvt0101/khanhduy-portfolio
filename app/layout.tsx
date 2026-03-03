import "./globals.css";

import { t } from "i18next";
import { Provider } from "jotai";
import { Geist, Geist_Mono } from "next/font/google";
import type { PropsWithChildren, ReactNode } from "react";
import { ThemeProvider } from "~/components/theme-provider";
import { direction } from "~/lib/direction";
import { language } from "~/lib/language";

import { ColorSchemeControl } from "./color-scheme-control";
import { I18nextProvider } from "./i18next-provider";

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

export const metadata = {
  title: t("site.title"),
  description: t("site.description"),
  openGraph: {
    siteName: t("site.title"),
    type: "website",
    locale: language.replace("-", "_"),
  },
};

export default function Layout({ children }: PropsWithChildren): ReactNode {
  return (
    <html suppressHydrationWarning dir={direction} lang={language}>
      <body
        className={`${geist.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <I18nextProvider>
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
                      <span className="text-xl font-black bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                        Khanh Duy
                      </span>
                    </div>
                    <ColorSchemeControl />
                  </header>
                </div>
              </div>
              <main className="flex-1">{children}</main>
              <footer className="h-14 flex items-center justify-center border-t mt-auto">
                <div className="container mx-auto px-4 max-w-5xl text-center">
                  <span className="text-sm text-muted-foreground">
                    {t("footer.madeBy")}
                  </span>
                </div>
              </footer>
            </Provider>
          </ThemeProvider>
        </I18nextProvider>
      </body>
    </html>
  );
}
