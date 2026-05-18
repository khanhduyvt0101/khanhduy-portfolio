import { Workflow } from "lucide-react";

const workflowBankTreeUrl =
  "https://api.github.com/repos/khanhduyvt0101/workflows/git/trees/main?recursive=1";

type WorkflowBankTree = {
  tree?: Array<{
    path?: string;
    type?: string;
  }>;
};

async function getWorkflowCount() {
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
    const workflowCount = data.tree?.filter((item) => {
      if (item.type !== "blob" || !item.path?.endsWith(".json")) {
        return false;
      }

      const [folderName] = item.path.split("/");
      return folderName?.endsWith("-workflows") ?? false;
    }).length;

    return typeof workflowCount === "number" ? workflowCount : null;
  } catch {
    return null;
  }
}

export async function WorkflowBankCountStat(): Promise<React.ReactNode> {
  const workflowCount = await getWorkflowCount();

  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
          workflow files
        </span>
        <Workflow className="size-4 text-muted-foreground" />
      </div>
      <p className="min-h-7 text-xl font-black leading-tight">
        {workflowCount === null
          ? "Live repo"
          : workflowCount.toLocaleString("en-US")}
      </p>
    </div>
  );
}
