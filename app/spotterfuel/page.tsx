import type { Metadata } from "next";
import type { ReactNode } from "react";
import { spotterFuelUrls } from "~/lib/spotterfuel/spotterfuel-content";
import { SpotterFuelMarketingPage } from "~/lib/spotterfuel/spotterfuel-pages";

export const metadata: Metadata = {
  title: "SpotterFuel",
  description:
    "SpotterFuel is a no-login iPhone and iPad fitness app for same-muscle exercise swaps when gym equipment is taken.",
  alternates: {
    canonical: "/spotterfuel",
  },
  openGraph: {
    title: "SpotterFuel",
    description:
      "A calm fitness companion for same-muscle exercise swaps in a busy gym.",
    url: spotterFuelUrls.marketing,
    type: "website",
  },
};

export default function SpotterFuelPage(): ReactNode {
  return <SpotterFuelMarketingPage />;
}
