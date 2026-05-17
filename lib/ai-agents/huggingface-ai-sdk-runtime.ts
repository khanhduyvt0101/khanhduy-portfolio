import type {
  TransformersJSLanguageModel,
  TransformersJSProvider,
} from "@browser-ai/transformers-js";
import type { LanguageModel, Retryable } from "ai-retry";
import type { AgentBlueprint } from "./agent-catalog";
import {
  getHuggingFaceModelCandidates,
  getUniqueHuggingFaceModelCandidates,
  type HuggingFaceModelConfig,
} from "./huggingface-models";

const MAX_PROMPT_CHARS = 6000;
const MODEL_PROGRESS_INTERVAL_MS = 250;
const MODEL_PROGRESS_PERCENT_STEP = 4;

export type HuggingFaceAiSdkStatus =
  | "available"
  | "downloadable"
  | "fallback"
  | "running"
  | "unavailable";

export type HuggingFaceAiSdkRun = {
  text: string;
  runtime: "huggingface-ai-sdk";
  modelId: string;
  modelLabel: string;
  device: "webgpu" | "wasm";
};

export type HuggingFaceModelWarmupProgress = {
  status: "checking" | "downloading" | "ready" | "unsupported" | "error";
  completed: number;
  total: number;
  currentModel?: string;
  detail: string;
  error?: {
    friendly: string;
    system: string;
  };
  progress?: number;
};

export type HuggingFaceModelRunStatus =
  | { type: "loading"; message: string }
  | { type: "downloading"; modelLabel: string; progress: number }
  | { type: "generating"; message: string }
  | { type: "fallback"; message: string };

export type HuggingFaceModelWarmupResult = {
  loaded: number;
  total: number;
  errors: string[];
};

export type HuggingFaceModelPreflightStatus =
  | "available"
  | "downloadable"
  | "unavailable"
  | "unsupported"
  | "error";

export type HuggingFaceModelPreflightItem = {
  detail: string;
  error?: {
    friendly: string;
    system: string;
  };
  label: string;
  status: HuggingFaceModelPreflightStatus;
};

export type HuggingFaceModelPreflightResult = {
  canLoad: boolean;
  device?: TransformersDevice;
  models: HuggingFaceModelPreflightItem[];
  supported: boolean;
  total: number;
};

type RunHuggingFaceAgentInput = {
  agent: AgentBlueprint;
  content: string;
  userPrompt: string;
  onStatus?: (status: HuggingFaceModelRunStatus) => void;
};

type TransformersDevice = HuggingFaceAiSdkRun["device"];
type TransformersDtype = HuggingFaceModelConfig["webgpuDtype"] | "q8" | "q4";
type ModelProgressSnapshot = {
  lastEmittedAt: number;
  percent: number;
};

const readyModelCache = new Map<string, Promise<TransformersJSLanguageModel>>();

async function hasUsableWebGpuAdapter() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const gpu = (
    navigator as Navigator & {
      gpu?: {
        requestAdapter?: () => Promise<unknown>;
      };
    }
  ).gpu;

  if (!gpu?.requestAdapter) {
    return false;
  }

  try {
    return Boolean(await gpu.requestAdapter());
  } catch {
    return false;
  }
}

async function getBestDevice(): Promise<TransformersDevice> {
  if (isSafariBrowser()) {
    return "wasm";
  }

  return (await hasUsableWebGpuAdapter()) ? "webgpu" : "wasm";
}

function isSafariBrowser() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent;
  return (
    userAgent.includes("Safari") &&
    !userAgent.includes("Chrome") &&
    !userAgent.includes("Chromium") &&
    !userAgent.includes("Edg/")
  );
}

function getModelDtype(
  modelConfig: HuggingFaceModelConfig,
  device: TransformersDevice,
): TransformersDtype {
  return device === "webgpu" ? modelConfig.webgpuDtype : modelConfig.wasmDtype;
}

