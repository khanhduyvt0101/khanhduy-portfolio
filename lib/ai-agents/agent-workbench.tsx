"use client";

import {
  AlertCircle,
  ArrowDownToLine,
  Bot,
  CheckCircle2,
  Clipboard,
  FileInput,
  Loader2,
  Sparkles,
  TriangleAlert,
  WandSparkles,
} from "lucide-react";
import Link from "next/link";
import type { ChangeEvent, ReactNode } from "react";
import { startTransition, useEffect, useMemo, useState } from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";

import { trackSiteEvent } from "~/lib/site/analytics-events";
import type { AgentBlueprint } from "./agent-catalog";
import {
  type BrowserAiStatus,
  getBrowserAiAvailability,
  runBrowserAiAgent,
} from "./browser-ai-runtime";
import {
  checkHuggingFaceAgentModelSupport,
  type HuggingFaceModelPreflightResult,
  type HuggingFaceModelWarmupProgress,
  preloadHuggingFaceAgentModels,
  runHuggingFaceAiSdkAgent,
} from "./huggingface-ai-sdk-runtime";
import {
  getHuggingFaceModelCandidates,
  type HuggingFaceModelConfig,
} from "./huggingface-models";
import {
  type AgentRunResult,
  markdownFromResult,
  runLocalAgent,
} from "./local-agent-engine";

type ModelLoadState =
  | "checking"
  | "downloadable"
  | "downloading"
  | "error"
  | "queued"
  | "ready"
  | "unavailable";

type ModelOptionKind = "browser" | "hf";

type ModelOption = {
  detail: string;
  error?: {
    friendly: string;
    system: string;
  };
  kind: ModelOptionKind;
  label: string;
  progress?: number;
  role: string;
  state: ModelLoadState;
};

type ModelWarmupState = {
  loaded: number;
  message: string;
  phase: "loading" | "ready" | "unavailable";
  total: number;
};

const BROWSER_MODEL_RUN_TIMEOUT_MS = 12_000;
const BROWSER_MODEL_WARMUP_TIMEOUT_MS = 90_000;

