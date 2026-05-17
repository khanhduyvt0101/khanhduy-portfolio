import type { AgentBlueprint } from "./agent-catalog";

export type AgentArtifact = {
  label: string;
  language: "csv" | "json" | "markdown" | "text" | "typescript";
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

type FieldProfile = {
  empty: number;
  filled: number;
  name: string;
  samples: string[];
  type: string;
};

type DayTask = {
  category: string;
  deadline: string;
  durationMinutes: number;
  energy: "high" | "low" | "medium";
  priority: "high" | "low" | "medium";
  raw: string;
  startHintMinutes: number | null;
  title: string;
};

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
    case "day-planner":
      return runDayPlanner(input, userPrompt);
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

function runDayPlanner(input: string, userPrompt: string): AgentRunResult {
  const tasks = cleanLines(input).map(parseDayTask);
  const sortedTasks = [...tasks].sort(compareDayTasks);
  const window = inferPlanningWindow(userPrompt);
  const schedule = buildDaySchedule(sortedTasks, window);
  const todayTasks = sortedTasks.filter((task) => task.priority !== "low");
  const movableTasks = sortedTasks.filter((task) => task.priority === "low");
  const errands = sortedTasks.filter((task) =>
    ["errand", "household", "finance", "health"].includes(task.category),
  );
  const totalMinutes = sortedTasks.reduce(
    (total, task) => total + task.durationMinutes,
    0,
  );

  return {
    title: "Realistic day plan",
    summary: `Planned ${sortedTasks.length} task${sortedTasks.length === 1 ? "" : "s"} into ${schedule.length} time block${schedule.length === 1 ? "" : "s"} with ${formatDuration(totalMinutes)} of estimated work.`,
    sections: [
      {
        title: "Planning constraints",
        items: [
          userPrompt ||
            `Default day window: ${formatTime(window.startMinutes)}-${formatTime(window.endMinutes)}.`,
          "High-priority items are scheduled first, with short buffers between work blocks.",
          "Low-priority items are marked as movable instead of overloading the day.",
        ],
      },
      {
        title: "Top priorities",
        items: todayTasks.length
          ? todayTasks.slice(0, 6).map(formatTaskLine)
          : ["No high or medium priority task detected."],
      },
      {
        title: "Time-blocked plan",
        items: schedule.length
          ? schedule.map(
              (block) =>
                `${formatTime(block.start)}-${formatTime(block.end)}: ${block.task.title} (${block.task.category}, ${block.task.energy} energy)`,
            )
          : ["No schedule could be built from the current input."],
      },
      {
        title: "Errands and admin batch",
        items: errands.length
          ? errands.map(formatTaskLine).slice(0, 6)
          : ["No household, errand, finance, or health admin detected."],
      },
      {
        title: "Move or shrink",
        items: movableTasks.length
          ? movableTasks.map(formatTaskLine).slice(0, 6)
          : [
              "No obvious low-priority carry-over task detected. Keep a 15-30 minute buffer anyway.",
            ],
      },
    ],
    artifacts: [
      {
        label: "Today checklist",
        language: "markdown",
        content: [
          "## Today",
          ...todayTasks.map((task) => `- [ ] ${formatTaskLine(task)}`),
          "",
          "## Later or optional",
          ...(movableTasks.length
            ? movableTasks.map((task) => `- [ ] ${formatTaskLine(task)}`)
            : ["- [ ] Protect buffer time instead of adding more work."]),
        ].join("\n"),
      },
      {
        label: "Task plan JSON",
        language: "json",
        content: JSON.stringify(
          {
            constraints: userPrompt || null,
            day_window: {
              start: formatTime(window.startMinutes),
              end: formatTime(window.endMinutes),
            },
            tasks: sortedTasks,
            schedule: schedule.map((block) => ({
              start: formatTime(block.start),
              end: formatTime(block.end),
              title: block.task.title,
              category: block.task.category,
              priority: block.task.priority,
              energy: block.task.energy,
            })),
          },
          null,
          2,
        ),
      },
      {
        label: "Calendar import CSV",
        language: "csv",
        content: dayScheduleToCsv(schedule),
      },
      {
        label: "Daily brief",
        language: "markdown",
        content: [
          "## Focus",
          ...(todayTasks.length
            ? todayTasks.slice(0, 3).map((task) => `- ${task.title}`)
            : ["- Pick one priority before adding more tasks."]),
          "",
          "## Watch-outs",
          `- Estimated load: ${formatDuration(totalMinutes)}.`,
          `- Scheduled load: ${formatDuration(schedule.reduce((total, block) => total + block.task.durationMinutes, 0))}.`,
          "- Move low-priority tasks if the first two blocks slip.",
          "- Batch errands before opening new admin tasks.",
        ].join("\n"),
      },
    ],
  };
}

function runEmailDigest(input: string, userPrompt: string): AgentRunResult {
  const lines = cleanLines(input);
  const subject = findHeader(lines, "subject") ?? inferTitle(input);
  const sender = findHeader(lines, "from") ?? "Unknown sender";
  const questions = lines.filter((line) => line.includes("?"));
  const actionItems = extractActionItems(lines);
  const urgency = inferUrgency(lines);
  const sentiment = inferSentiment(lines);
  const missingInfo = inferMissingInfo(lines);
  const likelyOwner = inferLikelyOwner(lines);
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
          `Urgency: ${urgency}`,
          `Sentiment: ${sentiment}`,
          `Likely owner: ${likelyOwner}`,
          deadlines[0] ?? "No hard deadline detected.",
          questions[0] ?? "No direct question detected.",
        ],
      },
      {
        title: "Missing information",
        items: missingInfo.length
          ? missingInfo
          : [
              "No obvious missing context detected. Ask for screenshots, file names, IDs, or timestamps only if needed.",
            ],
      },
    ],
    artifacts: [
      {
        label: "Support triage card",
        language: "json",
        content: JSON.stringify(
          {
            subject,
            sender,
            urgency,
            sentiment,
            likely_owner: likelyOwner,
            deadline: deadlines[0] ?? null,
            customer_questions: questions.slice(0, 3),
            action_items: actionItems.slice(0, 6),
            missing_information: missingInfo,
          },
          null,
          2,
        ),
      },
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
  const fieldProfiles = profileRows(normalizedRows);
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
            ? fieldProfiles.map(
                (field) =>
                  `${field.name}: ${field.type}, ${field.filled}/${normalizedRows.length} filled`,
              )
            : ["content"],
      },
      {
        title: "Quality notes",
        items: [
          "This free local agent preserves source values and avoids guessing missing fields.",
          ...fieldProfiles
            .filter((field) => field.empty > 0)
            .slice(0, 4)
            .map((field) => `${field.name} has ${field.empty} empty value(s).`),
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
      {
        label: "Data dictionary",
        language: "markdown",
        content: dataDictionaryMarkdown(fieldProfiles),
      },
      {
        label: "Validation report",
        language: "json",
        content: JSON.stringify(
          {
            row_count: normalizedRows.length,
            fields: fieldProfiles,
            recommendations: [
              "Review empty fields before import.",
              "Add source-specific validation rules when this feeds an automated workflow.",
              "Use the JSON Schema agent when another system needs a strict contract.",
            ],
          },
          null,
          2,
        ),
      },
    ],
  };
}

