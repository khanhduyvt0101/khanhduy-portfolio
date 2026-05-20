import type { Metadata } from "next";
import type { ReactNode } from "react";
import { spotterFuelUrls } from "~/lib/spotterfuel/spotterfuel-content";
import { SpotterFuelTermsPage } from "~/lib/spotterfuel/spotterfuel-pages";

export const metadata: Metadata = {
  title: "SpotterFuel Terms of Use",
  description:
    "Terms of use for SpotterFuel, a general fitness planning and education app for iPhone and iPad.",
  alternates: {
    canonical: "/spotterfuel/terms",
  },
  openGraph: {
    title: "SpotterFuel Terms of Use",
    description:
      "Simple terms for using SpotterFuel as a general fitness planning app.",
    url: spotterFuelUrls.terms,
    type: "website",
  },
};

export default function SpotterFuelTermsRoute(): ReactNode {
  return <SpotterFuelTermsPage />;
}
