export type HuggingFaceModelConfig = {
  id: string;
  label: string;
  bestFor: string;
  maxOutputTokens: number;
  wasmPriority: number;
  webgpuDtype: "q4" | "q4f16" | "fp16";
  wasmDtype: "q8" | "q4";
};

export type HuggingFaceModelDevice = "webgpu" | "wasm";

export const HUGGING_FACE_MODELS = {
  qwen3Small: {
    id: "onnx-community/Qwen3-0.6B-ONNX",
    label: "Qwen3 0.6B",
    bestFor: "multi-step reasoning, extraction, JSON, schemas, and replies",
    maxOutputTokens: 640,
    wasmPriority: 20,
    webgpuDtype: "q4f16",
    wasmDtype: "q8",
  },
  smolLm2Medium: {
    id: "HuggingFaceTB/SmolLM2-360M-Instruct",
    label: "SmolLM2 360M",
    bestFor: "summaries, rewrite-style responses, and general instructions",
    maxOutputTokens: 560,
    wasmPriority: 10,
    webgpuDtype: "q4",
    wasmDtype: "q8",
  },
  smolLm2Tiny: {
    id: "HuggingFaceTB/SmolLM2-135M-Instruct",
    label: "SmolLM2 135M",
    bestFor: "fast browser fallback on smaller devices",
    maxOutputTokens: 420,
    wasmPriority: 0,
    webgpuDtype: "q4",
    wasmDtype: "q8",
  },
} satisfies Record<string, HuggingFaceModelConfig>;

const fallbackModelOrder = [
  HUGGING_FACE_MODELS.smolLm2Tiny,
  HUGGING_FACE_MODELS.smolLm2Medium,
];

const agentModelOrder: Record<string, HuggingFaceModelConfig[]> = {
  "email-digest": [
    HUGGING_FACE_MODELS.qwen3Small,
    HUGGING_FACE_MODELS.smolLm2Tiny,
  ],
  "file-to-data": [
    HUGGING_FACE_MODELS.qwen3Small,
    HUGGING_FACE_MODELS.smolLm2Tiny,
  ],
  "private-summarizer": [
    HUGGING_FACE_MODELS.smolLm2Tiny,
    HUGGING_FACE_MODELS.qwen3Small,
  ],
  "data-cleaner": [
    HUGGING_FACE_MODELS.qwen3Small,
    HUGGING_FACE_MODELS.smolLm2Tiny,
  ],
  "prompt-builder": [
    HUGGING_FACE_MODELS.qwen3Small,
    HUGGING_FACE_MODELS.smolLm2Tiny,
  ],
  "json-schema": [
    HUGGING_FACE_MODELS.qwen3Small,
    HUGGING_FACE_MODELS.smolLm2Tiny,
  ],
};

export function getHuggingFaceModelCandidates(
  agentId: string,
  device: HuggingFaceModelDevice = "webgpu",
) {
  const models = agentModelOrder[agentId] ?? fallbackModelOrder;

  if (device === "wasm") {
    return [...models].sort((left, right) => {
      const priorityDiff = left.wasmPriority - right.wasmPriority;

      return priorityDiff || models.indexOf(left) - models.indexOf(right);
    });
  }

  return models;
}

export function getPrimaryHuggingFaceModel(agentId: string) {
  return getHuggingFaceModelCandidates(agentId)[0];
}

export function getUniqueHuggingFaceModelCandidates(
  agentIds: string[],
  device: HuggingFaceModelDevice = "webgpu",
) {
  const seen = new Set<string>();

  return agentIds
    .flatMap((agentId) => getHuggingFaceModelCandidates(agentId, device))
    .filter((model) => {
      if (seen.has(model.id)) {
        return false;
      }

      seen.add(model.id);
      return true;
    });
}