function runPrivateSummarizer(
  input: string,
  userPrompt: string,
): AgentRunResult {
  const summary = summarizeSentences(input, 4);
  const lines = cleanLines(input);
  const actionItems = extractActionItems(lines);
  const openQuestions = lines.filter((line) => line.includes("?"));
  const decisions = findKeywordLines(
    lines,
    /\b(agree|agreed|decide|decided|decision|approved|ship|launch)\b/i,
  );
  const risks = findKeywordLines(
    lines,
    /\b(risk|concern|blocked|blocker|issue|failed|delay|problem)\b/i,
  );

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
      {
        title: "Decisions and risks",
        items: [
          ...(decisions.length
            ? decisions.slice(0, 4).map((item) => `Decision: ${item}`)
            : ["No explicit decision detected."]),
          ...(risks.length
            ? risks.slice(0, 4).map((item) => `Risk: ${item}`)
            : ["No explicit risk detected."]),
        ],
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
      {
        label: "Decision log",
        language: "markdown",
        content: [
          "## Decisions",
          ...(decisions.length
            ? decisions.map((item) => `- ${item}`)
            : ["- No explicit decision detected."]),
          "",
          "## Risks",
          ...(risks.length
            ? risks.map((item) => `- ${item}`)
            : ["- No explicit risk detected."]),
          "",
          "## Open Questions",
          ...(openQuestions.length
            ? openQuestions.map((item) => `- ${item}`)
            : ["- No open question detected."]),
        ].join("\n"),
      },
    ],
  };
}

