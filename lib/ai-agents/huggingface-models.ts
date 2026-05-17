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
export type HuggingFaceModelProfile = "balanced" | "fast" | "reasoning";
export type HuggingFaceModelTarget =
  | string
  | {
      id: string;
      modelProfile?: HuggingFaceModelProfile;
    };

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

const modelProfiles: Record<HuggingFaceModelProfile, HuggingFaceModelConfig[]> =
  {
    balanced: [HUGGING_FACE_MODELS.qwen3Small, HUGGING_FACE_MODELS.smolLm2Tiny],
    fast: [HUGGING_FACE_MODELS.smolLm2Tiny, HUGGING_FACE_MODELS.qwen3Small],
    reasoning: [
      HUGGING_FACE_MODELS.qwen3Small,
      HUGGING_FACE_MODELS.smolLm2Tiny,
    ],
  };

export function getHuggingFaceModelCandidates(
  target: HuggingFaceModelTarget,
  device: HuggingFaceModelDevice = "webgpu",
) {
  const models =
    modelProfiles[getModelProfile(target)] ?? modelProfiles.balanced;

  if (device === "wasm") {
    return [...models].sort((left, right) => {
      const priorityDiff = left.wasmPriority - right.wasmPriority;

      return priorityDiff || models.indexOf(left) - models.indexOf(right);
    });
  }

  return models;
}

export function getPrimaryHuggingFaceModel(target: HuggingFaceModelTarget) {
  return getHuggingFaceModelCandidates(target)[0];
}

export function getUniqueHuggingFaceModelCandidates(
  targets: HuggingFaceModelTarget[],
  device: HuggingFaceModelDevice = "webgpu",
) {
  const seen = new Set<string>();

  return targets
    .flatMap((target) => getHuggingFaceModelCandidates(target, device))
    .filter((model) => {
      if (seen.has(model.id)) {
        return false;
      }

      seen.add(model.id);
      return true;
    });
}

function getModelProfile(
  target: HuggingFaceModelTarget,
): HuggingFaceModelProfile {
  if (typeof target !== "string") {
    return target.modelProfile ?? inferModelProfileFromId(target.id);
  }

  return inferModelProfileFromId(target);
}

function inferModelProfileFromId(agentId: string): HuggingFaceModelProfile {
  return agentId.includes("summar") || agentId.includes("rewrite")
    ? "fast"
    : "balanced";
}
