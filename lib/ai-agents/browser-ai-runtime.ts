import { browserAI, doesBrowserSupportBrowserAI } from "@browser-ai/core";
import { generateText } from "ai";

import type { AgentBlueprint } from "./agent-catalog";

type BrowserAiAvailability =
  | "available"
  | "available-after-download"
  | "downloadable"
  | "downloading"
  | "unavailable";

export type BrowserAiStatus =
  | "available"
  | "downloadable"
  | "downloading"
  | "fallback"
  | "running"
  | "unavailable";

export type BrowserAiRun = {
  text: string;
  runtime: "chrome-ai";
};

function isAutomationBrowser() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return navigator.webdriver || navigator.userAgent.includes("HeadlessChrome");
}

function canUseBrowserAiRuntime() {
  return (
    typeof window !== "undefined" &&
    !isAutomationBrowser() &&
    doesBrowserSupportBrowserAI()
  );
}

function normalizeAvailability(
  availability: BrowserAiAvailability | string,
): BrowserAiStatus {
  if (availability === "available") {
    return "available";
  }

  if (
    availability === "available-after-download" ||
    availability === "downloadable"
  ) {
    return "downloadable";
  }

  if (availability === "downloading") {
    return "downloading";
  }

  return "unavailable";
}

function createBrowserAiModel({
  onStatus,
}: {
  onStatus?: (message: string) => void;
} = {}) {
  return browserAI("text", {
    expectedInputs: [{ type: "text", languages: ["en"] }],
    expectedOutputs: [{ type: "text", languages: ["en"] }],
    onContextOverflow: () => {
      onStatus?.("Browser AI reached its local context window.");
    },
  });
}

export function hasBrowserAi() {
  return canUseBrowserAiRuntime();
}

export async function getBrowserAiAvailability() {
  if (!canUseBrowserAiRuntime()) {
    return "unavailable" satisfies BrowserAiStatus;
  }

  try {
    const availability = await createBrowserAiModel().availability();
    return normalizeAvailability(availability);
  } catch {
    return "fallback" satisfies BrowserAiStatus;
  }
}

export async function runBrowserAiAgent({
  agent,
  content,
  userPrompt,
  onStatus,
}: {
  agent: AgentBlueprint;
  content: string;
  userPrompt: string;
  onStatus?: (message: string) => void;
}): Promise<BrowserAiRun> {
  if (!canUseBrowserAiRuntime()) {
    throw new Error("Browser AI is not available in this browser.");
  }

  const model = createBrowserAiModel({ onStatus });
  const availability = normalizeAvailability(await model.availability());

  if (availability === "unavailable" || availability === "fallback") {
    throw new Error("Browser AI cannot run on this device.");
  }

  if (availability !== "available") {
    await model.createSessionWithProgress((progress) => {
      onStatus?.(
        `Downloading Browser AI model: ${Math.round(progress * 100)}%`,
      );
    });
  }

  const result = await generateText({
    maxOutputTokens: 900,
    model,
    prompt: [
      `User request: ${userPrompt || "Use the default agent workflow."}`,
      "",
      "Input:",
      content,
      "",
      "Return clear sections and copy-ready artifacts when useful.",
    ].join("\n"),
    system: agent.systemPrompt,
    temperature: 0.2,
  });
  const text = result.text.trim();

  if (!text) {
    throw new Error("Browser AI returned an empty response.");
  }

  return {
    runtime: "chrome-ai",
    text,
  };
}
