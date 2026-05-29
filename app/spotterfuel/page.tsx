import type { Metadata } from "next";
import type { ReactNode } from "react";
import { spotterFuelUrls } from "~/lib/spotterfuel/spotterfuel-content";
import { SpotterFuelMarketingPage } from "~/lib/spotterfuel/spotterfuel-pages";

export const metadata: Metadata = {
  title: "SpotterFuel - Exercise Swaps for Crowded Gyms",
  description:
    "SpotterFuel helps iPhone users keep workouts moving by marking blocked equipment and finding same-muscle exercise alternatives.",
  alternates: {
    canonical: "/spotterfuel",
  },
  openGraph: {
    title: "SpotterFuel - Exercise Swaps for Crowded Gyms",
    description:
      "Mark blocked gym equipment and get same-muscle exercise reroutes without losing your workout.",
    url: spotterFuelUrls.marketing,
    type: "website",
  },
};

export default function SpotterFuelPage(): ReactNode {
  return <SpotterFuelMarketingPage />;
}
