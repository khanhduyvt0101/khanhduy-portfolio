export type HuggingFaceModelConfig = {
  id: string;
  label: string;
  bestFor: string;
  maxOutputTokens: number;
  webgpuDtype: "q4" | "q4f16" | "fp16";
  wasmDtype: "q8" | "q4";
};

export const HUGGING_FACE_MODELS = {
  qwen3Small: {
    id: "onnx-community/Qwen3-0.6B-ONNX",
    label: "Qwen3 0.6B",
    bestFor: "multi-step reasoning, extraction, JSON, schemas, and replies",
    maxOutputTokens: 640,
    webgpuDtype: "q4f16",
    wasmDtype: "q8",
  },
  smolLm2Medium: {
    id: "HuggingFaceTB/SmolLM2-360M-Instruct",
    label: "SmolLM2 360M",
    bestFor: "summaries, rewrite-style responses, and general instructions",
    maxOutputTokens: 560,
    webgpuDtype: "q4",
    wasmDtype: "q8",
  },
  smolLm2Tiny: {
    id: "HuggingFaceTB/SmolLM2-135M-Instruct",
    label: "SmolLM2 135M",
    bestFor: "fast browser fallback on smaller devices",
    maxOutputTokens: 420,
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

export function getHuggingFaceModelCandidates(agentId: string) {
  return agentModelOrder[agentId] ?? fallbackModelOrder;
}

export function getPrimaryHuggingFaceModel(agentId: string) {
  return getHuggingFaceModelCandidates(agentId)[0];
}

export function getUniqueHuggingFaceModelCandidates(agentIds: string[]) {
  const seen = new Set<string>();

  return agentIds
    .flatMap((agentId) => getHuggingFaceModelCandidates(agentId))
    .filter((model) => {
      if (seen.has(model.id)) {
        return false;
      }

      seen.add(model.id);
      return true;
    });
}
