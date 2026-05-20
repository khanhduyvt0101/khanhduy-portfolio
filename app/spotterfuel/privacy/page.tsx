import type { Metadata } from "next";
import type { ReactNode } from "react";
import { spotterFuelUrls } from "~/lib/spotterfuel/spotterfuel-content";
import { SpotterFuelPrivacyPage } from "~/lib/spotterfuel/spotterfuel-pages";

export const metadata: Metadata = {
  title: "SpotterFuel Privacy Policy",
  description:
    "Privacy policy for SpotterFuel: no account, no ads, no HealthKit, on-device workout choices, optional Apple-managed Pro purchase, and basic diagnostics for reliability.",
  alternates: {
    canonical: "/spotterfuel/privacy",
  },
  openGraph: {
    title: "SpotterFuel Privacy Policy",
    description:
      "SpotterFuel keeps workout choices on device, uses Apple-managed in-app purchases for Pro, and uses basic diagnostics only for reliability.",
    url: spotterFuelUrls.privacy,
    type: "website",
  },
};

export default function SpotterFuelPrivacyRoute(): ReactNode {
  return <SpotterFuelPrivacyPage />;
}
