import type { AgentBlueprint } from "./agent-catalog";

export type AgentArtifact = {
  label: string;
  language: "csv" | "json" | "markdown" | "text";
  content: string;
};

export type AgentRunResult = {
  title: string;
  summary: string;
  sections: {
    title: string;
    items: string[];
  }[];
  artifacts: AgentArtifact[];
};

type DataRow = Record<string, string | number | boolean | null>;

const actionWords = [
  "need",
  "please",
  "can you",
  "could you",
  "should",
  "must",
  "todo",
  "next",
  "follow",
  "check",
  "review",
  "send",
  "fix",
  "ship",
  "launch",
];

export function runLocalAgent({
  agent,
  content,
  userPrompt,
}: {
  agent: AgentBlueprint;
  content: string;
  userPrompt: string;
}): AgentRunResult {
  const input = content.trim();

  if (!input) {
    return {
      title: "Add some input to run this agent",
      summary:
        "This agent runs locally in the browser. Paste content or upload a supported text file first.",
      sections: [
        {
          title: "What to try",
          items: [
            "Use the sample input.",
            "Paste email text, notes, CSV, JSON, logs, or a rough agent idea.",
            "Upload a small text-based file when the agent supports files.",
          ],
        },
      ],
      artifacts: [],
    };
  }

  switch (agent.id) {
    case "data-cleaner":
      return runDataCleaner(input, userPrompt);
    case "email-digest":
      return runEmailDigest(input, userPrompt);
    case "file-to-data":
      return runFileToData(input, userPrompt);
    case "json-schema":
      return runJsonSchema(input, userPrompt);
    case "prompt-builder":
      return runPromptBuilder(input, userPrompt);
    case "private-summarizer":
      return runPrivateSummarizer(input, userPrompt);
    default:
      return runPrivateSummarizer(input, userPrompt);
  }
}

export function markdownFromResult(result: AgentRunResult) {
  const sections = result.sections
    .map(
      (section) =>
        `## ${section.title}\n${section.items.map((item) => `- ${item}`).join("\n")}`,
    )
    .join("\n\n");

  const artifacts = result.artifacts
    .map(
      (artifact) =>
        `## ${artifact.label}\n\n\`\`\`${artifact.language}\n${artifact.content}\n\`\`\``,
    )
    .join("\n\n");

  return [`# ${result.title}`, result.summary, sections, artifacts]
    .filter(Boolean)
    .join("\n\n");
}

function runEmailDigest(input: string, userPrompt: string): AgentRunResult {
  const lines = cleanLines(input);
  const subject = findHeader(lines, "subject") ?? inferTitle(input);
  const sender = findHeader(lines, "from") ?? "Unknown sender";
  const questions = lines.filter((line) => line.includes("?"));
  const actionItems = extractActionItems(lines);
  const deadlines = lines.filter((line) =>
    /\b(today|tomorrow|morning|afternoon|tonight|eod|asap|urgent|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}\/\d{1,2})\b/i.test(
      line,
    ),
  );
  const summarySentences = summarizeSentences(input, 3);
  const reply = [
    `Hi ${firstNameFromSender(sender) || "there"},`,
    "",
    "Thanks for the context. I understand the issue and the timing pressure.",
    actionItems.length
      ? `I will ${lowercaseFirst(actionItems[0]).replace(/\.$/, "")}.`
      : "I will review this and come back with the next best step.",
    questions.length
      ? `One quick question: ${questions[0]}`
      : "If there is any extra file, screenshot, or error message, please send it over so I can check faster.",
    "",
    "Best,",
    "Khanh",
  ].join("\n");

  return {
    title: `Digest: ${subject}`,
    summary: summarySentences.join(" "),
    sections: [
      {
        title: "Thread snapshot",
        items: [
          `Sender: ${sender}`,
          `Subject: ${subject}`,
          `Requested style: ${userPrompt || "Practical, warm, and concise"}`,
        ],
      },
      {
        title: "Likely action items",
        items: actionItems.length
          ? actionItems.slice(0, 6)
          : [
              "No explicit action item detected. Ask for the missing next step.",
            ],
      },
      {
        title: "Timing and risk",
        items: [
          deadlines[0] ?? "No hard deadline detected.",
          questions[0] ?? "No direct question detected.",
        ],
      },
    ],
    artifacts: [
      {
        label: "Reply draft",
        language: "text",
        content: reply,
      },
    ],
  };
}

