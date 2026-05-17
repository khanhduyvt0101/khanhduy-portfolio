import { getHuggingFaceModelCandidates } from "./huggingface-models";

export type AgentRuntime =
  | "browser-ai"
  | "local-model"
  | "server-agent"
  | "hybrid";

export type AgentInput = "email" | "file" | "text";
export type AgentOutput =
  | "checklist"
  | "csv"
  | "json"
  | "reply"
  | "report"
  | "schema"
  | "summary"
  | "table";

export type AgentBlueprint = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  inputs: AgentInput[];
  outputs: AgentOutput[];
  runtime: AgentRuntime;
  privacy: "Local first" | "Hybrid" | "Cloud ready";
  status: "Live" | "Browser AI boosted";
  useCases: string[];
  stack: string[];
  promptLabel: string;
  promptPlaceholder: string;
  inputLabel: string;
  inputPlaceholder: string;
  samplePrompt: string;
  sampleInput: string;
  acceptedFiles?: string;
  systemPrompt: string;
};

function modelStack(agentId: string) {
  return getHuggingFaceModelCandidates(agentId).map((model) => model.label);
}

export type RuntimeLayer = {
  id: AgentRuntime;
  name: string;
  shortName: string;
  description: string;
  bestFor: string;
  fallback: string;
};

export const runtimeLayers: RuntimeLayer[] = [
  {
    id: "browser-ai",
    name: "Browser-native AI",
    shortName: "Chrome AI",
    description:
      "Use built-in browser models such as Chrome Prompt API, Summarizer, Translator, Writer, and Rewriter when the visitor device supports them.",
    bestFor:
      "Private summaries, rewrite flows, translation, and quick text understanding.",
    fallback:
      "Every live agent includes local deterministic fallback logic when browser AI is unavailable.",
  },
  {
    id: "local-model",
    name: "Hugging Face browser model",
    shortName: "HF model",
    description:
      "Run open Hugging Face models through Vercel AI SDK and Transformers.js, with WebGPU first and WASM fallback when the browser supports it.",
    bestFor:
      "Prompt building, summaries, extraction passes, JSON shaping, and private browser-side agent experiments.",
    fallback:
      "If the model cannot load, the agent falls back to deterministic local browser logic.",
  },
  {
    id: "server-agent",
    name: "Server-side tool agents",
    shortName: "Server",
    description:
      "Reserved for future OAuth connectors, long-running workflows, OCR, tool calling, and paid hosted inference.",
    bestFor:
      "Email connectors, large documents, private workspaces, and guaranteed model access.",
    fallback:
      "Current free agents stay usable locally while server workflows are added.",
  },
  {
    id: "hybrid",
    name: "Hybrid runtime",
    shortName: "Auto",
    description:
      "Choose the best runtime per task: Browser AI first, Hugging Face through Vercel AI SDK second, deterministic fallback third, and server agents later when integrations matter.",
    bestFor:
      "Free marketplace agents that should work across Chrome, Safari, mobile, and desktop.",
    fallback:
      "If Chrome AI and Hugging Face browser models are missing, the same page still returns useful structured output.",
  },
];

