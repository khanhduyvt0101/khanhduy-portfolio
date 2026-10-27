"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { type AnalyticsConfig, mountAnalytics } from "../lib/analytics";

export function AnalyticsChoices({ config }: { config: AnalyticsConfig }) {
  const pathname = usePathname();
  const controller = useRef<ReturnType<typeof mountAnalytics> | null>(null);
  useEffect(() => {
    controller.current = mountAnalytics(window, config);
    return () => {
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