function runDataCleaner(input: string, userPrompt: string): AgentRunResult {
  const parsedRows = parseRows(input);
  const normalizedRows = parsedRows.map(normalizeRow);
  const rows = dedupeRows(normalizedRows);
  const emptyRemoved = Math.max(0, parsedRows.length - rows.length);
  const duplicateCount = countDuplicateRows(normalizedRows);
  const fieldProfiles = profileRows(rows);
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
            ? fieldProfiles.map(
                (field) =>
                  `${field.name}: ${field.type}, ${field.filled}/${rows.length} filled`,
              )
            : [
                "No columns detected. Try CSV, TSV, or copied spreadsheet rows.",
              ],
      },
      {
        title: "Data quality",
        items: [
          `${parsedRows.length} source row(s), ${rows.length} clean row(s).`,
          `${duplicateCount} duplicate row(s) detected after normalization.`,
          `${fieldProfiles.reduce((total, field) => total + field.empty, 0)} empty field value(s) remain.`,
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
      {
        label: "Data quality report",
        language: "json",
        content: JSON.stringify(
          {
            source_rows: parsedRows.length,
            clean_rows: rows.length,
            removed_rows: emptyRemoved,
            duplicate_rows: duplicateCount,
            fields: fieldProfiles,
          },
          null,
          2,
        ),
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
          "Run with adversarial input that asks the agent to ignore the original instruction.",
        ],
      },
      {
        title: "Output contract",
        items: [
          "Use stable section headings so downstream users know where to look.",
          "Include uncertainty and missing information instead of guessing.",
          "Prefer JSON or checklist artifacts when the output feeds another workflow.",
        ],
      },
    ],
    artifacts: [
      {
        label: "Agent prompt",
        language: "markdown",
        content: prompt,
      },
      {
        label: "Eval checklist",
        language: "markdown",
        content: [
          "## Happy Path",
          "- Produces the requested result with all required sections.",
          "- Keeps tone and scope aligned with the user direction.",
          "",
          "## Missing Context",
          "- Names missing inputs before making assumptions.",
          "- Gives the smallest useful next question.",
          "",
          "## Contradictions",
          "- Points out conflicting instructions.",
          "- Preserves the higher-priority system or product requirement.",
          "",
          "## Safety and Reliability",
          "- Does not invent facts, IDs, prices, dates, or policy.",
          "- Marks uncertain items for human review.",
        ].join("\n"),
      },
    ],
  };
}

function runJsonSchema(input: string, userPrompt: string): AgentRunResult {
  const rows = parseRows(input);
  const firstRow = rows[0] ?? extractKeyValues(input)[0] ?? { content: input };
  const schema = schemaFromValue(firstRow);
  const interfaceName = "StructuredOutput";

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
          "Schema-first output is best when another tool, API, or database will consume the result.",
        ],
      },
    ],
    artifacts: [
      {
        label: "JSON Schema",
        language: "json",
        content: JSON.stringify(schema, null, 2),
      },
      {
        label: "TypeScript interface",
        language: "typescript",
        content: typeScriptInterfaceFromRow(interfaceName, firstRow),
      },
      {
        label: "Zod validator",
        language: "typescript",
        content: zodSchemaFromRow(interfaceName, firstRow),
      },
    ],
  };
}

function parseDayTask(line: string): DayTask {
  const title = line
    .replace(/^\s*[-*+]\s*/, "")
    .replace(/^\s*\d+[.)]\s*/, "")
    .trim();
  const durationMinutes = inferTaskDurationMinutes(title);
  const priority = inferTaskPriority(title);

  return {
    category: inferTaskCategory(title),
    deadline: inferTaskDeadline(title),
    durationMinutes,
    energy: inferTaskEnergy(title, durationMinutes),
    priority,
    raw: line,
    startHintMinutes: inferStartHintMinutes(title),
    title,
  };
}

function inferPlanningWindow(prompt: string) {
  const start =
    matchPromptTime(prompt, /\b(?:start|starting|begin)\s*(?:at)?\s*/i) ??
    9 * 60;
  const end =
    matchPromptTime(
      prompt,
      /\b(?:stop|finish|end|done|wrap)\s*(?:by|at)?\s*/i,
    ) ?? 17 * 60;

  return {
    endMinutes: Math.max(end, start + 120),
    startMinutes: start,
  };
}