function getModelCacheKey(
  modelConfig: HuggingFaceModelConfig,
  device: TransformersDevice,
) {
  return `${modelConfig.id}:${device}:${getModelDtype(modelConfig, device)}`;
}

function getReadyHuggingFaceModel({
  device,
  modelConfig,
  onProgress,
  transformersJS,
}: {
  device: TransformersDevice;
  modelConfig: HuggingFaceModelConfig;
  onProgress?: (progress: number) => void;
  transformersJS: TransformersJSProvider;
}) {
  const cacheKey = getModelCacheKey(modelConfig, device);
  const cachedModel = readyModelCache.get(cacheKey);

  if (cachedModel) {
    return cachedModel;
  }

  const readyModel = (async () => {
    const model = transformersJS(modelConfig.id, {
      device,
      dtype: getModelDtype(modelConfig, device),
    });

    const availability = await model.availability();
    if (availability === "unavailable") {
      throw new Error("model unavailable in this browser");
    }

    if (availability === "available") {
      return model;
    }

    return model.createSessionWithProgress(onProgress);
  })();

  readyModelCache.set(cacheKey, readyModel);
  void readyModel.catch(() => {
    readyModelCache.delete(cacheKey);
  });

  return readyModel;
}

function trimForModel(value: string) {
  if (value.length <= MAX_PROMPT_CHARS) {
    return value;
  }

  return `${value.slice(0, MAX_PROMPT_CHARS)}\n\n[Input trimmed for the browser model.]`;
}

function stripModelScratchpad(value: string) {
  return value
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/Return only the final answer\.?/gi, "")
    .replace(
      /Do not echo the input, these instructions, hidden reasoning, or scratchpad text\.?/gi,
      "",
    )
    .trim();
}

function extractGeneratedText(result: unknown) {
  if (
    typeof result !== "object" ||
    result === null ||
    !("content" in result) ||
    !Array.isArray(result.content)
  ) {
    return "";
  }

  return result.content
    .map((part) => {
      if (
        typeof part === "object" &&
        part !== null &&
        "type" in part &&
        part.type === "text" &&
        "text" in part &&
        typeof part.text === "string"
      ) {
        return part.text;
      }

      return "";
    })
    .join("")
    .trim();
}

function retryWhenResultIsEmpty({
  maxOutputTokens,
  model,
}: {
  maxOutputTokens: number;
  model: LanguageModel;
}): Retryable<LanguageModel> {
  return (context) => {
    if (context.current.type !== "result") {
      return;
    }

    if (extractGeneratedText(context.current.result)) {
      return;
    }

    return {
      delay: 150,
      maxAttempts: 2,
      model,
      options: {
        maxOutputTokens,
      },
    };
  };
}

function buildModelPrompt({
  agent,
  content,
  userPrompt,
}: RunHuggingFaceAgentInput) {
  return [
    `Agent: ${agent.name}`,
    `User request: ${userPrompt || "Use the default agent workflow."}`,
    "",
    "Input:",
    trimForModel(content),
    "",
    "Return only the final answer.",
    "Do not echo the input, these instructions, hidden reasoning, or scratchpad text.",
    "Return practical sections. When the task asks for structured data, include copy-ready JSON, CSV, markdown, or schema blocks.",
  ].join("\n");
}

export async function getHuggingFaceAiSdkAvailability(): Promise<HuggingFaceAiSdkStatus> {
  if (typeof window === "undefined") {
    return "unavailable";
  }

  try {
    const { doesBrowserSupportTransformersJS } = await import(
      "@browser-ai/transformers-js"
    );

    if (!doesBrowserSupportTransformersJS()) {
      return "unavailable";
    }

    return (await hasUsableWebGpuAdapter()) ? "available" : "downloadable";
  } catch {
    return "fallback";
  }
}

