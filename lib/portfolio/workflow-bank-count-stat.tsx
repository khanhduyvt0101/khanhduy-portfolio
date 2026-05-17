"use client";

import { Workflow } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";

const workflowBankTreeUrl =
  "https://api.github.com/repos/khanhduyvt0101/workflows/git/trees/main?recursive=1";

type WorkflowBankTree = {
  tree?: Array<{
    path?: string;
    type?: string;
  }>;
};

type CountState =
  | {
      status: "loading";
      value: null;
    }
  | {
      status: "ready";
      value: number;
    }
  | {
      status: "error";
      value: null;
    };

export function WorkflowBankCountStat(): React.ReactNode {
  const [countState, setCountState] = useState<CountState>({
    status: "loading",
    value: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadWorkflowCount() {
      try {
        const response = await fetch(workflowBankTreeUrl, {
          headers: {
            Accept: "application/vnd.github+json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          setCountState({ status: "error", value: null });
          return;
        }

        const data = (await response.json()) as WorkflowBankTree;
        const workflowCount =
          data.tree?.filter((item) => {
            if (item.type !== "blob" || !item.path?.endsWith(".json")) {
              return false;
            }

            const [folderName] = item.path.split("/");
            return folderName?.endsWith("-workflows") ?? false;
          }).length ?? null;

        if (typeof workflowCount !== "number") {
          setCountState({ status: "error", value: null });
          return;
        }

        setCountState({ status: "ready", value: workflowCount });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setCountState({ status: "error", value: null });
      }
    }

    void loadWorkflowCount();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div
      aria-busy={countState.status === "loading"}
      className="rounded-lg border bg-muted/30 p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
          workflow files
        </span>
        <Workflow className="size-4 text-muted-foreground" />
      </div>
      <p className="min-h-7 text-xl font-black leading-tight">
        {countState.status === "ready" ? (
          countState.value.toLocaleString("en-US")
        ) : countState.status === "error" ? (
          "Live repo"
        ) : (
          <span
            aria-label="Loading workflow count"
            className={cn(
              "block h-7 w-16 rounded-md bg-muted-foreground/20",
              "motion-safe:animate-pulse",
            )}
            role="status"
          />
        )}
      </p>
    </div>
  );
}
