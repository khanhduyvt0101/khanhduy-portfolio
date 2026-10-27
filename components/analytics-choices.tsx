"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { type AnalyticsConfig, mountAnalytics } from "../lib/analytics";

export function AnalyticsChoices({ config }: { config: AnalyticsConfig }) {
  const pathname = usePathname();
  const controller = useRef<ReturnType<typeof mountAnalytics> | null>(null);
  useEffect(() => {
    // Keep the analytics bootstrap off the critical path: wait for the page to
    // finish loading, then for an idle moment (at most 4 s later).
    const idle = window.requestIdleCallback;
    let handle = 0;
    const start = () => {
      controller.current = mountAnalytics(window, config);
    };
    const schedule = () => {
      handle = idle(start, { timeout: 4000 });
    };
    if (!idle) start();
    else if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (handle) window.cancelIdleCallback(handle);
      controller.current?.destroy();
      controller.current = null;
    };
  }, [config]);
  useEffect(() => {
    void pathname;
    controller.current?.sync();
  }, [pathname]);
  return null;
}
