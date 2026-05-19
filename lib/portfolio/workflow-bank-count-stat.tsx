"use client";

import {
  CircleDot,
  FileJson,
  FolderGit2,
  GitFork,
  type LucideIcon,
  Star,
  Workflow,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

const workflowBankTreeUrl =
  "https://api.github.com/repos/khanhduyvt0101/workflows/git/trees/main?recursive=1";
const workflowBankRepositoryUrl =
  "https://api.github.com/repos/khanhduyvt0101/workflows";
const workflowFileSkeletonRows = [
  "workflow-file-skeleton-01",
  "workflow-file-skeleton-02",
  "workflow-file-skeleton-03",
  "workflow-file-skeleton-04",
  "workflow-file-skeleton-05",
  "workflow-file-skeleton-06",
];

type WorkflowBankTree = {
  tree?: Array<{
    path?: string;
    type?: string;
  }>;
};

type WorkflowBankRepository = {
  forks_count?: number;
  open_issues_count?: number;
  stargazers_count?: number;
};

type WorkflowTreeSnapshot = {
  files: string[];
  total: number;
};

type RepositoryStats = {
  forks: number;
  openIssues: number;
  stars: number;
};

let workflowTreeSnapshotPromise: Promise<WorkflowTreeSnapshot | null> | null =
  null;
let repositoryStatsPromise: Promise<RepositoryStats | null> | null = null;

function isWorkflowJsonFile(item: { path?: string; type?: string }) {
  if (item.type !== "blob" || !item.path?.endsWith(".json")) {
    return false;
  }

  const [folderName] = item.path.split("/");
  return folderName?.endsWith("-workflows") ?? false;
}

function formatWorkflowName(path: string) {
  const fileName =
    path
      .split("/")
      .at(-1)
      ?.replace(/\.json$/, "") ?? path;

  return fileName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function scheduleAfterIdle(callback: () => void) {
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
    delayId = browserWindow.setTimeout(scheduleIdleWork, 1400);
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

async function fetchWorkflowTreeSnapshot(): Promise<WorkflowTreeSnapshot | null> {
  try {
    const response = await fetch(workflowBankTreeUrl, {
      headers: {
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as WorkflowBankTree;
    const files =
      data.tree
        ?.filter(isWorkflowJsonFile)
        .map((item) => item.path)
        .filter((path): path is string => typeof path === "string")
        .sort((first, second) => first.localeCompare(second)) ?? [];

    return {
      files,
      total: files.length,
    };
  } catch {
    return null;
  }
}

function getWorkflowTreeSnapshot(): Promise<WorkflowTreeSnapshot | null> {
  workflowTreeSnapshotPromise ??= fetchWorkflowTreeSnapshot();
  return workflowTreeSnapshotPromise;
}

async function fetchRepositoryStats(): Promise<RepositoryStats | null> {
  try {
    const response = await fetch(workflowBankRepositoryUrl, {
      headers: {
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as WorkflowBankRepository;

    if (
      typeof data.open_issues_count !== "number" ||
      typeof data.stargazers_count !== "number" ||
      typeof data.forks_count !== "number"
    ) {
      return null;
    }

    return {
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      stars: data.stargazers_count,
    };
  } catch {
    return null;
  }
}

function getRepositoryStats(): Promise<RepositoryStats | null> {
  repositoryStatsPromise ??= fetchRepositoryStats();
  return repositoryStatsPromise;
}

type GithubStat = {
  icon: LucideIcon;
  label: string;
  value: number | null;
  fallback: string;
};

type GithubStatsState = {
  repositoryStats: RepositoryStats | null;
  workflowTreeSnapshot: WorkflowTreeSnapshot | null;
};

export function WorkflowBankGithubStats(): ReactNode {
  const [state, setState] = useState<GithubStatsState | null>(null);

  useEffect(() => {
    let isActive = true;
    const cancelIdleWork = scheduleAfterIdle(() => {
      void Promise.all([getWorkflowTreeSnapshot(), getRepositoryStats()]).then(
        ([workflowTreeSnapshot, repositoryStats]) => {
          if (isActive) {
            setState({ repositoryStats, workflowTreeSnapshot });
          }
        },
      );
    });

    return () => {
      isActive = false;
      cancelIdleWork();
    };
  }, []);

  const stats: GithubStat[] = [
    {
      label: "workflow files",
      value: state?.workflowTreeSnapshot?.total ?? null,
      fallback: "Live repo",
      icon: Workflow,
    },
    {
      label: "stars",
      value: state?.repositoryStats?.stars ?? null,
      fallback: "GitHub",
      icon: Star,
    },
    {
      label: "forks",
      value: state?.repositoryStats?.forks ?? null,
      fallback: "Public",
      icon: GitFork,
    },
    {
      label: "open issues",
      value: state?.repositoryStats?.openIssues ?? null,
      fallback: "GitHub",
      icon: CircleDot,
    },
  ];

  return (
    <>
      {stats.map((stat) => (
        <div
          className="group relative overflow-hidden rounded-lg border bg-background p-4 shadow-xs"
          key={stat.label}
        >
          <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/70 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
              {stat.label}
            </span>
            <stat.icon className="size-4 text-muted-foreground" />
          </div>
          <p className="min-h-7 text-xl font-black leading-tight">
            {state === null ? (
              <span
                aria-hidden="true"
                className="inline-block h-6 w-16 animate-pulse rounded-md bg-muted"
              />
            ) : stat.value === null ? (
              stat.fallback
            ) : (
              stat.value.toLocaleString("en-US")
            )}
          </p>
        </div>
      ))}
    </>
  );
}

export function WorkflowBankFileIndex(): ReactNode {
  const [workflowTreeSnapshot, setWorkflowTreeSnapshot] =
    useState<WorkflowTreeSnapshot | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let isActive = true;
    const cancelIdleWork = scheduleAfterIdle(() => {
      void getWorkflowTreeSnapshot().then((snapshot) => {
        if (isActive) {
          setWorkflowTreeSnapshot(snapshot);
          setHasLoaded(true);
        }
      });
    });

    return () => {
      isActive = false;
      cancelIdleWork();
    };
  }, []);

  const previewFiles = workflowTreeSnapshot?.files.slice(0, 6) ?? [];

  return (
    <div className="rounded-lg border bg-background p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FolderGit2 className="size-4 text-muted-foreground" />
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
            live file index
          </span>
        </div>
        <span className="rounded-lg border px-2 py-1 font-mono text-muted-foreground text-xs">
          main
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        {!hasLoaded ? (
          workflowFileSkeletonRows.map((row, index) => (
            <div
              className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border bg-muted/25 px-3 py-2"
              key={row}
            >
              <span className="font-mono text-muted-foreground text-xs">
                {(index + 1).toString().padStart(2, "0")}
              </span>
              <span
                aria-hidden="true"
                className="h-4 w-full max-w-44 animate-pulse rounded-md bg-muted"
              />
              <FileJson className="size-4 text-muted-foreground" />
            </div>
          ))
        ) : previewFiles.length > 0 ? (
          previewFiles.map((path, index) => (
            <div
              className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border bg-muted/25 px-3 py-2"
              key={path}
            >
              <span className="font-mono text-muted-foreground text-xs">
                {(index + 1).toString().padStart(2, "0")}
              </span>
              <span className="truncate text-sm font-semibold">
                {formatWorkflowName(path)}
              </span>
              <FileJson className="size-4 text-muted-foreground" />
            </div>
          ))
        ) : (
          <div className="rounded-lg border bg-muted/25 px-3 py-4 text-muted-foreground text-sm">
            GitHub tree unavailable.
          </div>
        )}
      </div>
    </div>
  );
}
