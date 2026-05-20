import type { Metadata } from "next";
import type { ReactNode } from "react";
import { spotterFuelUrls } from "~/lib/spotterfuel/spotterfuel-content";
import { SpotterFuelSupportPage } from "~/lib/spotterfuel/spotterfuel-pages";

export const metadata: Metadata = {
  title: "SpotterFuel Support",
  description:
    "Support contact information for SpotterFuel app issues, feedback, accessibility problems, and feature requests.",
  alternates: {
    canonical: "/spotterfuel/support",
  },
  openGraph: {
    title: "SpotterFuel Support",
    description:
      "Get help with SpotterFuel app issues, feedback, and feature requests.",
    url: spotterFuelUrls.support,
    type: "website",
  },
};

export default function SpotterFuelSupportRoute(): ReactNode {
  return <SpotterFuelSupportPage />;
}
