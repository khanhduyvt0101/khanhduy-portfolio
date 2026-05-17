"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export function LocalTime(): ReactNode {
  const [localTime, setLocalTime] = useState("--:--");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    });

    const updateTime = () => setLocalTime(formatter.format(new Date()));
    updateTime();

    const timer = window.setInterval(updateTime, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return <span suppressHydrationWarning>{localTime}</span>;
}