function runFileToData(input: string, userPrompt: string): AgentRunResult {
  const rows = parseRows(input);
  const keyValues = extractKeyValues(input);
  const normalizedRows = rows.length ? rows : keyValues;
  const json = JSON.stringify(normalizedRows, null, 2);
  const csv = rowsToCsv(normalizedRows);

  return {
    title: "Structured data extracted",
    summary:
      normalizedRows.length > 0
        ? `Found ${normalizedRows.length} structured ${normalizedRows.length === 1 ? "row" : "rows"}.`
        : "No table-like rows were detected, so the agent returned a text report instead.",
    sections: [
      {
        title: "Extraction request",
        items: [
          userPrompt || "No custom extraction request provided.",
          rows.length
            ? "Detected a delimited table or JSON array."
            : "Used key-value and paragraph extraction fallback.",
        ],
      },
      {
        title: "Fields",
        items:
          normalizedRows.length > 0
            ? Object.keys(normalizedRows[0] ?? {}).map((field) => field)
            : ["content"],
      },
      {
        title: "Quality notes",
        items: [
          "This free local agent preserves source values and avoids guessing missing fields.",
          "For scanned PDFs or images, pair this with OCR/server extraction later.",
        ],
      },
    ],
    artifacts: [
      {
        label: "JSON output",
        language: "json",
        content: json,
      },
      {
        label: "CSV output",
        language: "csv",
        content: csv,
      },
    ],
  };
}

function runPrivateSummarizer(
  input: string,
  userPrompt: string,
): AgentRunResult {
  const summary = summarizeSentences(input, 4);
  const actionItems = extractActionItems(cleanLines(input));
  const openQuestions = cleanLines(input).filter((line) => line.includes("?"));

  return {
    title: "Private summary",
    summary: summary.join(" "),
    sections: [
      {
        title: "Requested style",
        items: [userPrompt || "Short summary with decisions and next actions."],
      },
      {
        title: "Key points",
        items: summary.length ? summary : ["No summary could be inferred."],
      },
      {
        title: "Next actions",
        items: actionItems.length
          ? actionItems.slice(0, 6)
          : ["No explicit next action detected."],
      },
      {
        title: "Open questions",
        items: openQuestions.length
          ? openQuestions.slice(0, 4)
          : ["No open question detected."],
      },
    ],
    artifacts: [
      {
        label: "Markdown summary",
        language: "markdown",
        content: [
          "## Summary",
          ...summary.map((item) => `- ${item}`),
          "",
          "## Next actions",
          ...(actionItems.length
            ? actionItems.map((item) => `- ${item}`)
            : ["- No explicit next action detected."]),
        ].join("\n"),
      },
    ],
  };
}

function runDataCleaner(input: string, userPrompt: string): AgentRunResult {
  const rows = dedupeRows(parseRows(input).map(normalizeRow));
  const emptyRemoved = Math.max(0, parseRows(input).length - rows.length);
  const json = JSON.stringify(rows, null, 2);

  return {
    title: "Clean table ready",
    summary: `Cleaned ${rows.length} ${rows.length === 1 ? "row" : "rows"}${emptyRemoved ? ` and removed ${emptyRemoved} empty or duplicate rows` : ""}.`,
    sections: [
      {
        title: "Cleanup request",
        items: [
          userPrompt || "Trim fields, normalize obvious values, dedupe rows.",
        ],
      },
      {
        title: "Changes applied",
        items: [
          "Trimmed whitespace around every field.",
          "Normalized email-like fields to lowercase.",
          "Removed fully empty rows.",
          "Deduplicated rows by complete row value.",
        ],
      },
      {
        title: "Columns",
        items:
          rows.length > 0
            ? Object.keys(rows[0] ?? {})
            : [
                "No columns detected. Try CSV, TSV, or copied spreadsheet rows.",
              ],
      },
    ],
    artifacts: [
      {
        label: "Clean CSV",
        language: "csv",
        content: rowsToCsv(rows),
      },
      {
        label: "Clean JSON",
        language: "json",
        content: json,
      },
    ],
  };
}

