import { track } from "@vercel/analytics";

type AnalyticsValue = boolean | number | string;
type AnalyticsProperties = Record<string, AnalyticsValue | null | undefined>;
type AnalyticsEventName = "beforeSend" | "event" | "pageview";
type AnalyticsQueueEntry = [string, unknown?];

declare global {
  interface Window {
    va?: (event: AnalyticsEventName, properties?: unknown) => void;
    vaq?: AnalyticsQueueEntry[];
  }
}

function ensureAnalyticsQueue() {
  if (typeof window === "undefined" || window.va) {
    return;
  }

  window.va = (...params) => {
    window.vaq = window.vaq ?? [];
    window.vaq.push(params);
  };
}

export function trackSiteEvent(
  name: string,
  properties: AnalyticsProperties = {},
) {
  const payload = Object.fromEntries(
    Object.entries(properties).filter(
      (entry): entry is [string, AnalyticsValue] =>
        typeof entry[1] === "string" ||
        typeof entry[1] === "number" ||
        typeof entry[1] === "boolean",
    ),
  );

  ensureAnalyticsQueue();
  track(name, payload);
}
