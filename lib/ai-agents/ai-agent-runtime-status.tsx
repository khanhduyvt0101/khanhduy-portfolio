"use client";

import { CheckCircle2, ChevronDown, Circle, Loader2 } from "lucide-react";
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
      agentIds: agentBlueprints,
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
  const hasRuntimeReady = rows.some((row) => row.state === "ready");
  const summaryState: RuntimeStatusState = hasRuntimeReady
    ? "ready"
    : "fallback";
  const summaryLabel = hasRuntimeReady ? "Runtime ready" : "Fallback ready";
  const summaryDetail = `${readyCount}/${rows.length} checks ready`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`${summaryLabel}, ${summaryDetail}`}
          className={cn(
            "inline-flex max-w-full items-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm shadow-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            summaryState === "ready" && "border-green-500/25 bg-green-500/5",
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
      <DropdownMenuContent align="end" className="w-[min(92vw,25rem)] p-2">
        <DropdownMenuLabel className="px-2 py-1">
          <span className="block font-semibold">Runtime status</span>
          <span className="mt-1 block font-normal text-muted-foreground text-xs">
            Browser features and model cache for repeat agent runs.
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <RuntimeWarmupPanel progress={progress} />
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

function RuntimeWarmupPanel({
  progress,
}: {
  progress: HuggingFaceModelWarmupProgress;
}): ReactNode {
  if (!isModelWarmupBusy(progress)) {
    return null;
  }

  const percent = getModelWarmupPercent(progress);
  const title =
    progress.status === "downloading"
      ? "Downloading browser model"
      : "Preparing browser model";

  return (
    <>
      <div className="m-1 rounded-lg border border-border/80 bg-muted/30 p-3">
        <div className="flex items-start gap-3">
          <Loader2
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 animate-spin text-orange-500"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-sm">{title}</span>
              <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
                {progress.completed}/{progress.total || 0}
              </span>
            </div>
            <p className="mt-1 text-muted-foreground text-xs leading-5">
              {progress.currentModel
                ? `${progress.currentModel}: ${progress.detail}`
                : progress.detail}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-orange-500 transition-[width] duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      <DropdownMenuSeparator />
    </>
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
    <div className="flex items-start gap-3 rounded-md px-2 py-2 text-sm">
      <RuntimeStatusIcon state={state} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{label}</div>
        <div className="mt-0.5 text-muted-foreground text-xs leading-5">
          {detail}
        </div>
      </div>
    </div>
  );
}

function RuntimeStatusIcon({
  state,
}: {
  state: RuntimeStatusState;
}): ReactNode {
  if (state === "ready") {
    return (
      <CheckCircle2
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400"
      />
    );
  }

  if (state === "checking") {
    return (
      <Loader2
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 animate-spin text-orange-500"
      />
    );
  }

  return (
    <Circle
      aria-hidden="true"
      className="mt-0.5 size-4 shrink-0 text-muted-foreground/70"
    />
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

function isModelWarmupBusy(progress: HuggingFaceModelWarmupProgress) {
  return progress.status === "checking" || progress.status === "downloading";
}

function getModelWarmupPercent(progress: HuggingFaceModelWarmupProgress) {
  if (
    progress.status === "downloading" &&
    typeof progress.progress === "number"
  ) {
    return progress.progress;
  }

  if (progress.total > 0) {
    return Math.round((progress.completed / progress.total) * 100);
  }

  return 0;
}
