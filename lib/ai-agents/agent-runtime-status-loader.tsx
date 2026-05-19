"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

const LazyAgentRuntimeStatus = dynamic(
  () =>
    import("~/lib/ai-agents/ai-agent-runtime-status").then(
      (module) => module.AgentRuntimeStatus,
    ),
  {
    loading: () => <AgentRuntimeStatusPlaceholder />,
    ssr: false,
  },
);

function scheduleRuntimeStatusLoad(callback: () => void) {
  const browserWindow = window as Window &
    typeof globalThis & {
      cancelIdleCallback?: (handle: number) => void;
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions,
      ) => number;
    };

  if (browserWindow.requestIdleCallback) {
    const idleId = browserWindow.requestIdleCallback(callback, {
      timeout: 2600,
    });
    return () => browserWindow.cancelIdleCallback?.(idleId);
  }

  const timeoutId = browserWindow.setTimeout(callback, 1800);
  return () => browserWindow.clearTimeout(timeoutId);
}

export function AgentRuntimeStatusLoader(): ReactNode {
  const [ready, setReady] = useState(false);

  useEffect(() => scheduleRuntimeStatusLoad(() => setReady(true)), []);

  return ready ? <LazyAgentRuntimeStatus /> : <AgentRuntimeStatusPlaceholder />;
}

function AgentRuntimeStatusPlaceholder(): ReactNode {
  return (
    <button
      aria-label="Runtime status will be checked after the page becomes idle"
      className="inline-flex max-w-full items-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm shadow-xs"
      disabled
      type="button"
    >
      <span className="size-2.5 rounded-full bg-muted-foreground/45" />
      <span className="truncate font-medium">Runtime ready</span>
      <span className="hidden truncate text-muted-foreground sm:inline">
        Checks loading
      </span>
    </button>
  );
}