function matchPromptTime(prompt: string, prefix: RegExp) {
  const match = prompt.match(
    new RegExp(`${prefix.source}(\\d{1,2})(?::([0-5]\\d))?\\s*(am|pm)?`, "i"),
  );

  if (!match) {
    return null;
  }

  return timePartsToMinutes(match[1] ?? "9", match[2], match[3]);
}

function inferStartHintMinutes(text: string) {
  const match = text.match(
    /\b(?:at|@|after|before)?\s*(\d{1,2})(?::([0-5]\d))?\s*(am|pm)\b/i,
  );

  if (!match) {
    const hourMatch = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    return hourMatch
      ? timePartsToMinutes(hourMatch[1] ?? "9", hourMatch[2])
      : null;
  }

  return timePartsToMinutes(match[1] ?? "9", match[2], match[3]);
}

function timePartsToMinutes(
  hourText: string,
  minuteText?: string,
  period?: string,
) {
  let hour = Number(hourText);
  const minute = Number(minuteText ?? 0);

  if (period?.toLowerCase() === "pm" && hour < 12) {
    hour += 12;
  }

  if (period?.toLowerCase() === "am" && hour === 12) {
    hour = 0;
  }

  return hour * 60 + minute;
}

function inferTaskDurationMinutes(text: string) {
  const durationMatch = text.match(
    /\b(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours|min|mins|minute|minutes)\b/i,
  );

  if (durationMatch) {
    const value = Number(durationMatch[1]);
    const unit = durationMatch[2]?.toLowerCase() ?? "min";
    return Math.max(10, Math.round(value * (unit.startsWith("h") ? 60 : 1)));
  }

  if (/\b(call|reply|email|message|pay|book|order|check)\b/i.test(text)) {
    return 20;
  }

  if (/\b(workout|exercise|walk|clean|cook|groceries|shopping)\b/i.test(text)) {
    return 45;
  }

  if (
    /\b(deep work|write|build|review|study|learn|research|design)\b/i.test(text)
  ) {
    return 90;
  }

  return 30;
}

function inferTaskPriority(text: string): DayTask["priority"] {
  if (
    /\b(urgent|asap|today|tonight|deadline|due|appointment|meeting|doctor|dentist|pay|bill|pick up|pickup)\b/i.test(
      text,
    )
  ) {
    return "high";
  }

  if (/\b(maybe|someday|optional|if time|later|nice to have)\b/i.test(text)) {
    return "low";
  }

  return "medium";
}

function inferTaskDeadline(text: string) {
  const match = text.match(
    /\b(today|tonight|tomorrow|this week|next week|morning|afternoon|evening|eod|after\s+\d{1,2}(?::[0-5]\d)?\s*(?:am|pm)?|before\s+\d{1,2}(?::[0-5]\d)?\s*(?:am|pm)?|\d{1,2}\/\d{1,2})\b/i,
  );

  return match?.[0] ?? "flexible";
}

function inferTaskCategory(text: string) {
  if (
    /\b(grocery|groceries|shop|shopping|pickup|pick up|dry cleaning|errand)\b/i.test(
      text,
    )
  ) {
    return "errand";
  }

  if (/\b(clean|laundry|cook|meal|home|house|repair|trash)\b/i.test(text)) {
    return "household";
  }

  if (
    /\b(bill|budget|spending|subscription|invoice|bank|tax|pay)\b/i.test(text)
  ) {
    return "finance";
  }

  if (
    /\b(workout|exercise|doctor|dentist|medicine|medication|sleep|walk)\b/i.test(
      text,
    )
  ) {
    return "health";
  }

  if (/\b(call|reply|email|message|text|send|contract)\b/i.test(text)) {
    return "communication";
  }

  if (/\b(read|study|course|book|learn|lesson)\b/i.test(text)) {
    return "learning";
  }

  if (/\b(flight|hotel|trip|travel|passport|visa|route)\b/i.test(text)) {
    return "travel";
  }

  if (
    /\b(build|deep work|project|portfolio|code|review|design|write)\b/i.test(
      text,
    )
  ) {
    return "work";
  }

  return "personal";
}

function inferTaskEnergy(
  text: string,
  durationMinutes: number,
): DayTask["energy"] {
  if (
    durationMinutes >= 75 ||
    /\b(deep work|write|build|study|research|design|review)\b/i.test(text)
  ) {
    return "high";
  }

  if (
    /\b(call|reply|email|message|pay|book|order|pickup|pick up)\b/i.test(text)
  ) {
    return "low";
  }

  return "medium";
}

