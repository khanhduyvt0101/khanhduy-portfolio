import type { Metadata } from "next";
import type { ReactNode } from "react";
import { spotterFuelUrls } from "~/lib/spotterfuel/spotterfuel-content";
import { SpotterFuelMarketingPage } from "~/lib/spotterfuel/spotterfuel-pages";

export const metadata: Metadata = {
  title: "SpotterFuel",
  description:
    "SpotterFuel is a no-login iPhone and iPad fitness app for workout planning, exercise discovery, nutrition planning, and progress insights.",
  alternates: {
    canonical: "/spotterfuel",
  },
  openGraph: {
    title: "SpotterFuel",
    description:
      "A calm fitness companion for workout planning, nutrition planning, and progress insights.",
    url: spotterFuelUrls.marketing,
    type: "website",
  },
};

export default function SpotterFuelPage(): ReactNode {
  return <SpotterFuelMarketingPage />;
}
