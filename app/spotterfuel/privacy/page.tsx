import type { Metadata } from "next";
import type { ReactNode } from "react";
import { spotterFuelUrls } from "~/lib/spotterfuel/spotterfuel-content";
import { SpotterFuelPrivacyPage } from "~/lib/spotterfuel/spotterfuel-pages";

export const metadata: Metadata = {
  title: "SpotterFuel Privacy Policy",
  description:
    "Privacy policy for SpotterFuel: no account, no ads, no HealthKit, no third-party tracking, and no data collected from the iOS app.",
  alternates: {
    canonical: "/spotterfuel/privacy",
  },
  openGraph: {
    title: "SpotterFuel Privacy Policy",
    description: "SpotterFuel does not collect personal data from the iOS app.",
    url: spotterFuelUrls.privacy,
    type: "website",
  },
};

export default function SpotterFuelPrivacyRoute(): ReactNode {
  return <SpotterFuelPrivacyPage />;
}