function compareDayTasks(left: DayTask, right: DayTask) {
  const priorityDiff =
    taskPriorityScore(right.priority) - taskPriorityScore(left.priority);

  if (priorityDiff !== 0) {
    return priorityDiff;
  }

  const leftHint = left.startHintMinutes ?? Number.POSITIVE_INFINITY;
  const rightHint = right.startHintMinutes ?? Number.POSITIVE_INFINITY;
  return (
    taskTimingRank(left) - taskTimingRank(right) ||
    leftHint - rightHint ||
    right.durationMinutes - left.durationMinutes
  );
}

function taskPriorityScore(priority: DayTask["priority"]) {
  if (priority === "high") {
    return 3;
  }

  if (priority === "medium") {
    return 2;
  }

  return 1;
}

function taskTimingRank(task: DayTask) {
  if (task.startHintMinutes === null) {
    return 1;
  }

  return task.startHintMinutes < 12 * 60 ? 0 : 2;
}

function buildDaySchedule(
  tasks: DayTask[],
  window: { endMinutes: number; startMinutes: number },
) {
  const blocks: Array<{ end: number; start: number; task: DayTask }> = [];
  const fixedTasks = tasks
    .filter((task) => task.startHintMinutes !== null)
    .sort((left, right) => {
      const leftHint = left.startHintMinutes ?? 0;
      const rightHint = right.startHintMinutes ?? 0;
      return leftHint - rightHint;
    });
  const flexibleTasks = tasks.filter((task) => task.startHintMinutes === null);
  let cursor = window.startMinutes;

  const scheduleFlexibleTasks = (untilMinutes: number) => {
    let index = 0;

    while (index < flexibleTasks.length) {
      const task = flexibleTasks[index];
      const start = cursor;
      const end = start + task.durationMinutes;

      if (end > untilMinutes) {
        index += 1;
        continue;
      }

      blocks.push({ end, start, task });
      cursor = end + getTaskBufferMinutes(task);
      flexibleTasks.splice(index, 1);
    }
  };

  for (const task of fixedTasks) {
    const fixedStart = Math.max(
      task.startHintMinutes ?? cursor,
      window.startMinutes,
    );
    scheduleFlexibleTasks(fixedStart);

    const start = Math.max(cursor, fixedStart);
    const end = start + task.durationMinutes;
    blocks.push({ end, start, task });
    cursor = end + getTaskBufferMinutes(task);
  }

  scheduleFlexibleTasks(window.endMinutes + 60);

  return blocks;
}

function getTaskBufferMinutes(task: DayTask) {
  if (task.durationMinutes >= 75) {
    return 15;
  }

  if (task.category === "errand" || task.category === "health") {
    return 10;
  }

  return 5;
}