export async function checkHuggingFaceAgentModelSupport({
  agentIds,
}: {
  agentIds: string[];
}): Promise<HuggingFaceModelPreflightResult> {
  const models = getUniqueHuggingFaceModelCandidates(agentIds);

  if (typeof window === "undefined") {
    return createUnsupportedPreflightResult({
      models,
      system: "Window is not available.",
    });
  }

  let transformersModule: Awaited<typeof import("@browser-ai/transformers-js")>;

  try {
    transformersModule = await import("@browser-ai/transformers-js");
  } catch (error) {
    return createUnsupportedPreflightResult({
      models,
      system:
        error instanceof Error
          ? error.message
          : "Could not load Transformers.js in this browser.",
    });
  }

  if (!transformersModule.doesBrowserSupportTransformersJS()) {
    return createUnsupportedPreflightResult({
      models,
      system: "Transformers.js support check returned false.",
    });
  }

  const device = await getBestDevice();
  const modelsForDevice = getUniqueHuggingFaceModelCandidates(agentIds, device);
  const checkedModels = await Promise.all(
    modelsForDevice.map(
      async (modelConfig): Promise<HuggingFaceModelPreflightItem> => {
        try {
          const model = transformersModule.transformersJS(modelConfig.id, {
            device,
            dtype: getModelDtype(modelConfig, device),
          });
          const availability = await model.availability();

          if (availability === "available") {
            return {
              detail: "Already cached and ready in this browser.",
              label: modelConfig.label,
              status: "available",
            };
          }

          if (availability === "unavailable") {
            return {
              detail: "This model is not available for your browser or device.",
              error: {
                friendly:
                  "This model is not available for your current browser or device.",
                system: `${modelConfig.id} availability returned unavailable.`,
              },
              label: modelConfig.label,
              status: "unavailable",
            };
          }

          return {
            detail:
              device === "webgpu"
                ? "Supported here. Download will start next with WebGPU."
                : "Supported here. Download will start next with WASM.",
            label: modelConfig.label,
            status: "downloadable",
          };
        } catch (error) {
          const normalizedError = getModelWarmupError(error);

          return {
            detail: normalizedError.friendly,
            error: normalizedError,
            label: modelConfig.label,
            status: "error",
          };
        }
      },
    ),
  );

  return {
    canLoad: checkedModels.some(
      (model) =>
        model.status === "available" || model.status === "downloadable",
    ),
    device,
    models: checkedModels,
    supported: true,
    total: checkedModels.length,
  };
}

export async function preloadHuggingFaceAgentModels({
  agentIds,
  onProgress,
}: {
  agentIds: string[];
  onProgress?: (progress: HuggingFaceModelWarmupProgress) => void;
}): Promise<HuggingFaceModelWarmupResult> {
  if (typeof window === "undefined") {
    return {
      errors: ["Hugging Face browser AI can only warm up in the browser."],
      loaded: 0,
      total: 0,
    };
  }

  const [{ doesBrowserSupportTransformersJS, transformersJS }] =
    await Promise.all([import("@browser-ai/transformers-js")]);

  if (!doesBrowserSupportTransformersJS()) {
    onProgress?.({
      completed: 0,
      detail: "This browser cannot run Hugging Face Transformers.js.",
      error: {
        friendly:
          "This browser cannot run local Hugging Face models. Try Safari 26, Chrome, Edge, or another modern browser with WebGPU or WASM support.",
        system: "Transformers.js support check returned false.",
      },
      status: "unsupported",
      total: 0,
    });

    return {
      errors: ["This browser cannot run Hugging Face Transformers.js."],
      loaded: 0,
      total: 0,
    };
  }

  const device = await getBestDevice();
  const models = getUniqueHuggingFaceModelCandidates(agentIds, device);
  const errors: string[] = [];
  const progressSnapshots = new Map<string, ModelProgressSnapshot>();
  let loaded = 0;

  for (const modelConfig of models) {
    const emitProgress = (progress: HuggingFaceModelWarmupProgress) => {
      onProgress?.(progress);
    };

    onProgress?.({
      completed: loaded,
      currentModel: modelConfig.label,
      detail:
        device === "webgpu"
          ? `Preparing ${modelConfig.label} with WebGPU.`
          : `Preparing ${modelConfig.label} with WASM.`,
      status: "checking",
      total: models.length,
    });

    await yieldToBrowser();

    try {
      await getReadyHuggingFaceModel({
        device,
        modelConfig,
        onProgress: (progress) => {
          const percent = Math.round(progress * 100);

          if (
            !shouldEmitModelDownloadProgress({
              modelId: modelConfig.id,
              percent,
              progressSnapshots,
            })
          ) {
            return;
          }

          emitProgress({
            completed: loaded,
            currentModel: modelConfig.label,
            detail: `Downloading ${modelConfig.label}.`,
            progress: percent,
            status: "downloading",
            total: models.length,
          });
        },
        transformersJS,
      });

      loaded += 1;
      onProgress?.({
        completed: loaded,
        currentModel: modelConfig.label,
        detail: `${modelConfig.label} is ready.`,
        status: "ready",
        total: models.length,
      });
    } catch (error) {
      const normalizedError = getModelWarmupError(error);
      errors.push(`${modelConfig.label}: ${normalizedError.system}`);
      onProgress?.({
        completed: loaded,
        currentModel: modelConfig.label,
        detail: normalizedError.friendly,
        error: normalizedError,
        status: "error",
        total: models.length,
      });
    }
  }

  return {
    errors,
    loaded,
    total: models.length,
  };
}

