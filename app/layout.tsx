import { type Metadata } from "next";

import { Layout } from "@/components/Layout";

import "./globals.css";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: "Khanh Duy",
  description: "Portfolio of Khanh Duy",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex h-full bg-zinc-50 dark:bg-black">
        <Providers>
          <div className="flex w-full">
            <Layout>{children}</Layout>
          </div>
        </Providers>
      </body>
    </html>
  );
}
