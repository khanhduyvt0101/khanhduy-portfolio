import type { Metadata } from "next";
import type { ReactNode } from "react";
import { spotterFuelUrls } from "~/lib/spotterfuel/spotterfuel-content";
import { SpotterFuelTermsPage } from "~/lib/spotterfuel/spotterfuel-pages";

export const metadata: Metadata = {
  title: "SpotterFuel Terms of Use",
  description:
    "Terms of use for SpotterFuel, a general fitness education app with optional one-time SpotterFuel Pro unlock for same-muscle exercise swaps.",
  alternates: {
    canonical: "/spotterfuel/terms",
  },
  openGraph: {
    title: "SpotterFuel Terms of Use",
    description:
      "Terms for using SpotterFuel, including the optional one-time Pro unlock, as a general fitness education app.",
    url: spotterFuelUrls.terms,
    type: "website",
  },
};

export default function SpotterFuelTermsRoute(): ReactNode {
  return <SpotterFuelTermsPage />;
}