function createUnsupportedPreflightResult({
  models,
  system,
}: {
  models: HuggingFaceModelConfig[];
  system: string;
}): HuggingFaceModelPreflightResult {
  return {
    canLoad: false,
    models: models.map((model) => ({
      detail:
        "This browser cannot run local Hugging Face models. Try Safari 26, Chrome, Edge, or another modern browser with WebGPU or WASM support.",
      error: {
        friendly:
          "This browser cannot run local Hugging Face models. Try Safari 26, Chrome, Edge, or another modern browser with WebGPU or WASM support.",
        system,
      },
      label: model.label,
      status: "unsupported",
    })),
    supported: false,
    total: models.length,
  };
}

function shouldEmitModelDownloadProgress({
  modelId,
  percent,
  progressSnapshots,
}: {
  modelId: string;
  percent: number;
  progressSnapshots: Map<string, ModelProgressSnapshot>;
}) {
  const now = getTimestamp();
  const snapshot = progressSnapshots.get(modelId);

  if (
    snapshot &&
    percent < 100 &&
    now - snapshot.lastEmittedAt < MODEL_PROGRESS_INTERVAL_MS &&
    percent - snapshot.percent < MODEL_PROGRESS_PERCENT_STEP
  ) {
    return false;
  }

  progressSnapshots.set(modelId, {
    lastEmittedAt: now,
    percent,
  });

  return true;
}

function getTimestamp() {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

function yieldToBrowser() {
  return new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve());
      return;
    }

    window.setTimeout(resolve, 0);
  });
}

function getModelWarmupError(error: unknown) {
  const system =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown model warmup error.";
  const normalized = system.toLowerCase();

  if (normalized.includes("model unavailable")) {
    return {
      friendly:
        "This model is not available for your current browser or device.",
      system,
    };
  }

  if (
    normalized.includes("webgpu") ||
    normalized.includes("gpu") ||
    normalized.includes("adapter")
  ) {
    return {
      friendly:
        "WebGPU is not ready for this model. The agent will try a WASM or smaller browser model if one is available.",
      system,
    };
  }

  if (
    normalized.includes("network") ||
    normalized.includes("fetch") ||
    normalized.includes("failed to fetch")
  ) {
    return {
      friendly:
        "The model download was interrupted. Check the network connection and reload the page.",
      system,
    };
  }

  if (
    normalized.includes("quota") ||
    normalized.includes("storage") ||
    normalized.includes("cache") ||
    normalized.includes("indexeddb")
  ) {
    return {
      friendly:
        "The browser could not save the model cache. Free some storage or clear site data, then try again.",
      system,
    };
  }

  if (normalized.includes("memory") || normalized.includes("allocation")) {
    return {
      friendly:
        "This device does not have enough available memory for that model.",
      system,
    };
  }

  return {
    friendly:
      "This model could not load. The agent will use another ready model when possible.",
    system,
  };
}

