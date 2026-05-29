"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

const LazyHeroPetPlayground = dynamic(
  () =>
    import("~/lib/portfolio/hero-pet-playground").then(
      (module) => module.HeroPetPlayground,
    ),
  { ssr: false },
);

const heroPetMediaQuery = "(min-width: 640px)";

function scheduleAfterFirstPaint(callback: () => void) {
  const browserWindow = window as Window &
    typeof globalThis & {
      cancelIdleCallback?: (handle: number) => void;
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions,
      ) => number;
    };

  let cancelIdleWork: (() => void) | undefined;
  let delayId: number | undefined;
  const scheduleIdleWork = () => {
    if (browserWindow.requestIdleCallback) {
      const idleId = browserWindow.requestIdleCallback(callback, {
        timeout: 2800,
      });
      cancelIdleWork = () => browserWindow.cancelIdleCallback?.(idleId);
      return;
    }

    const timeoutId = browserWindow.setTimeout(callback, 1600);
    cancelIdleWork = () => browserWindow.clearTimeout(timeoutId);
  };
  const scheduleDelayedIdleWork = () => {
    delayId = browserWindow.setTimeout(scheduleIdleWork, 1800);
  };

  if (document.readyState !== "complete") {
    browserWindow.addEventListener("load", scheduleDelayedIdleWork, {
      once: true,
    });
    return () => {
      browserWindow.removeEventListener("load", scheduleDelayedIdleWork);
      if (delayId !== undefined) {
        browserWindow.clearTimeout(delayId);
      }
      cancelIdleWork?.();
    };
  }

  scheduleDelayedIdleWork();
  return () => {
    if (delayId !== undefined) {
      browserWindow.clearTimeout(delayId);
    }
    cancelIdleWork?.();
  };
}

export function HeroPetPlaygroundLoader(): ReactNode {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(heroPetMediaQuery);
    let cancelScheduledLoad: (() => void) | undefined;

    const syncPetVisibility = () => {
      cancelScheduledLoad?.();
      cancelScheduledLoad = undefined;

      if (!mediaQuery.matches) {
        setReady(false);
        return;
      }

      cancelScheduledLoad = scheduleAfterFirstPaint(() => setReady(true));
    };

    syncPetVisibility();
    mediaQuery.addEventListener("change", syncPetVisibility);

    return () => {
      cancelScheduledLoad?.();
      mediaQuery.removeEventListener("change", syncPetVisibility);
    };
  }, []);

  return ready ? <LazyHeroPetPlayground /> : null;
}
