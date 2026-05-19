import {
  CircleDot,
  FileJson,
  FolderGit2,
  GitFork,
  type LucideIcon,
  Star,
  Workflow,
} from "lucide-react";

const workflowBankTreeUrl =
  "https://api.github.com/repos/khanhduyvt0101/workflows/git/trees/main?recursive=1";
const workflowBankRepositoryUrl =
  "https://api.github.com/repos/khanhduyvt0101/workflows";

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

async function getWorkflowTreeSnapshot(): Promise<WorkflowTreeSnapshot | null> {
  try {
    const response = await fetch(workflowBankTreeUrl, {
      headers: {
        Accept: "application/vnd.github+json",
      },
      next: { revalidate: 86_400 },
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

async function getRepositoryStats() {
  try {
    const response = await fetch(workflowBankRepositoryUrl, {
      headers: {
        Accept: "application/vnd.github+json",
      },
      next: { revalidate: 86_400 },
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

type GithubStat = {
  icon: LucideIcon;
  label: string;
  value: number | null;
  fallback: string;
};

export async function WorkflowBankGithubStats(): Promise<React.ReactNode> {
  const [workflowTreeSnapshot, repositoryStats] = await Promise.all([
    getWorkflowTreeSnapshot(),
    getRepositoryStats(),
  ]);

  const stats: GithubStat[] = [
    {
      label: "workflow files",
      value: workflowTreeSnapshot?.total ?? null,
      fallback: "Live repo",
      icon: Workflow,
    },
    {
      label: "stars",
      value: repositoryStats?.stars ?? null,
      fallback: "GitHub",
      icon: Star,
    },
    {
      label: "forks",
      value: repositoryStats?.forks ?? null,
      fallback: "Public",
      icon: GitFork,
    },
    {
      label: "open issues",
      value: repositoryStats?.openIssues ?? null,
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
            {stat.value === null
              ? stat.fallback
              : stat.value.toLocaleString("en-US")}
          </p>
        </div>
      ))}
    </>
  );
}

export async function WorkflowBankFileIndex(): Promise<React.ReactNode> {
  const workflowTreeSnapshot = await getWorkflowTreeSnapshot();
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
        {previewFiles.length > 0 ? (
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