export const agentBlueprints: AgentBlueprint[] = [
  {
    id: "email-digest",
    name: "Email Digest Agent",
    tagline: "Turn long email threads into decisions, blockers, and replies.",
    description:
      "Paste a support thread, founder inbox note, or customer email. The agent extracts the important context and writes a practical reply draft.",
    inputs: ["email", "text"],
    outputs: ["summary", "checklist", "reply"],
    runtime: "hybrid",
    privacy: "Hybrid",
    status: "Browser AI boosted",
    useCases: [
      "Customer support recap",
      "Founder inbox triage",
      "Follow-up drafts",
    ],
    stack: [
      "Chrome Prompt API",
      "Vercel AI SDK",
      ...modelStack("email-digest"),
      "Reply drafting",
    ],
    promptLabel: "What should the reply optimize for?",
    promptPlaceholder:
      "Example: keep it friendly, explain the next step, and ask one clear question.",
    inputLabel: "Email thread",
    inputPlaceholder:
      "Paste the email thread, support ticket, or conversation here...",
    samplePrompt:
      "Summarize the issue, list the promised next steps, and write a warm reply.",
    sampleInput:
      "From: Taylor\nSubject: PDF export failed twice\n\nHi Khanh,\nThe report export failed twice after I uploaded a 36 page document. I need the CSV before tomorrow morning for a client review. Can you check if my file is too large or if I should retry later?\n\nThanks,\nTaylor",
    systemPrompt:
      "You are an email operations agent. Return a concise summary, action items, risks, and a ready-to-send reply. Do not invent facts.",
  },
  {
    id: "file-to-data",
    name: "File to Data Agent",
    tagline: "Upload text, CSV, JSON, or logs and get structured data back.",
    description:
      "Drop a small file or paste raw content. The agent detects rows, key-value pairs, JSON, and CSV-like tables, then returns copy-ready artifacts.",
    inputs: ["file", "text"],
    outputs: ["json", "csv", "table", "report"],
    runtime: "local-model",
    privacy: "Local first",
    status: "Live",
    useCases: ["Invoice rows", "Research datasets", "Receipt cleanup"],
    stack: [
      "File API",
      "CSV parser",
      "JSON normalizer",
      ...modelStack("file-to-data"),
    ],
    promptLabel: "What data should be extracted?",
    promptPlaceholder:
      "Example: extract customer, amount, due date, and status as JSON.",
    inputLabel: "File content",
    inputPlaceholder:
      "Upload a .txt, .csv, .json, .md, or paste the raw data here...",
    samplePrompt:
      "Return normalized rows with name, email, plan, and monthly amount.",
    sampleInput:
      "name,email,plan,amount\nAva Nguyen, ava@example.com , Pro,$49\nMinh Tran,minh@example.com,Starter,$19\nLinh Pham,linh@example.com, Pro ,49",
    acceptedFiles: ".txt,.csv,.json,.md,.log",
    systemPrompt:
      "You are a file extraction agent. Convert user-provided content into clean structured data. Preserve source values and flag uncertainty.",
  },
  {
    id: "private-summarizer",
    name: "Private Summarizer",
    tagline:
      "Summarize pasted content locally before anything touches a server.",
    description:
      "Use Browser AI when available, then a Hugging Face model through Vercel AI SDK, with a deterministic summarization fallback for articles, meeting notes, documentation, and research snippets.",
    inputs: ["text"],
    outputs: ["summary", "checklist", "report"],
    runtime: "browser-ai",
    privacy: "Local first",
    status: "Browser AI boosted",
    useCases: ["Article summaries", "Meeting notes", "Research notes"],
    stack: [
      "Chrome Prompt API",
      "Vercel AI SDK",
      ...modelStack("private-summarizer"),
      "Extractive fallback",
    ],
    promptLabel: "Summary style",
    promptPlaceholder:
      "Example: executive summary, bullet points, risks, and next actions.",
    inputLabel: "Content to summarize",
    inputPlaceholder: "Paste article text, notes, docs, or research here...",
    samplePrompt:
      "Create a short executive summary with decisions and open questions.",
    sampleInput:
      "The team agreed to ship the new onboarding flow next week if the activation metric stays above 42%. The main concern is support volume from users importing old data. Engineering will add a rollback flag. Design will simplify the empty state. Customer success asked for a migration checklist before launch.",
    systemPrompt:
      "You are a private summarization agent. Summarize only the provided text. Include decisions, risks, and next actions when present.",
  },
  {
    id: "data-cleaner",
    name: "Data Cleaner Agent",
    tagline: "Normalize messy lists, copied tables, and exported CSV content.",
    description:
      "Clean whitespace, infer columns, normalize common email/name fields, remove empty rows, deduplicate obvious repeats, and return CSV plus JSON.",
    inputs: ["file", "text"],
    outputs: ["csv", "json", "table"],
    runtime: "local-model",
    privacy: "Local first",
    status: "Live",
    useCases: ["Lead lists", "CSV cleanup", "Spreadsheet prep"],
    stack: [
      "Local parser",
      "Deduping",
      "Schema cleanup",
      ...modelStack("data-cleaner"),
    ],
    promptLabel: "Cleanup goal",
    promptPlaceholder:
      "Example: normalize emails, trim names, remove duplicates, keep all columns.",
    inputLabel: "Messy data",
    inputPlaceholder:
      "Paste CSV, TSV, copied spreadsheet rows, or newline-separated values...",
    samplePrompt: "Clean this contact list and remove duplicate email rows.",
    sampleInput:
      "Name , Email , Company\n  Anna Lee , ANNA@Example.com, Acme\nAnna Lee, anna@example.com ,Acme\nBao Tran, bao@demo.io, Demo Co\n, ,",
    acceptedFiles: ".txt,.csv,.tsv,.md,.log",
    systemPrompt:
      "You are a data cleaning agent. Normalize messy rows into a clean table, report assumptions, and never drop non-empty information silently.",
  },
  {
    id: "prompt-builder",
    name: "Prompt Builder Agent",
    tagline: "Convert a rough idea into a crisp AI agent instruction.",
    description:
      "Write a reusable prompt with role, context, inputs, workflow, output format, safety checks, and evaluation criteria.",
    inputs: ["text"],
    outputs: ["report", "checklist"],
    runtime: "hybrid",
    privacy: "Local first",
    status: "Live",
    useCases: ["Agent specs", "Reusable prompts", "Workflow docs"],
    stack: [
      "Vercel AI SDK",
      ...modelStack("prompt-builder"),
      "Prompt patterns",
      "Quality checklist",
    ],
    promptLabel: "Target model or workflow",
    promptPlaceholder:
      "Example: an agent that reviews PRs and only comments on real bugs.",
    inputLabel: "Rough agent idea",
    inputPlaceholder:
      "Describe the agent you want, what inputs it receives, and what good output looks like...",
    samplePrompt: "Make it suitable for a customer-support triage agent.",
    sampleInput:
      "I want an AI that reads a support message, figures out the likely product area, lists what information is missing, and writes a reply that is short and friendly.",
    systemPrompt:
      "You are a prompt engineering agent. Produce a direct, reusable agent instruction with inputs, process, output format, and guardrails.",
  },
  {
    id: "json-schema",
    name: "JSON Schema Agent",
    tagline: "Turn examples into a typed JSON contract.",
    description:
      "Paste JSON, CSV, logs, or a natural-language object description. The agent proposes a practical JSON schema and validation notes.",
    inputs: ["file", "text"],
    outputs: ["schema", "json", "report"],
    runtime: "local-model",
    privacy: "Local first",
    status: "Live",
    useCases: ["API contracts", "Extraction schemas", "Structured outputs"],
    stack: [
      "Schema inference",
      "Type detection",
      "Validation notes",
      ...modelStack("json-schema"),
    ],
    promptLabel: "Schema goal",
    promptPlaceholder:
      "Example: schema for extracting invoice line items with required totals.",
    inputLabel: "Example data or object description",
    inputPlaceholder:
      "Paste JSON, CSV, logs, or describe the object shape you need...",
    samplePrompt:
      "Create a strict schema for structured output from a document extraction agent.",
    sampleInput:
      '{"invoice_number":"INV-1029","customer":"Acme Labs","total":1299.5,"paid":false,"line_items":[{"description":"API usage","quantity":1,"amount":1299.5}]}',
    acceptedFiles: ".txt,.csv,.json,.md,.log",
    systemPrompt:
      "You are a schema design agent. Infer a useful JSON Schema from examples. Include assumptions and required fields.",
  },
];

export function getRuntimeLayer(runtime: AgentRuntime) {
  return (
    runtimeLayers.find((layer) => layer.id === runtime) ?? runtimeLayers[3]
  );
}

export function getAgentBlueprint(id: string) {
  return agentBlueprints.find((agent) => agent.id === id);
}
