import {
  getHuggingFaceModelCandidates,
  type HuggingFaceModelProfile,
} from "./huggingface-models";

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
export type AgentIconKey =
  | "bot"
  | "calendar"
  | "data"
  | "email"
  | "file"
  | "gauge"
  | "prompt"
  | "schema"
  | "summary";

export type AgentWorkflow = {
  label: string;
  description?: string;
  prompt?: string;
};

export type AgentBlueprint = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon?: AgentIconKey;
  inputs: AgentInput[];
  outputs: AgentOutput[];
  workflows?: AgentWorkflow[];
  runtime: AgentRuntime;
  modelProfile?: HuggingFaceModelProfile;
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
  executionMode?: "deterministic-first" | "model-first";
  systemPrompt: string;
};

function modelStack(modelProfile?: HuggingFaceModelProfile) {
  return getHuggingFaceModelCandidates({
    id: modelProfile ?? "balanced",
    modelProfile,
  }).map((model) => model.label);
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

const agentDefinitions = [
  {
    id: "email-digest",
    name: "Email Digest Agent",
    tagline: "Turn long email threads into decisions, blockers, and replies.",
    description:
      "Paste a support thread, founder inbox note, or customer email. The agent extracts the important context and writes a practical reply draft.",
    icon: "email",
    inputs: ["email", "text"],
    outputs: ["summary", "checklist", "reply"],
    workflows: [
      {
        label: "Support triage",
        description: "Classify urgency, missing info, and next owner.",
        prompt:
          "Triage this support thread. Return urgency, sentiment, missing information, likely owner, and a short customer-safe reply.",
      },
      {
        label: "Executive digest",
        description: "Summarize decisions, blockers, and deadlines.",
        prompt:
          "Summarize this thread for a busy founder. Include decisions, blockers, promised next steps, deadlines, and what to ask next.",
      },
      {
        label: "Reply draft",
        description: "Write a warm answer with one clear ask.",
        prompt:
          "Draft a warm, concise reply. Acknowledge the issue, explain the next step, ask only one needed question, and avoid overpromising.",
      },
    ],
    runtime: "hybrid",
    modelProfile: "reasoning",
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
      ...modelStack("reasoning"),
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
    icon: "file",
    inputs: ["file", "text"],
    outputs: ["json", "csv", "table", "report"],
    workflows: [
      {
        label: "Extract rows",
        description: "Turn messy text into a table plus JSON.",
        prompt:
          "Extract normalized rows. Preserve source values, name each field clearly, and flag missing or uncertain values.",
      },
      {
        label: "Data dictionary",
        description: "Profile columns for downstream systems.",
        prompt:
          "Create structured rows and a data dictionary with inferred field types, sample values, and empty-value notes.",
      },
      {
        label: "Import package",
        description: "Prepare CSV, JSON, and validation notes.",
        prompt:
          "Prepare this content for import into another system. Return CSV, JSON, validation issues, and cleanup recommendations.",
      },
    ],
    runtime: "local-model",
    modelProfile: "reasoning",
    privacy: "Local first",
    status: "Live",
    useCases: ["Invoice rows", "Research datasets", "Receipt cleanup"],
    stack: [
      "File API",
      "CSV parser",
      "JSON normalizer",
      ...modelStack("reasoning"),
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
    icon: "summary",
    inputs: ["text"],
    outputs: ["summary", "checklist", "report"],
    workflows: [
      {
        label: "Meeting recap",
        description: "Extract decisions, action items, and open questions.",
        prompt:
          "Create a private meeting recap with decisions, action items, owners if present, risks, and open questions.",
      },
      {
        label: "Research brief",
        description: "Compress source material into a briefing note.",
        prompt:
          "Turn this into a research brief with key findings, caveats, evidence points, and recommended next steps.",
      },
      {
        label: "Decision log",
        description: "Pull out commitments and unresolved risks.",
        prompt:
          "Extract a decision log. Include decisions, risks, dependencies, follow-ups, and anything that still needs human review.",
      },
    ],
    runtime: "browser-ai",
    modelProfile: "fast",
    privacy: "Local first",
    status: "Browser AI boosted",
    useCases: ["Article summaries", "Meeting notes", "Research notes"],
    stack: [
      "Chrome Prompt API",
      "Vercel AI SDK",
      ...modelStack("fast"),
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
    id: "day-planner",
    name: "Day Planner Agent",
    tagline: "Turn a messy life-admin brain dump into a realistic day plan.",
    description:
      "Paste tasks, appointments, errands, chores, budget reminders, study goals, or wellness notes. The agent prioritizes the list, batches related work, creates a time-blocked plan, and exports a checklist plus calendar-ready rows.",
    icon: "calendar",
    inputs: ["text"],
    outputs: ["checklist", "json", "table", "report"],
    workflows: [
      {
        label: "Daily reset",
        description: "Build a doable plan from scattered notes.",
        prompt:
          "Turn this brain dump into a realistic day plan. Prioritize urgent tasks, batch errands and admin, leave buffer time, and mark what can move.",
      },
      {
        label: "Life admin sprint",
        description: "Batch chores, errands, money, and messages.",
        prompt:
          "Plan a focused life-admin sprint. Group errands, chores, finance tasks, appointments, and messages into a low-friction sequence.",
      },
      {
        label: "Busy week triage",
        description: "Sort today, later, delegate, and drop.",
        prompt:
          "Triage this list into today, later this week, delegate or ask, and drop. Return the smallest useful plan for today.",
      },
    ],
    runtime: "hybrid",
    modelProfile: "fast",
    privacy: "Local first",
    status: "Browser AI boosted",
    useCases: ["Daily planning", "Household admin", "Errand batching"],
    stack: [
      "Chrome Prompt API",
      "Task parser",
      "Priority scoring",
      "Time blocking",
      ...modelStack("fast"),
    ],
    promptLabel: "Planning constraints",
    promptPlaceholder:
      "Example: start at 9, stop by 5, keep lunch free, make this realistic.",
    inputLabel: "Brain dump",
    inputPlaceholder:
      "Paste tasks, appointments, chores, errands, reminders, deadlines, and random notes...",
    samplePrompt:
      "Start at 8:30, keep a 45 minute lunch, make a realistic plan with errands batched.",
    sampleInput:
      "9:30 dentist appointment\nPay electricity bill today\nBuy groceries: rice, eggs, vegetables, coffee\nReply to Minh about the contract\nDeep work on portfolio agent for 2 hours\nPick up dry cleaning after 5pm\nCall mom tonight\n30 min workout\nReview monthly spending and cancel unused subscriptions\nRead 20 pages of the TypeScript book",
    executionMode: "deterministic-first",
    systemPrompt:
      "You are a daily planning agent. Convert messy personal and work tasks into a realistic schedule, priority list, errand batches, and checklist. Do not invent appointments or deadlines.",
  },
  {
    id: "data-cleaner",
    name: "Data Cleaner Agent",
    tagline: "Normalize messy lists, copied tables, and exported CSV content.",
    description:
      "Clean whitespace, infer columns, normalize common email/name fields, remove empty rows, deduplicate obvious repeats, and return CSV plus JSON.",
    icon: "gauge",
    inputs: ["file", "text"],
    outputs: ["csv", "json", "table"],
    workflows: [
      {
        label: "Clean contacts",
        description: "Normalize names, emails, and duplicates.",
        prompt:
          "Clean this contact list. Normalize email casing, trim whitespace, remove exact duplicates, and keep every non-empty field.",
      },
      {
        label: "Spreadsheet prep",
        description: "Prepare copied rows for spreadsheet import.",
        prompt:
          "Prepare this data for spreadsheet import. Normalize column names, remove empty rows, deduplicate, and report quality issues.",
      },
      {
        label: "QA report",
        description: "Show what changed before exporting.",
        prompt:
          "Clean the data and produce a data quality report with removed rows, duplicate count, empty fields, and final columns.",
      },
    ],
    runtime: "local-model",
    modelProfile: "reasoning",
    privacy: "Local first",
    status: "Live",
    useCases: ["Lead lists", "CSV cleanup", "Spreadsheet prep"],
    stack: [
      "Local parser",
      "Deduping",
      "Schema cleanup",
      ...modelStack("reasoning"),
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
    icon: "prompt",
    inputs: ["text"],
    outputs: ["report", "checklist"],
    workflows: [
      {
        label: "Agent spec",
        description: "Role, mission, workflow, and outputs.",
        prompt:
          "Turn this idea into a reusable agent spec with role, mission, input contract, workflow, output format, and quality bar.",
      },
      {
        label: "Guardrail pass",
        description: "Add failure modes and escalation rules.",
        prompt:
          "Strengthen this prompt with guardrails, refusal or escalation cases, uncertainty handling, and anti-hallucination checks.",
      },
      {
        label: "Eval checklist",
        description: "Create tests for reliable agent behavior.",
        prompt:
          "Create the agent prompt plus an evaluation checklist with happy path, missing context, contradiction, edge-case, and safety tests.",
      },
    ],
    runtime: "hybrid",
    modelProfile: "reasoning",
    privacy: "Local first",
    status: "Live",
    useCases: ["Agent specs", "Reusable prompts", "Workflow docs"],
    stack: [
      "Vercel AI SDK",
      ...modelStack("reasoning"),
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
    icon: "schema",
    inputs: ["file", "text"],
    outputs: ["schema", "json", "report"],
    workflows: [
      {
        label: "Strict schema",
        description: "Infer a JSON Schema for structured output.",
        prompt:
          "Create a strict JSON Schema for structured AI output. Include required fields, additionalProperties false, and validation notes.",
      },
      {
        label: "TypeScript contract",
        description: "Generate schema plus a typed interface.",
        prompt:
          "Create JSON Schema plus a TypeScript interface and Zod validator for this example shape.",
      },
      {
        label: "Extraction schema",
        description: "Design fields for document extraction.",
        prompt:
          "Design a schema for document extraction. Include field descriptions, required fields, assumptions, and fields that may need review.",
      },
    ],
    runtime: "local-model",
    modelProfile: "reasoning",
    privacy: "Local first",
    status: "Live",
    useCases: ["API contracts", "Extraction schemas", "Structured outputs"],
    stack: [
      "Schema inference",
      "Type detection",
      "Validation notes",
      ...modelStack("reasoning"),
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
] satisfies AgentBlueprint[];

export const agentBlueprints: AgentBlueprint[] =
  defineAgentBlueprints(agentDefinitions);

export function getRuntimeLayer(runtime: AgentRuntime) {
  return (
    runtimeLayers.find((layer) => layer.id === runtime) ?? runtimeLayers[3]
  );
}

export function getAgentBlueprint(id: string) {
  return agentBlueprints.find((agent) => agent.id === id);
}

export function getAgentWorkflowLabels(agent: AgentBlueprint) {
  return (
    agent.workflows?.length
      ? agent.workflows.map((workflow) => workflow.label)
      : agent.useCases
  ).filter(Boolean);
}

function getAgentWorkflowSearchText(agent: AgentBlueprint) {
  return (
    agent.workflows?.flatMap((workflow) => [
      workflow.label,
      workflow.description ?? "",
      workflow.prompt ?? "",
    ]) ?? []
  );
}

export function getAgentSearchText(agent: AgentBlueprint) {
  return [
    agent.name,
    agent.tagline,
    agent.description,
    ...agent.inputs,
    ...agent.outputs,
    ...agent.useCases,
    ...getAgentWorkflowLabels(agent),
    ...getAgentWorkflowSearchText(agent),
    ...agent.stack,
  ].join(" ");
}

function defineAgentBlueprints(agents: AgentBlueprint[]): AgentBlueprint[] {
  if (process.env.NODE_ENV !== "production") {
    validateAgentBlueprints(agents);
  }

  return agents.map((agent) => ({
    ...agent,
    icon: agent.icon ?? inferAgentIcon(agent),
    modelProfile: agent.modelProfile ?? inferAgentModelProfile(agent),
    workflows:
      agent.workflows && agent.workflows.length > 0
        ? agent.workflows
        : agent.useCases.map((useCase) => ({ label: useCase })),
    stack: mergeUnique([
      ...agent.stack,
      ...modelStack(agent.modelProfile ?? inferAgentModelProfile(agent)),
    ]),
  }));
}

function validateAgentBlueprints(agents: AgentBlueprint[]) {
  const ids = new Set<string>();
  const duplicateIds = new Set<string>();

  for (const agent of agents) {
    if (ids.has(agent.id)) {
      duplicateIds.add(agent.id);
    }

    ids.add(agent.id);

    if (
      agent.inputs.length === 0 ||
      agent.outputs.length === 0 ||
      agent.useCases.length === 0 ||
      agent.stack.length === 0
    ) {
      throw new Error(
        `Agent "${agent.id}" is missing inputs, outputs, use cases, or stack items.`,
      );
    }
  }

  if (duplicateIds.size > 0) {
    throw new Error(
      `Duplicate AI agent ids: ${Array.from(duplicateIds).join(", ")}`,
    );
  }
}

function inferAgentIcon(agent: AgentBlueprint): AgentIconKey {
  if (agent.outputs.includes("schema")) {
    return "schema";
  }

  if (agent.outputs.includes("csv") || agent.outputs.includes("table")) {
    return "data";
  }

  if (agent.inputs.includes("email")) {
    return "email";
  }

  if (agent.inputs.includes("file")) {
    return "file";
  }

  if (agent.outputs.includes("summary")) {
    return "summary";
  }

  return agent.runtime === "hybrid" ? "prompt" : "bot";
}

function inferAgentModelProfile(
  agent: Pick<AgentBlueprint, "outputs" | "runtime">,
): HuggingFaceModelProfile {
  if (
    agent.outputs.includes("json") ||
    agent.outputs.includes("schema") ||
    agent.outputs.includes("csv") ||
    agent.outputs.includes("reply")
  ) {
    return "reasoning";
  }

  return agent.runtime === "browser-ai" ? "fast" : "balanced";
}

function mergeUnique(values: string[]) {
  return values.filter((value, index) => values.indexOf(value) === index);
}