export async function runHuggingFaceAiSdkAgent({
  agent,
  content,
  userPrompt,
  onStatus,
}: RunHuggingFaceAgentInput): Promise<HuggingFaceAiSdkRun> {
  if (typeof window === "undefined") {
    throw new Error("Hugging Face browser AI can only run in the browser.");
  }

  const [
    { generateText },
    { createRetryable, getModelKey },
    { retryAfterDelay },
    { doesBrowserSupportTransformersJS, transformersJS },
  ] = await Promise.all([
    import("ai"),
    import("ai-retry"),
    import("ai-retry/retryables"),
    import("@browser-ai/transformers-js"),
  ]);

  if (!doesBrowserSupportTransformersJS()) {
    throw new Error("Hugging Face browser AI is not available on this device.");
  }

  const device = await getBestDevice();
  const errors: string[] = [];

  for (const modelConfig of getHuggingFaceModelCandidates(agent.id, device)) {
    try {
      onStatus?.({
        message:
          device === "webgpu"
            ? `Loading ${modelConfig.label} with WebGPU.`
            : `Loading ${modelConfig.label} with WASM. This can be slower than WebGPU.`,
        type: "loading",
      });

      const readyModel = await getReadyHuggingFaceModel({
        device,
        modelConfig,
        onProgress: (progress) => {
          onStatus?.({
            modelLabel: modelConfig.label,
            progress: Math.round(progress * 100),
            type: "downloading",
          });
        },
        transformersJS,
      });

      onStatus?.({
        message: `Generating with ${modelConfig.label}; AI SDK retry is ready if it fails.`,
        type: "generating",
      });

      const retryableModel = createRetryable({
        model: readyModel,
        onRetry: (context) => {
          const previousAttempt = context.attempts.at(-1);
          const isSameModel =
            previousAttempt &&
            getModelKey(previousAttempt.model) ===
              getModelKey(context.current.model);

          onStatus?.({
            message: isSameModel
              ? `Retrying ${modelConfig.label} after a transient AI SDK error.`
              : `Trying ${modelConfig.label} through AI SDK fallback.`,
            type: "fallback",
          });
        },
        retries: [
          retryAfterDelay({
            backoffFactor: 1.6,
            delay: 250,
            maxAttempts: 2,
          }),
          retryWhenResultIsEmpty({
            maxOutputTokens: modelConfig.maxOutputTokens,
            model: readyModel,
          }),
        ],
        reset: "after-request",
      });

      const result = await generateText({
        maxOutputTokens: modelConfig.maxOutputTokens,
        model: retryableModel,
        prompt: buildModelPrompt({ agent, content, userPrompt }),
        system: agent.systemPrompt,
        temperature: 0.2,
      });

      const text = stripModelScratchpad(result.text);

      if (!text) {
        throw new Error(
          "AI SDK retry completed but returned an empty response.",
        );
      }

      return {
        device,
        modelId: result.response.modelId || modelConfig.id,
        modelLabel: modelConfig.label,
        runtime: "huggingface-ai-sdk",
        text,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "unknown model error";
      errors.push(`${modelConfig.label}: ${message}`);
      onStatus?.({
        message: `${modelConfig.label} could not run. Trying fallback model.`,
        type: "fallback",
      });
    }
  }

  throw new Error(
    `No Hugging Face browser model could run. ${errors.slice(0, 2).join(" ")}`,
  );
}