function formatTaskLine(task: DayTask) {
  return `${task.title} - ${task.priority} priority, ${task.category}, ${formatDuration(task.durationMinutes)}${task.deadline === "flexible" ? "" : `, ${task.deadline}`}`;
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

function formatTime(totalMinutes: number) {
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hour12 = hours24 % 12 || 12;

  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

function dayScheduleToCsv(
  schedule: Array<{ end: number; start: number; task: DayTask }>,
) {
  if (schedule.length === 0) {
    return "";
  }

  const rows = schedule.map((block) => ({
    Description: `${block.task.priority} priority; ${block.task.category}; ${block.task.deadline}`,
    "End Date": "Today",
    "End Time": formatTime(block.end),
    "Start Date": "Today",
    "Start Time": formatTime(block.start),
    Subject: block.task.title,
  }));

  return rowsToCsv(rows);
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

function inferUrgency(lines: string[]) {
  const text = lines.join(" ").toLowerCase();

  if (/\b(urgent|asap|blocked|down|failed|today|tomorrow|eod)\b/.test(text)) {
    return "High";
  }

  if (/\b(soon|this week|next week|client|deadline)\b/.test(text)) {
    return "Medium";
  }

  return "Normal";
}

function inferSentiment(lines: string[]) {
  const text = lines.join(" ").toLowerCase();

  if (
    /\b(frustrated|angry|broken|failed|issue|problem|can't|cannot)\b/.test(text)
  ) {
    return "Concerned";
  }

  if (/\b(thanks|thank you|great|appreciate|happy)\b/.test(text)) {
    return "Positive";
  }

  return "Neutral";
}

function inferMissingInfo(lines: string[]) {
  const text = lines.join(" ").toLowerCase();
  const missing: string[] = [];

  if (!/\b(id|account|workspace|project|invoice|order|ticket)\b/.test(text)) {
    missing.push("Relevant account, project, ticket, invoice, or order ID.");
  }

  if (!/\b(error|screenshot|screen shot|stack|message|log)\b/.test(text)) {
    missing.push("Exact error message, log line, or screenshot.");
  }

  if (
    !/\b(time|date|today|tomorrow|morning|afternoon|eod|\d{1,2}\/\d{1,2})\b/.test(
      text,
    )
  ) {
    missing.push("Approximate time window or deadline.");
  }

  return missing.slice(0, 3);
}

function inferLikelyOwner(lines: string[]) {
  const text = lines.join(" ").toLowerCase();

  if (/\b(invoice|payment|billing|refund|charge|plan)\b/.test(text)) {
    return "Billing or customer support";
  }

  if (/\b(error|failed|bug|crash|export|upload|api|csv|pdf)\b/.test(text)) {
    return "Product engineering or technical support";
  }

  if (/\b(account|login|password|access|permission)\b/.test(text)) {
    return "Account support";
  }

  return "Support owner";
}

function findKeywordLines(lines: string[], pattern: RegExp) {
  return lines.filter((line) => pattern.test(line));
}

function profileRows(rows: DataRow[]): FieldProfile[] {
  const fields = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));

  return fields.map((field) => {
    const values = rows.map((row) => row[field] ?? null);
    const filledValues = values.filter((value) => String(value ?? "").trim());
    const samples = Array.from(
      new Set(filledValues.map((value) => String(value)).filter(Boolean)),
    ).slice(0, 3);

    return {
      empty: values.length - filledValues.length,
      filled: filledValues.length,
      name: field,
      samples,
      type: inferCommonType(filledValues),
    };
  });
}

function inferCommonType(values: Array<string | number | boolean | null>) {
  if (values.length === 0) {
    return "string";
  }

  const types = new Set(values.map((value) => inferJsonType(value)));
  return types.size === 1 ? Array.from(types)[0] : "mixed";
}

function dataDictionaryMarkdown(fields: FieldProfile[]) {
  if (fields.length === 0) {
    return "No fields detected.";
  }

  return [
    "| Field | Type | Filled | Empty | Samples |",
    "| --- | --- | ---: | ---: | --- |",
    ...fields.map(
      (field) =>
        `| ${field.name} | ${field.type} | ${field.filled} | ${field.empty} | ${field.samples.join(", ") || "-"} |`,
    ),
  ].join("\n");
}

function countDuplicateRows(rows: DataRow[]) {
  const seen = new Set<string>();
  let duplicates = 0;

  for (const row of rows) {
    const key = JSON.stringify(row);
    if (seen.has(key)) {
      duplicates += 1;
      continue;
    }
    seen.add(key);
  }

  return duplicates;
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

function typeScriptInterfaceFromRow(name: string, row: DataRow) {
  const fields = Object.entries(row).map(([key, value]) => {
    const optional = value === null ? "?" : "";
    return `  ${key}${optional}: ${typeScriptTypeFromValue(value)};`;
  });

  return [`export interface ${name} {`, ...fields, "}"].join("\n");
}

function zodSchemaFromRow(name: string, row: DataRow) {
  const schemaName = `${name}Schema`;
  const fields = Object.entries(row).map(([key, value]) => {
    const schema = zodTypeFromValue(value);
    return `  ${key}: ${value === null ? `${schema}.nullable().optional()` : schema},`;
  });

  return [
    'import { z } from "zod";',
    "",
    `export const ${schemaName} = z.object({`,
    ...fields,
    "}).strict();",
    "",
    `export type ${name} = z.infer<typeof ${schemaName}>;`,
  ].join("\n");
}

function typeScriptTypeFromValue(value: unknown) {
  if (typeof value === "boolean") {
    return "boolean";
  }

  if (typeof value === "number") {
    return "number";
  }

  if (Array.isArray(value)) {
    return "unknown[]";
  }

  if (value && typeof value === "object") {
    return "Record<string, unknown>";
  }

  return "string";
}

function zodTypeFromValue(value: unknown) {
  if (typeof value === "boolean") {
    return "z.boolean()";
  }

  if (typeof value === "number") {
    return "z.number()";
  }

  if (Array.isArray(value)) {
    return "z.array(z.unknown())";
  }

  if (value && typeof value === "object") {
    return "z.record(z.string(), z.unknown())";
  }

  return "z.string()";
}
