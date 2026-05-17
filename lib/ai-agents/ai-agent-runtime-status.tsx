"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { agentBlueprints } from "./agent-catalog";
import {
  getHuggingFaceAiSdkAvailability,
  type HuggingFaceModelWarmupProgress,
  preloadHuggingFaceAgentModels,
} from "./huggingface-ai-sdk-runtime";

type BrowserCapability = {
  id: string;
  label: string;
  available: boolean;
  detail: string;
  state: "fallback" | "ready" | "standard";
};

type RuntimeStatusState = "checking" | BrowserCapability["state"];

type RuntimeStatusItem = Omit<BrowserCapability, "state"> & {
  state: RuntimeStatusState;
};

export function AgentRuntimeStatus(): ReactNode {
  const [capabilities, setCapabilities] = useState<BrowserCapability[]>([
    {
      id: "webgpu",
      label: "WebGPU",
      available: false,
      detail: "Optional",
      state: "fallback",
    },
    {
      id: "hf-ai-sdk",
      label: "HF model",
      available: false,
      detail: "Checking",
      state: "standard",
    },
    {
      id: "files",
      label: "File upload",
      available: true,
      detail: "Ready",
      state: "ready",
    },
  ]);
  const [modelWarmup, setModelWarmup] =
    useState<HuggingFaceModelWarmupProgress>({
      completed: 0,
      detail: "Waiting to prepare browser models.",
      status: "checking",
      total: 0,
    });

  useEffect(() => {
    const globalScope = globalThis as {
      showOpenFilePicker?: unknown;
    };
    const nav = navigator as Navigator & { gpu?: unknown };

    void Promise.all([
      import("@browser-ai/core"),
      getHuggingFaceAiSdkAvailability(),
    ]).then(([browserAiCore, huggingFaceStatus]) => {
      const browserAiReady = browserAiCore.doesBrowserSupportBrowserAI();

      setCapabilities([
        ...(browserAiReady
          ? [
              {
                id: "browser-ai",
                label: "Browser AI",
                available: true,
                detail: "Ready",
                state: "ready" as const,
              },
            ]
          : []),
        {
          id: "webgpu",
          label: "WebGPU",
          available: Boolean(nav.gpu),
          detail: nav.gpu ? "Ready" : "WASM fallback",
          state: nav.gpu ? "ready" : "fallback",
        },
        {
          id: "hf-ai-sdk",
          label: "HF model",
          available:
            huggingFaceStatus === "available" ||
            huggingFaceStatus === "downloadable",
          detail:
            huggingFaceStatus === "available"
              ? "Ready"
              : huggingFaceStatus === "downloadable"
                ? "Download ready"
                : "Unavailable",
          state:
            huggingFaceStatus === "available" ||
            huggingFaceStatus === "downloadable"
              ? "ready"
              : "fallback",
        },
        {
          id: "files",
          label: "File upload",
          available: true,
          detail: globalScope.showOpenFilePicker ? "Ready" : "Standard",
          state: globalScope.showOpenFilePicker ? "ready" : "standard",
        },
      ]);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    void preloadHuggingFaceAgentModels({
      agentIds: agentBlueprints.map((agent) => agent.id),
      onProgress: (progress) => {
        if (!cancelled) {
          setModelWarmup(progress);
        }
      },
    }).then((result) => {
      if (cancelled) {
        return;
      }

      setModelWarmup({
        completed: result.loaded,
        detail:
          result.loaded > 0
            ? `${result.loaded} browser model${result.loaded === 1 ? "" : "s"} cached for repeat runs.`
            : "Browser model warmup is unavailable; local fallback is ready.",
        status: result.loaded > 0 ? "ready" : "unsupported",
        total: result.total,
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <RuntimeStatusDropdown capabilities={capabilities} progress={modelWarmup} />
  );
}

function RuntimeStatusDropdown({
  capabilities,
  progress,
}: {
  capabilities: BrowserCapability[];
  progress: HuggingFaceModelWarmupProgress;
}): ReactNode {
  const modelCache = getModelWarmupStatus(progress);
  const rows: RuntimeStatusItem[] = [...capabilities, modelCache];
  const readyCount = rows.filter((row) => row.state === "ready").length;
  const isChecking = rows.some((row) => row.state === "checking");
  const hasRuntimeReady = rows.some((row) => row.state === "ready");
  const summaryState: RuntimeStatusState = isChecking
    ? "checking"
    : hasRuntimeReady
      ? "ready"
      : "fallback";
  const summaryLabel = isChecking
    ? "Preparing runtime"
    : hasRuntimeReady
      ? "Runtime ready"
      : "Fallback ready";
  const summaryDetail = isChecking
    ? modelCache.detail
    : `${readyCount}/${rows.length} checks ready`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex max-w-full items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm shadow-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            summaryState === "ready" && "border-green-500/25 bg-green-500/5",
            summaryState === "checking" &&
              "border-orange-500/25 bg-orange-500/5",
          )}
          type="button"
        >
          <RuntimeDot state={summaryState} />
          <span className="truncate font-medium">{summaryLabel}</span>
          <span className="hidden truncate text-muted-foreground sm:inline">
            {summaryDetail}
          </span>
          <ChevronDown aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(92vw,24rem)] p-2">
        <DropdownMenuLabel className="px-2 py-1">
          <span className="block font-semibold">Runtime status</span>
          <span className="mt-1 block font-normal text-muted-foreground text-xs">
            Browser features and model cache for repeat agent runs.
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid gap-1 p-1">
          {rows.map((row) => (
            <RuntimeStatusRow
              detail={row.detail}
              key={row.id}
              label={row.label}
              state={row.state}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getModelWarmupStatus(
  progress: HuggingFaceModelWarmupProgress,
): RuntimeStatusItem {
  const isBusy =
    progress.status === "checking" || progress.status === "downloading";
  const percent =
    progress.status === "downloading" && typeof progress.progress === "number"
      ? progress.progress
      : progress.total > 0
        ? Math.round((progress.completed / progress.total) * 100)
        : 0;

  const label = isBusy ? "HF models" : "Model cache";
  const detail = isBusy
    ? `${progress.currentModel ? `${progress.currentModel}: ` : ""}${progress.detail}`
    : progress.status === "ready"
      ? "Ready for repeat runs"
      : "No browser model cached";

  return {
    available: progress.status === "ready",
    detail:
      isBusy && progress.total > 0
        ? `${detail} · ${progress.completed}/${progress.total}${progress.status === "downloading" ? ` · ${percent}%` : ""}`
        : detail,
    id: "model-cache",
    label,
    state: isBusy
      ? "checking"
      : progress.status === "ready"
        ? "ready"
        : "fallback",
  };
}

function RuntimeStatusRow({
  detail,
  label,
  state,
}: {
  detail: string;
  label: string;
  state: RuntimeStatusState;
}): ReactNode {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md px-2 py-2 text-sm">
      <div className="flex min-w-0 items-center gap-2">
        <RuntimeDot state={state} />
        <span className="truncate font-medium">{label}</span>
      </div>
      <span className="shrink-0 text-muted-foreground text-xs leading-5">
        {detail}
      </span>
    </div>
  );
}

function RuntimeDot({ state }: { state: RuntimeStatusState }): ReactNode {
  return (
    <span
      className={cn(
        "size-2.5 shrink-0 rounded-full",
        state === "ready" && "bg-green-600 dark:bg-green-400",
        state === "checking" && "bg-orange-500",
        state === "fallback" && "bg-muted-foreground",
        state === "standard" && "bg-muted-foreground/70",
      )}
    />
  );
}