function runPromptBuilder(input: string, userPrompt: string): AgentRunResult {
  const objective = summarizeSentences(input, 1)[0] ?? input.slice(0, 180);
  const prompt = [
    "You are a focused AI agent.",
    "",
    "## Mission",
    objective,
    "",
    "## Context",
    input,
    "",
    "## Workflow",
    "1. Read the user input carefully.",
    "2. Identify the desired outcome, missing context, and constraints.",
    "3. Produce the result in the requested structure.",
    "4. Flag uncertainty instead of inventing details.",
    "",
    "## Output Format",
    "- Summary",
    "- Findings",
    "- Recommended next steps",
    "- Questions or missing information",
    "",
    "## Quality Bar",
    "Be concise, specific, evidence-grounded, and practical.",
    userPrompt ? `\n## Extra User Direction\n${userPrompt}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    title: "Reusable agent prompt",
    summary:
      "Built a structured instruction with role, mission, workflow, output format, and quality checks.",
    sections: [
      {
        title: "Agent behavior",
        items: [
          "Ground responses in the provided input.",
          "Ask for missing information when the task is underspecified.",
          "Return a predictable structure that can be reused.",
        ],
      },
      {
        title: "Suggested tests",
        items: [
          "Run with a normal input.",
          "Run with missing context.",
          "Run with contradictory context.",
        ],
      },
    ],
    artifacts: [
      {
        label: "Agent prompt",
        language: "markdown",
        content: prompt,
      },
    ],
  };
}

function runJsonSchema(input: string, userPrompt: string): AgentRunResult {
  const rows = parseRows(input);
  const firstRow = rows[0] ?? extractKeyValues(input)[0] ?? { content: input };
  const schema = schemaFromValue(firstRow);

  return {
    title: "JSON schema draft",
    summary:
      "Generated a practical JSON Schema from the provided example and inferred value types.",
    sections: [
      {
        title: "Schema goal",
        items: [userPrompt || "Validate structured extraction output."],
      },
      {
        title: "Inferred fields",
        items: Object.keys(firstRow).map((field) => {
          const value = firstRow[field];
          return `${field}: ${inferJsonType(value)}`;
        }),
      },
      {
        title: "Validation notes",
        items: [
          "Review required fields before using this in production.",
          "Use stricter enums only when the source system truly limits values.",
          "For arrays, add more examples so nested fields can be inferred better.",
        ],
      },
    ],
    artifacts: [
      {
        label: "JSON Schema",
        language: "json",
        content: JSON.stringify(schema, null, 2),
      },
    ],
  };
}

function cleanLines(input: string) {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function findHeader(lines: string[], header: string) {
  const match = lines.find((line) =>
    line.toLowerCase().startsWith(`${header.toLowerCase()}:`),
  );
  return match?.slice(match.indexOf(":") + 1).trim();
}

function inferTitle(input: string) {
  return (
    summarizeSentences(input, 1)[0]?.replace(/\.$/, "") ??
    "Untitled agent input"
  );
}

function summarizeSentences(input: string, count: number) {
  const sentences = input
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 20);

  return sentences
    .map((sentence, index) => ({
      sentence,
      index,
      score:
        Number(/\d/.test(sentence)) +
        Number(/[?]/.test(sentence)) +
        Number(
          /\b(decision|decided|risk|blocked|need|must|ship|launch|failed|customer|deadline|action|next)\b/i.test(
            sentence,
          ),
        ) +
        Math.max(0, 3 - index) / 3,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .sort((a, b) => a.index - b.index)
    .map(({ sentence }) => sentence);
}

function extractActionItems(lines: string[]) {
  return lines.filter((line) =>
    actionWords.some((word) => line.toLowerCase().includes(word)),
  );
}

function firstNameFromSender(sender: string) {
  const withoutEmail = sender.replace(/<[^>]+>/g, "").trim();
  return withoutEmail.split(/\s+/)[0]?.replace(/[^a-z-]/gi, "");
}

function lowercaseFirst(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function parseRows(input: string): DataRow[] {
  const trimmed = input.trim();

  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map((item) => flattenValue(item));
    }
    if (typeof parsed === "object" && parsed) {
      return [flattenValue(parsed)];
    }
  } catch {
    // Continue with delimited parsing.
  }

  const lines = cleanLines(trimmed);
  if (lines.length === 0) {
    return [];
  }

  const delimiter = detectDelimiter(lines);
  if (!delimiter) {
    return lines.map((line, index) => ({
      row: index + 1,
      content: line,
    }));
  }

  const cells = lines.map((line) => splitDelimited(line, delimiter));
  const first = cells[0] ?? [];
  const hasHeader = first.some((cell) => /[a-z]/i.test(cell));
  const headers = hasHeader
    ? first.map((cell, index) => toFieldName(cell || `column_${index + 1}`))
    : first.map((_, index) => `column_${index + 1}`);
  const dataRows = hasHeader ? cells.slice(1) : cells;

  return dataRows
    .map((row) =>
      Object.fromEntries(
        headers.map((header, index) => [header, coerceValue(row[index] ?? "")]),
      ),
    )
    .filter((row) =>
      Object.values(row).some((value) => String(value ?? "").trim()),
    );
}

function detectDelimiter(lines: string[]) {
  const candidates = [",", "\t", "|", ";"];
  return candidates
    .map((delimiter) => ({
      delimiter,
      score: lines
        .slice(0, 5)
        .reduce((total, line) => total + line.split(delimiter).length, 0),
    }))
    .filter((candidate) => candidate.score > lines.slice(0, 5).length + 1)
    .sort((a, b) => b.score - a.score)[0]?.delimiter;
}

function splitDelimited(line: string, delimiter: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === delimiter && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function extractKeyValues(input: string): DataRow[] {
  const pairs = cleanLines(input)
    .map((line) => line.match(/^([^:=]+)\s*[:=]\s*(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => [
      toFieldName(match[1] ?? "field"),
      coerceValue(match[2] ?? ""),
    ]);

  if (pairs.length > 0) {
    return [Object.fromEntries(pairs)];
  }

  return [
    {
      content: input.trim(),
    },
  ];
}

function normalizeRow(row: DataRow): DataRow {
  return Object.fromEntries(
    Object.entries(row)
      .map(([key, value]) => {
        if (
          value === null ||
          typeof value === "boolean" ||
          typeof value === "number"
        ) {
          return [toFieldName(key), value] as const;
        }

        const normalizedValue = String(value).trim();
        return [
          toFieldName(key),
          key.toLowerCase().includes("email")
            ? normalizedValue.toLowerCase()
            : normalizedValue,
        ] as const;
      })
      .filter(([, value]) => String(value ?? "").trim()),
  );
}

function dedupeRows(rows: DataRow[]) {
  const seen = new Set<string>();

  return rows.filter((row) => {
    const key = JSON.stringify(row);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return Object.values(row).some((value) => String(value ?? "").trim());
  });
}

function rowsToCsv(rows: DataRow[]) {
  if (rows.length === 0) {
    return "";
  }

  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const csvRows = rows.map((row) =>
    headers.map((header) => csvEscape(row[header] ?? "")).join(","),
  );

  return [headers.join(","), ...csvRows].join("\n");
}

function csvEscape(value: string | number | boolean | null) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function flattenValue(value: unknown, prefix = ""): DataRow {
  if (Array.isArray(value)) {
    return {
      [prefix || "items"]: JSON.stringify(value),
    };
  }

  if (typeof value !== "object" || value === null) {
    return {
      [prefix || "value"]: coerceValue(String(value ?? "")),
    };
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, nested]) => {
      const field = prefix ? `${prefix}_${toFieldName(key)}` : toFieldName(key);
      if (nested && typeof nested === "object" && !Array.isArray(nested)) {
        return Object.entries(flattenValue(nested, field));
      }
      return [
        [
          field,
          Array.isArray(nested)
            ? JSON.stringify(nested)
            : coerceValue(String(nested ?? "")),
        ],
      ];
    }),
  );
}

function coerceValue(value: string): string | number | boolean | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (/^(true|false)$/i.test(trimmed)) {
    return trimmed.toLowerCase() === "true";
  }
  const numeric = Number(trimmed.replace(/[$,]/g, ""));
  if (Number.isFinite(numeric) && /^[$,\d.\-\s]+$/.test(trimmed)) {
    return numeric;
  }
  return trimmed;
}

function toFieldName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/^$/, "field");
}

function schemaFromValue(row: DataRow) {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: Object.keys(row),
    properties: Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key,
        {
          type: inferJsonType(value),
          description: `Inferred from example value: ${String(value ?? "null")}`,
        },
      ]),
    ),
  };
}

function inferJsonType(value: unknown) {
  if (value === null) {
    return "string";
  }
  if (typeof value === "boolean") {
    return "boolean";
  }
  if (typeof value === "number") {
    return "number";
  }
  if (Array.isArray(value)) {
    return "array";
  }
  if (typeof value === "object") {
    return "object";
  }
  return "string";
}