export function AgentWorkbench({
  agent,
}: {
  agent: AgentBlueprint;
}): ReactNode {
  const [userPrompt, setUserPrompt] = useState(agent.samplePrompt);
  const [content, setContent] = useState(agent.sampleInput);
  const [result, setResult] = useState<AgentRunResult | null>(null);
  const [modelText, setModelText] = useState("");
  const [actualModelUsed, setActualModelUsed] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState(false);
  const huggingFaceModels = useMemo(
    () => getHuggingFaceModelCandidates(agent.id),
    [agent.id],
  );
  const [modelOptions, setModelOptions] = useState<ModelOption[]>(() =>
    createInitialModelOptions(agent, huggingFaceModels),
  );
  const [modelWarmup, setModelWarmup] = useState<ModelWarmupState>({
    loaded: 0,
    message: "Checking browser model support.",
    phase: "loading",
    total: huggingFaceModels.length,
  });
  const hasLoadedHuggingFaceModel = modelWarmup.loaded > 0;
  const hasUsableBrowserAiModel = modelOptions.some(
    (model) =>
      model.kind === "browser" &&
      (model.state === "ready" ||
        model.state === "downloadable" ||
        model.state === "downloading"),
  );
  const hasUsableModel = hasLoadedHuggingFaceModel || hasUsableBrowserAiModel;
  const shouldShowModelUnavailableNotice =
    modelWarmup.phase === "unavailable" &&
    !hasUsableModel &&
    modelOptions.some((model) => model.kind === "hf");

  useEffect(() => {
    let cancelled = false;
    let warmupExpired = false;

    setModelOptions(createInitialModelOptions(agent, huggingFaceModels));
    setModelWarmup({
      loaded: 0,
      message: "Checking browser model support.",
      phase: "loading",
      total: huggingFaceModels.length,
    });

    if (agent.status === "Browser AI boosted") {
      void getBrowserAiAvailability()
        .then((status) => {
          if (cancelled) {
            return;
          }

          startTransition(() => {
            setModelOptions((currentOptions) =>
              updateBrowserAiModelOption(currentOptions, status),
            );
          });
        })
        .catch(() => {
          if (cancelled) {
            return;
          }

          startTransition(() => {
            setModelOptions((currentOptions) =>
              updateBrowserAiModelOption(currentOptions, "unavailable"),
            );
          });
        });
    }

    void (async () => {
      try {
        const preflight = await checkHuggingFaceAgentModelSupport({
          agentIds: [agent.id],
        });

        if (cancelled) {
          return;
        }

        startTransition(() => {
          setModelOptions((currentOptions) =>
            updateModelOptionsFromPreflight(currentOptions, preflight),
          );
          setModelWarmup({
            loaded: getPreflightReadyCount(preflight),
            message: getPreflightWarmupMessage(preflight),
            phase: getPreflightWarmupPhase(preflight),
            total: preflight.total || huggingFaceModels.length,
          });
        });

        if (!preflight.canLoad) {
          return;
        }

        const result = await withTimeout(
          preloadHuggingFaceAgentModels({
            agentIds: [agent.id],
            onProgress: (progress) => {
              if (cancelled || warmupExpired) {
                return;
              }

              startTransition(() => {
                setModelOptions((currentOptions) =>
                  updateModelOptionsFromProgress(currentOptions, progress),
                );
                setModelWarmup({
                  loaded: progress.completed,
                  message: getWarmupMessage(progress),
                  phase: getWarmupPhase(progress),
                  total: progress.total || huggingFaceModels.length,
                });
              });
            },
          }),
          BROWSER_MODEL_WARMUP_TIMEOUT_MS,
          "Browser model warmup took too long.",
        ).catch((error) => {
          if (cancelled) {
            return {
              errors: [],
              loaded: 0,
              total: huggingFaceModels.length,
            };
          }

          warmupExpired = true;
          startTransition(() => {
            setModelWarmup({
              loaded: 0,
              message:
                "The browser model is taking too long. The agent can still run with its local fallback.",
              phase: "unavailable",
              total: huggingFaceModels.length,
            });
            setModelOptions((currentOptions) =>
              markActiveModelTimeout(currentOptions, error),
            );
          });

          return {
            errors: [
              error instanceof Error
                ? error.message
                : "Browser model warmup took too long.",
            ],
            loaded: 0,
            total: huggingFaceModels.length,
          };
        });

        if (cancelled) {
          return;
        }

        setModelWarmup({
          loaded: result.loaded,
          message:
            result.loaded > 0
              ? `${result.loaded}/${result.total} browser model${result.total === 1 ? "" : "s"} ready.`
              : "No browser model loaded. The agent can still run with its local fallback.",
          phase: result.loaded > 0 ? "ready" : "unavailable",
          total: result.total,
        });
        setModelOptions((currentOptions) =>
          finalizeModelOptions(currentOptions, result.loaded > 0),
        );
      } catch {
        if (cancelled) {
          return;
        }

        setModelWarmup({
          loaded: 0,
          message:
            "No browser model loaded. The agent can still run with its local fallback.",
          phase: "unavailable",
          total: huggingFaceModels.length,
        });
        setModelOptions((currentOptions) =>
          finalizeModelOptions(currentOptions, false),
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [agent, agent.id, huggingFaceModels]);

  const supportsFiles = agent.inputs.includes("file");

  const renderedMarkdown = useMemo(() => {
    if (modelText) {
      return modelText;
    }

    return result ? markdownFromResult(result) : "";
  }, [modelText, result]);
  const responseMarkdown = useMemo(() => {
    if (!renderedMarkdown) {
      return "";
    }

    return actualModelUsed
      ? `Model used: ${actualModelUsed}\n\n${renderedMarkdown}`
      : renderedMarkdown;
  }, [actualModelUsed, renderedMarkdown]);

  const runAgent = async () => {
    setIsRunning(true);
    setCopied(false);
    setModelText("");
    setResult(null);
    setActualModelUsed("");
    trackSiteEvent("Agent Run Started", {
      agent: agent.id,
      runtime: agent.runtime,
    });

    try {
      if (agent.status === "Browser AI boosted") {
        try {
          const browserResult = await runBrowserAiAgent({
            agent,
            content,
            userPrompt,
          });
          setModelText(browserResult.text);
          setActualModelUsed("Browser AI");
          trackSiteEvent("Agent Run Completed", {
            agent: agent.id,
            runtime: "chrome-ai",
          });
          return;
        } catch {
          trackSiteEvent("Agent Runtime Fallback", {
            agent: agent.id,
            from: "chrome-ai",
          });
        }
      }

      if (hasLoadedHuggingFaceModel) {
        try {
          const huggingFaceResult = await withTimeout(
            runHuggingFaceAiSdkAgent({
              agent,
              content,
              userPrompt,
            }),
            BROWSER_MODEL_RUN_TIMEOUT_MS,
            "Browser model took too long to respond.",
          );
          setModelText(huggingFaceResult.text);
          setActualModelUsed(
            `${huggingFaceResult.modelLabel} (${huggingFaceResult.device.toUpperCase()})`,
          );
          trackSiteEvent("Agent Run Completed", {
            agent: agent.id,
            device: huggingFaceResult.device,
            model: huggingFaceResult.modelLabel,
            runtime: "huggingface-ai-sdk",
          });
          return;
        } catch {
          trackSiteEvent("Agent Runtime Fallback", {
            agent: agent.id,
            from: "huggingface-ai-sdk",
          });
        }
      } else {
        trackSiteEvent("Agent Runtime Fallback", {
          agent: agent.id,
          from: "browser-model-unavailable",
        });
      }

      const localResult = runLocalAgent({
        agent,
        content,
        userPrompt,
      });
      setResult(localResult);
      setActualModelUsed("Local fallback");
      trackSiteEvent("Agent Run Completed", {
        agent: agent.id,
        runtime: "local",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const useSample = () => {
    setContent(agent.sampleInput);
    setUserPrompt(agent.samplePrompt);
    setFileName("");
    trackSiteEvent("Agent Sample Loaded", { agent: agent.id });
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileName(file.name);

    try {
      const text = await file.text();
      setContent(text);
      trackSiteEvent("Agent File Loaded", {
        agent: agent.id,
        fileType: file.type || "unknown",
      });
    } catch {
      setFileName("");
    }
  };

  const copyOutput = async () => {
    if (!responseMarkdown) {
      return;
    }

    await navigator.clipboard.writeText(responseMarkdown);
    setCopied(true);
    trackSiteEvent("Agent Output Copied", { agent: agent.id });
    window.setTimeout(() => setCopied(false), 1400);
  };

  const downloadOutput = () => {
    if (!responseMarkdown) {
      return;
    }

    const blob = new Blob([responseMarkdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${agent.id}-agent-output.md`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    trackSiteEvent("Agent Output Downloaded", { agent: agent.id });
  };

  return (
    <section className="border-b bg-background">
      <div className="container mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[0.78fr_1.22fr]">
        <aside className="flex flex-col gap-4">
          <Card className="rounded-lg">
            <CardHeader>
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-lg">
                  <Bot />
                  Free agent
                </Badge>
                <Badge variant="secondary" className="rounded-lg">
                  {agent.privacy}
                </Badge>
              </div>
              <CardTitle className="text-3xl font-black">
                {agent.name}
              </CardTitle>
              <CardDescription className="text-base leading-7">
                {agent.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Good for
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {agent.useCases.map((useCase) => (
                    <Badge
                      className="rounded-lg"
                      key={useCase}
                      variant="outline"
                    >
                      {useCase}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border bg-muted/25 p-4">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Models
                </p>
                {shouldShowModelUnavailableNotice ? (
                  <div className="mt-3 rounded-lg border border-amber-500/35 bg-amber-500/10 p-3 text-amber-950 dark:text-amber-100">
                    <div className="flex items-start gap-2">
                      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-300" />
                      <div>
                        <p className="font-semibold text-sm">
                          Browser models unavailable
                        </p>
                        <p className="mt-1 text-amber-900/75 text-xs leading-5 dark:text-amber-100/75">
                          This browser could not load a WebGPU or WASM model for
                          this agent. The built-in local fallback still keeps
                          the workflow usable.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="mt-3 grid gap-2">
                  {modelOptions.map((model) => (
                    <ModelStatusRow
                      key={`${model.role}-${model.label}`}
                      model={model}
                    />
                  ))}
                </div>
              </div>

              <Button asChild variant="outline" className="rounded-lg">
                <Link href="/ai-agents">Back to all agents</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>

        <div className="grid gap-4">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <WandSparkles className="size-5" />
                Run the agent
              </CardTitle>
              <CardDescription>
                Everything here runs from your browser. Supported files are read
                locally before processing.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <label
                  className="font-medium text-sm"
                  htmlFor={`${agent.id}-prompt`}
                >
                  {agent.promptLabel}
                </label>
                <Textarea
                  id={`${agent.id}-prompt`}
                  onChange={(event) => setUserPrompt(event.target.value)}
                  placeholder={agent.promptPlaceholder}
                  value={userPrompt}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label
                    className="font-medium text-sm"
                    htmlFor={`${agent.id}-input`}
                  >
                    {agent.inputLabel}
                  </label>
                  {supportsFiles ? (
                    <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 font-medium text-sm shadow-xs hover:bg-accent hover:text-accent-foreground">
                      <FileInput className="size-4" />
                      Upload file
                      <input
                        accept={agent.acceptedFiles}
                        className="sr-only"
                        onChange={onFileChange}
                        type="file"
                      />
                    </label>
                  ) : null}
                </div>
                <Textarea
                  className="min-h-64 font-mono text-sm"
                  id={`${agent.id}-input`}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder={agent.inputPlaceholder}
                  value={content}
                />
                <p className="text-muted-foreground text-xs">
                  {fileName
                    ? `Loaded ${fileName} locally.`
                    : supportsFiles
                      ? "You can paste text or upload a supported text-based file."
                      : "Paste content directly into this agent."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  className="rounded-lg"
                  disabled={isRunning}
                  onClick={runAgent}
                  type="button"
                >
                  {isRunning ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Sparkles />
                  )}
                  {isRunning ? "Running" : "Run agent"}
                </Button>
                <Button
                  className="rounded-lg"
                  disabled={isRunning}
                  onClick={useSample}
                  type="button"
                  variant="outline"
                >
                  Use sample
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">Agent output</CardTitle>
                  <CardDescription>
                    {actualModelUsed
                      ? `Generated with ${actualModelUsed}.`
                      : "Run the agent to generate output."}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="rounded-lg"
                    disabled={!renderedMarkdown}
                    onClick={copyOutput}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Clipboard />
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    className="rounded-lg"
                    disabled={!renderedMarkdown}
                    onClick={downloadOutput}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <ArrowDownToLine />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {modelText ? (
                <pre className="max-h-[560px] overflow-auto rounded-lg border bg-muted/25 p-4 text-sm leading-7 whitespace-pre-wrap">
                  {responseMarkdown}
                </pre>
              ) : result ? (
                <div className="grid gap-4">
                  {actualModelUsed ? (
                    <div className="rounded-lg border bg-muted/25 px-4 py-3 text-sm">
                      <span className="text-muted-foreground">
                        Model used:{" "}
                      </span>
                      <span className="font-semibold">{actualModelUsed}</span>
                    </div>
                  ) : null}
                  <div className="rounded-lg border bg-muted/25 p-4">
                    <p className="font-black text-xl">{result.title}</p>
                    <p className="mt-3 text-muted-foreground leading-7">
                      {result.summary}
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {result.sections.map((section) => (
                      <div
                        className="rounded-lg border p-4"
                        key={section.title}
                      >
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {section.title}
                        </p>
                        <ul className="mt-3 space-y-2 text-sm leading-6">
                          {toKeyedItems(section.items).map((item) => (
                            <li key={`${section.title}-${item.key}`}>
                              {item.value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {result.artifacts.map((artifact) => (
                    <div className="rounded-lg border" key={artifact.label}>
                      <div className="border-b px-4 py-3">
                        <p className="font-semibold">{artifact.label}</p>
                      </div>
                      <pre className="max-h-72 overflow-auto p-4 text-sm leading-6 whitespace-pre-wrap">
                        {artifact.content}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center text-muted-foreground">
                  Run the agent to see a summary, structured sections, and
                  copy-ready artifacts.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string,
) {
  return Promise.race([
    promise,
    new Promise<never>((_resolve, reject) => {
      window.setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]);
}

function createInitialModelOptions(
  _agent: AgentBlueprint,
  huggingFaceModels: HuggingFaceModelConfig[],
): ModelOption[] {
  const models: ModelOption[] = [];

  models.push(
    ...huggingFaceModels.map((model, index) => ({
      detail: model.bestFor,
      kind: "hf" as const,
      label: model.label,
      role: index === 0 && models.length === 0 ? "Primary" : "Fallback",
      state: "queued" as const,
    })),
  );

  return models;
}

function updateBrowserAiModelOption(
  modelOptions: ModelOption[],
  status: BrowserAiStatus,
): ModelOption[] {
  if (status === "fallback" || status === "unavailable") {
    return normalizePrimaryModelOption(
      modelOptions.filter((model) => model.kind !== "browser"),
    );
  }

  const browserAiOption: ModelOption = {
    detail: "Checking browser-native AI support.",
    kind: "browser",
    label: "Browser AI",
    role: "Primary",
    state: "checking",
  };
  const optionsWithBrowserAi = modelOptions.some(
    (model) => model.kind === "browser",
  )
    ? modelOptions
    : [browserAiOption, ...modelOptions];

  return normalizePrimaryModelOption(
    optionsWithBrowserAi.map((model) => {
      if (model.kind !== "browser") {
        return model;
      }

      if (status === "available") {
        return {
          ...model,
          detail: "Ready in this browser.",
          progress: 100,
          state: "ready",
        };
      }

      return {
        ...model,
        detail:
          status === "downloading"
            ? "Browser AI is downloading in this browser."
            : "Ready to download when the agent runs.",
        progress: undefined,
        state: status === "downloading" ? "downloading" : "downloadable",
      };
    }),
  );
}

function normalizePrimaryModelOption(modelOptions: ModelOption[]) {
  const orderedModelOptions = orderModelOptionsByAvailability(modelOptions);
  let hasPrimary = false;

  return orderedModelOptions.map((model) => {
    if (!hasPrimary && canModelBePrimary(model)) {
      hasPrimary = true;
      return {
        ...model,
        role: "Primary",
      };
    }

    return {
      ...model,
      role: "Fallback",
    };
  });
}

function canModelBePrimary(model: ModelOption) {
  return model.state !== "error" && model.state !== "unavailable";
}

function orderModelOptionsByAvailability(modelOptions: ModelOption[]) {
  return modelOptions
    .map((model, index) => ({ index, model }))
    .sort((left, right) => {
      const priorityDiff =
        getModelAvailabilityPriority(left.model) -
        getModelAvailabilityPriority(right.model);

      return priorityDiff || left.index - right.index;
    })
    .map(({ model }) => model);
}

function getModelAvailabilityPriority(model: ModelOption) {
  if (model.state === "ready") {
    return 0;
  }

  if (
    model.state === "downloading" ||
    model.state === "downloadable" ||
    model.state === "checking"
  ) {
    return 1;
  }

  if (model.state === "queued") {
    return 2;
  }

  if (model.state === "error") {
    return 3;
  }

  return 4;
}

function updateModelOptionsFromPreflight(
  modelOptions: ModelOption[],
  preflight: HuggingFaceModelPreflightResult,
): ModelOption[] {
  const preflightByLabel = new Map(
    preflight.models.map((model) => [model.label, model]),
  );
  const preflightOrderByLabel = new Map(
    preflight.models.map((model, index) => [model.label, index]),
  );

  return normalizePrimaryModelOption(
    orderModelOptionsByPreflight(
      modelOptions.map((model) => {
        if (model.kind !== "hf") {
          return model;
        }

        const preflightModel = preflightByLabel.get(model.label);

        if (!preflightModel) {
          return model;
        }

        if (preflightModel.status === "available") {
          return {
            ...model,
            detail: preflightModel.detail,
            progress: 100,
            state: "ready",
          };
        }

        if (preflightModel.status === "downloadable") {
          return {
            ...model,
            detail: preflightModel.detail,
            progress: undefined,
            state: "checking",
          };
        }

        return {
          ...model,
          detail: preflight.canLoad
            ? preflightModel.detail
            : "Not available in this browser.",
          error: preflightModel.error,
          progress: undefined,
          state: preflight.canLoad ? "error" : "unavailable",
        };
      }),
      preflightOrderByLabel,
    ),
  );
}

function orderModelOptionsByPreflight(
  modelOptions: ModelOption[],
  preflightOrderByLabel: Map<string, number>,
) {
  return modelOptions
    .map((model, index) => ({ index, model }))
    .sort((left, right) => {
      const leftOrder = preflightOrderByLabel.get(left.model.label);
      const rightOrder = preflightOrderByLabel.get(right.model.label);

      if (leftOrder === undefined && rightOrder === undefined) {
        return left.index - right.index;
      }

      if (leftOrder === undefined) {
        return -1;
      }

      if (rightOrder === undefined) {
        return 1;
      }

      return leftOrder - rightOrder;
    })
    .map(({ model }) => model);
}

function updateModelOptionsFromProgress(
  modelOptions: ModelOption[],
  progress: HuggingFaceModelWarmupProgress,
): ModelOption[] {
  if (!progress.currentModel) {
    if (progress.status === "unsupported") {
      return normalizePrimaryModelOption(
        modelOptions.map((model) =>
          model.kind === "hf"
            ? {
                ...model,
                detail:
                  "This browser cannot run local Hugging Face models. Try Safari 26, Chrome, Edge, or another modern browser with WebGPU or WASM support.",
                error: progress.error,
                state: "unavailable",
              }
            : model,
        ),
      );
    }

    return modelOptions;
  }

  return normalizePrimaryModelOption(
    modelOptions.map((model) => {
      if (model.label !== progress.currentModel) {
        return model;
      }

      if (progress.status === "downloading") {
        return {
          ...model,
          detail: "Downloading model weights into the browser cache.",
          progress: progress.progress,
          state: "downloading",
        };
      }

      if (progress.status === "ready") {
        return {
          ...model,
          detail: "Ready in this browser.",
          progress: 100,
          state: "ready",
        };
      }

      if (progress.status === "error" || progress.status === "unsupported") {
        return {
          ...model,
          detail:
            progress.error?.friendly ??
            "This model could not load. The agent will use another ready model when possible.",
          error: progress.error,
          progress: undefined,
          state: "error",
        };
      }

      return {
        ...model,
        detail: "Checking browser support and cache.",
        progress: undefined,
        state: "checking",
      };
    }),
  );
}

function markActiveModelTimeout(
  modelOptions: ModelOption[],
  error: unknown,
): ModelOption[] {
  const system =
    error instanceof Error
      ? error.message
      : "Browser model warmup took too long.";

  return normalizePrimaryModelOption(
    modelOptions.map((model) => {
      if (model.state !== "checking" && model.state !== "downloading") {
        return model;
      }

      return {
        ...model,
        detail:
          "This browser model is taking too long to prepare. The agent will use the local fallback instead.",
        error: {
          friendly:
            "This browser model is taking too long to prepare. The local fallback is active.",
          system,
        },
        progress: undefined,
        state: "unavailable",
      };
    }),
  );
}

function getPreflightReadyCount(preflight: HuggingFaceModelPreflightResult) {
  return preflight.models.filter((model) => model.status === "available")
    .length;
}

function getPreflightWarmupMessage(preflight: HuggingFaceModelPreflightResult) {
  const readyCount = getPreflightReadyCount(preflight);

  if (readyCount > 0) {
    return `${readyCount}/${preflight.total} browser model${preflight.total === 1 ? "" : "s"} already cached.`;
  }

  if (preflight.canLoad) {
    return "This browser can run a local model. Download is starting.";
  }

  return preflight.supported
    ? "No browser model is available for this device."
    : "This browser cannot run local Hugging Face models.";
}

function getPreflightWarmupPhase(
  preflight: HuggingFaceModelPreflightResult,
): ModelWarmupState["phase"] {
  if (getPreflightReadyCount(preflight) > 0) {
    return "ready";
  }

  return preflight.canLoad ? "loading" : "unavailable";
}

function finalizeModelOptions(
  modelOptions: ModelOption[],
  hasLoadedModel: boolean,
): ModelOption[] {
  return normalizePrimaryModelOption(
    modelOptions.map((model) => {
      if (model.kind !== "hf") {
        return model;
      }

      if (!hasLoadedModel && model.state === "error") {
        return {
          ...model,
          detail: "Not available in this browser.",
          state: "unavailable",
        };
      }

      if (
        model.state !== "queued" &&
        !(hasLoadedModel && model.state === "checking")
      ) {
        return model;
      }

      return {
        ...model,
        detail: hasLoadedModel
          ? "Standby fallback. Another browser model is ready."
          : "Not available in this browser.",
        state: hasLoadedModel ? "queued" : "unavailable",
      };
    }),
  );
}

function getWarmupMessage(progress: HuggingFaceModelWarmupProgress) {
  if (progress.status === "downloading") {
    return `${progress.currentModel} is downloading${typeof progress.progress === "number" ? `: ${progress.progress}%` : ""}.`;
  }

  if (progress.status === "ready") {
    if (progress.completed > 0 && progress.completed < progress.total) {
      return `${progress.completed}/${progress.total} browser models ready. You can run now while the rest finish loading.`;
    }

    return `${progress.currentModel} is ready.`;
  }

  if (progress.status === "error") {
    return (
      progress.error?.friendly ??
      `${progress.currentModel} could not load. Trying the next model.`
    );
  }

  if (progress.status === "unsupported") {
    return (
      progress.error?.friendly ??
      "This browser cannot run the Hugging Face model."
    );
  }

  return progress.currentModel
    ? `Checking ${progress.currentModel}.`
    : "Checking browser model support.";
}

function getWarmupPhase(
  progress: HuggingFaceModelWarmupProgress,
): ModelWarmupState["phase"] {
  if (progress.completed > 0) {
    return "ready";
  }

  return progress.status === "unsupported" ? "unavailable" : "loading";
}

function ModelStatusRow({ model }: { model: ModelOption }): ReactNode {
  const isError = model.state === "error";
  const isUnavailable = model.state === "unavailable";

  return (
    <div
      className={
        isError
          ? "rounded-lg border border-destructive/30 bg-destructive/5 p-3"
          : isUnavailable
            ? "rounded-lg border border-dashed bg-background/50 p-3 opacity-65"
            : "rounded-lg border bg-background p-3"
      }
      aria-disabled={isUnavailable}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <ModelStateIcon state={model.state} />
            <p
              className={
                isError
                  ? "truncate font-semibold text-destructive text-sm"
                  : isUnavailable
                    ? "truncate font-semibold text-muted-foreground text-sm"
                    : "truncate font-semibold text-sm"
              }
            >
              {model.label}
            </p>
          </div>
          <p
            className={
              isError
                ? "mt-1 text-destructive/90 text-xs leading-5"
                : isUnavailable
                  ? "mt-1 line-clamp-2 text-muted-foreground text-xs leading-5"
                  : "mt-1 line-clamp-2 text-muted-foreground text-xs leading-5"
            }
          >
            {model.detail}
          </p>
          {isError && model.error?.system ? (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground">
                Technical detail
              </summary>
              <p className="mt-1 break-words rounded-md bg-background/70 p-2 font-mono text-muted-foreground">
                {model.error.system}
              </p>
            </details>
          ) : null}
        </div>
        <Badge
          className="shrink-0 rounded-lg"
          variant={isUnavailable ? "secondary" : "outline"}
        >
          {isUnavailable ? "Unavailable" : model.role}
        </Badge>
      </div>
      {model.state === "downloading" && typeof model.progress === "number" ? (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground transition-[width]"
            style={{ width: `${model.progress}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function ModelStateIcon({ state }: { state: ModelLoadState }): ReactNode {
  if (state === "ready") {
    return <CheckCircle2 className="size-4 shrink-0 text-green-600" />;
  }

  if (state === "error") {
    return <AlertCircle className="size-4 shrink-0 text-destructive" />;
  }

  if (state === "unavailable") {
    return (
      <span className="size-2.5 shrink-0 rounded-full bg-muted-foreground/50" />
    );
  }

  if (state === "downloadable") {
    return <CheckCircle2 className="size-4 shrink-0 text-green-600" />;
  }

  if (state === "checking" || state === "downloading") {
    return <Loader2 className="size-4 shrink-0 animate-spin text-foreground" />;
  }

  return (
    <span className="size-2.5 shrink-0 rounded-full bg-muted-foreground" />
  );
}

function toKeyedItems(items: string[]) {
  const seen = new Map<string, number>();

  return items.map((value) => {
    const count = (seen.get(value) ?? 0) + 1;
    seen.set(value, count);

    return {
      key: `${value}-${count}`,
      value,
    };
  });
}
