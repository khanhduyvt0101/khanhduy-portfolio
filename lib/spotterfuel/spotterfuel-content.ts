import { siteUrl } from "~/lib/site/seo";

export const spotterFuel = {
  name: "SpotterFuel",
  developer: "Bui Trong Khanh Duy",
  email: "khanhduyvt0101@gmail.com",
  location: "Ho Chi Minh City, Vietnam",
  updatedAt: "May 20, 2026",
  paths: {
    marketing: "/spotterfuel",
    support: "/spotterfuel/support",
    privacy: "/spotterfuel/privacy",
    terms: "/spotterfuel/terms",
  },
} as const;

export const spotterFuelUrls = {
  marketing: `${siteUrl}${spotterFuel.paths.marketing}`,
  support: `${siteUrl}${spotterFuel.paths.support}`,
  privacy: `${siteUrl}${spotterFuel.paths.privacy}`,
  terms: `${siteUrl}${spotterFuel.paths.terms}`,
} as const;
