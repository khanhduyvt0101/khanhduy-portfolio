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

type SubscriptionCadence =
  | "annual"
  | "monthly"
  | "quarterly"
  | "unknown"
  | "weekly";

type SubscriptionDecision = "cancel" | "keep" | "review";

type SubscriptionCharge = {
  amount: number;
  annualCost: number;
  cadence: SubscriptionCadence;
  category: string;
  confidence: "high" | "low" | "medium";
  decision: SubscriptionDecision;
  monthlyCost: number;
  name: string;
  nextCharge: string;
  raw: string;
  reason: string;
};

type PantryCategory =
  | "dairy"
  | "grain"
  | "legume"
  | "pantry"
  | "produce"
  | "protein"
  | "sauce"
  | "spice"
  | "unknown";

type PantryItem = {
  category: PantryCategory;
  name: string;
  raw: string;
  useFirst: boolean;
};

type MealTemplate = {
  category: string;
  ingredients: string[];
  instructions: string[];
  name: string;
  tags: string[];
  timeMinutes: number;
};

type MealSuggestion = {
  category: string;
  have: string[];
  instructions: string[];
  matchScore: number;
  missing: string[];
  name: string;
  timeMinutes: number;
  useFirst: string[];
};

type MealPlanningConstraints = {
  budget: number | null;
  meals: number;
  maxMinutes: number | null;
  notes: string[];
};

type PackingPriority = "essential" | "optional" | "recommended";

type PackingItem = {
  bag: "main bag" | "personal item" | "travel-day pouch" | "wear";
  category: string;
  name: string;
  priority: PackingPriority;
  quantity: number;
  reason: string;
};

type TripProfile = {
  activities: string[];
  bagStyle: "carry-on" | "checked" | "flexible" | "personal item";
  climate: "cold" | "hot" | "mixed" | "rainy" | "temperate";
  destination: string;
  durationDays: number;
  laundry: boolean;
  notes: string[];
  travelers: number;
};

type ReturnWarrantyStatus =
  | "expired"
  | "missing-date"
  | "return-open"
  | "return-soon"
  | "warranty-watch";

type ReturnWarrantyItem = {
  action: string;
  amount: number | null;
  confidence: "high" | "low" | "medium";
  item: string;
  merchant: string;
  proofGaps: string[];
  purchaseDate: string;
  raw: string;
  returnDays: number;
  returnDeadline: string;
  status: ReturnWarrantyStatus;
  warrantyDeadline: string;
  warrantyMonths: number;
};

type MaintenanceCadence =
  | "annual"
  | "monthly"
  | "quarterly"
  | "seasonal"
  | "semiannual"
  | "unknown"
  | "weekly";

type MaintenanceStatus = "due-soon" | "needs-info" | "overdue" | "scheduled";

type MaintenanceTask = {
  asset: string;
  cadence: MaintenanceCadence;
  category: string;
  confidence: "high" | "low" | "medium";
  lastDone: string;
  nextDue: string;
  notes: string[];
  raw: string;
  status: MaintenanceStatus;
  supplies: string[];
  task: string;
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
    case "home-maintenance":
      return runHomeMaintenance(input, userPrompt);
    case "json-schema":
      return runJsonSchema(input, userPrompt);
    case "pantry-meal-planner":
      return runPantryMealPlanner(input, userPrompt);
    case "prompt-builder":
      return runPromptBuilder(input, userPrompt);
    case "private-summarizer":
      return runPrivateSummarizer(input, userPrompt);
    case "return-warranty":
      return runReturnWarranty(input, userPrompt);
    case "subscription-audit":
      return runSubscriptionAudit(input, userPrompt);
    case "travel-packing":
      return runTravelPacking(input, userPrompt);
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

function runSubscriptionAudit(
  input: string,
  userPrompt: string,
): AgentRunResult {
  const charges = parseSubscriptionCharges(input);
  const sortedCharges = [...charges].sort(compareSubscriptionCharges);
  const keepCharges = sortedCharges.filter(
    (charge) => charge.decision === "keep",
  );
  const reviewCharges = sortedCharges.filter(
    (charge) => charge.decision === "review",
  );
  const cancelCharges = sortedCharges.filter(
    (charge) => charge.decision === "cancel",
  );
  const monthlyCost = sumCharges(sortedCharges, "monthlyCost");
  const annualCost = sumCharges(sortedCharges, "annualCost");
  const possibleMonthlySavings = sumCharges(cancelCharges, "monthlyCost");
  const possibleAnnualSavings = sumCharges(cancelCharges, "annualCost");

  return {
    title: "Recurring charge audit",
    summary:
      sortedCharges.length > 0
        ? `Found ${sortedCharges.length} recurring charge${sortedCharges.length === 1 ? "" : "s"} totaling about ${formatMoney(monthlyCost)}/mo or ${formatMoney(annualCost)}/yr. Cancel candidates represent up to ${formatMoney(possibleMonthlySavings)}/mo.`
        : "No recurring charges were detected. Paste lines with service names and amounts like Netflix $22.99 monthly.",
    sections: [
      {
        title: "Audit request",
        items: [
          userPrompt ||
            "Review recurring charges, protect essentials, and flag likely waste.",
          "Local fallback uses amounts, cadence words, usage clues, and renewal dates from the pasted text.",
          "Review every cancellation before acting, especially utilities, insurance, family plans, and work tools.",
        ],
      },
      {
        title: "Spending snapshot",
        items: [
          `${sortedCharges.length} recurring charge${sortedCharges.length === 1 ? "" : "s"} detected.`,
          `Estimated recurring cost: ${formatMoney(monthlyCost)} monthly / ${formatMoney(annualCost)} yearly.`,
          `Possible cancellation savings: ${formatMoney(possibleMonthlySavings)} monthly / ${formatMoney(possibleAnnualSavings)} yearly.`,
          `${countByCadence(sortedCharges, "annual")} annual, ${countByCadence(sortedCharges, "monthly")} monthly, ${countByCadence(sortedCharges, "weekly")} weekly, ${countByCadence(sortedCharges, "quarterly")} quarterly, ${countByCadence(sortedCharges, "unknown")} unknown cadence.`,
        ],
      },
      {
        title: "Cancel first",
        items: cancelCharges.length
          ? cancelCharges.slice(0, 6).map(formatSubscriptionLine)
          : [
              "No obvious cancel-first subscription detected from the current text.",
            ],
      },
      {
        title: "Review before next charge",
        items: reviewCharges.length
          ? reviewCharges.slice(0, 8).map(formatSubscriptionLine)
          : [
              "No review queue detected. Recheck annual plans and app-store purchases manually.",
            ],
      },
      {
        title: "Likely keep",
        items: keepCharges.length
          ? keepCharges.slice(0, 8).map(formatSubscriptionLine)
          : ["No essential or clearly used recurring bill detected."],
      },
      {
        title: "Missing details to add",
        items: [
          "Next charge date for every item you may cancel.",
          "Owner or shared-with person for family and team plans.",
          "Last-used date for apps, gyms, courses, cloud storage, and trials.",
          "Cancellation URL or app-store billing location for each cancel candidate.",
        ],
      },
    ],
    artifacts: [
      {
        label: "Subscription audit CSV",
        language: "csv",
        content: rowsToCsv(
          sortedCharges.map((charge) => ({
            name: charge.name,
            amount: charge.amount,
            cadence: charge.cadence,
            monthly_cost: roundMoney(charge.monthlyCost),
            annual_cost: roundMoney(charge.annualCost),
            category: charge.category,
            decision: charge.decision,
            next_charge: charge.nextCharge,
            confidence: charge.confidence,
            reason: charge.reason,
          })),
        ),
      },
      {
        label: "Savings plan JSON",
        language: "json",
        content: JSON.stringify(
          {
            totals: {
              monthly_cost: roundMoney(monthlyCost),
              annual_cost: roundMoney(annualCost),
              possible_monthly_savings: roundMoney(possibleMonthlySavings),
              possible_annual_savings: roundMoney(possibleAnnualSavings),
            },
            cancel_first: cancelCharges,
            review_queue: reviewCharges,
            keep: keepCharges,
          },
          null,
          2,
        ),
      },
      {
        label: "Cancellation checklist",
        language: "markdown",
        content: subscriptionChecklistMarkdown(cancelCharges, reviewCharges),
      },
      {
        label: "Renewal reminder CSV",
        language: "csv",
        content: rowsToCsv(renewalReminderRows(sortedCharges)),
      },
    ],
  };
}

function runReturnWarranty(input: string, userPrompt: string): AgentRunResult {
  const items = parseReturnWarrantyItems(input);
  const sortedItems = [...items].sort(compareReturnWarrantyItems);
  const urgentReturns = sortedItems.filter(
    (item) => item.status === "return-soon",
  );
  const openReturns = sortedItems.filter(
    (item) => item.status === "return-open",
  );
  const warrantyWatch = sortedItems.filter(
    (item) => item.status === "warranty-watch",
  );
  const missingDate = sortedItems.filter(
    (item) => item.status === "missing-date",
  );
  const expired = sortedItems.filter((item) => item.status === "expired");
  const today = new Date();

  return {
    title: "Return and warranty tracker",
    summary:
      sortedItems.length > 0
        ? `Organized ${sortedItems.length} purchase${sortedItems.length === 1 ? "" : "s"} with ${urgentReturns.length} return window${urgentReturns.length === 1 ? "" : "s"} needing attention this week and ${warrantyWatch.length} warranty watch item${warrantyWatch.length === 1 ? "" : "s"}.`
        : "No purchases were detected. Paste receipt lines with merchant, item, purchase date, amount, return policy, or warranty notes.",
    sections: [
      {
        title: "Tracking request",
        items: [
          userPrompt ||
            "Find return deadlines, warranty reminders, proof gaps, and next actions.",
          `Run date: ${formatReturnDate(today)}. Verify merchant policies before acting.`,
          "Local fallback uses only pasted notes plus conservative default return and warranty assumptions.",
        ],
      },
      {
        title: "Decide now",
        items: urgentReturns.length
          ? urgentReturns.map(formatReturnWarrantyLine)
          : ["No open return window appears to close within the next 7 days."],
      },
      {
        title: "Still returnable",
        items: openReturns.length
          ? openReturns.slice(0, 8).map(formatReturnWarrantyLine)
          : ["No longer returnable item detected beyond the urgent list."],
      },
      {
        title: "Warranty watch",
        items: warrantyWatch.length
          ? warrantyWatch.slice(0, 8).map(formatReturnWarrantyLine)
          : [
              "No warranty-only watch item detected. Add serial numbers and warranty periods for durable goods.",
            ],
      },
      {
        title: "Missing proof or dates",
        items: [
          ...missingDate.slice(0, 6).map(formatReturnWarrantyLine),
          ...sortedItems
            .flatMap((item) =>
              item.proofGaps.map((gap) => `${item.item}: ${gap}`),
            )
            .slice(0, 8),
        ].length
          ? [
              ...missingDate.slice(0, 6).map(formatReturnWarrantyLine),
              ...sortedItems
                .flatMap((item) =>
                  item.proofGaps.map((gap) => `${item.item}: ${gap}`),
                )
                .slice(0, 8),
            ]
          : [
              "No obvious proof gap detected. Still keep receipts, order emails, serial numbers, and packaging photos for expensive items.",
            ],
      },
      {
        title: "Expired or archive",
        items: expired.length
          ? expired.slice(0, 6).map(formatReturnWarrantyLine)
          : ["No expired return and warranty record detected."],
      },
    ],
    artifacts: [
      {
        label: "Return checklist",
        language: "markdown",
        content: returnWarrantyChecklistMarkdown(sortedItems),
      },
      {
        label: "Purchase deadline CSV",
        language: "csv",
        content: rowsToCsv(returnWarrantyRows(sortedItems)),
      },
      {
        label: "Warranty tracker JSON",
        language: "json",
        content: JSON.stringify(
          {
            run_date: formatReturnDate(today),
            request: userPrompt || null,
            items: sortedItems,
          },
          null,
          2,
        ),
      },
      {
        label: "Reminder import CSV",
        language: "csv",
        content: rowsToCsv(returnWarrantyReminderRows(sortedItems)),
      },
    ],
  };
}

function runHomeMaintenance(input: string, userPrompt: string): AgentRunResult {
  const tasks = parseMaintenanceTasks(input);
  const sortedTasks = [...tasks].sort(compareMaintenanceTasks);
  const overdueTasks = sortedTasks.filter((task) => task.status === "overdue");
  const dueSoonTasks = sortedTasks.filter((task) => task.status === "due-soon");
  const scheduledTasks = sortedTasks.filter(
    (task) => task.status === "scheduled",
  );
  const needsInfoTasks = sortedTasks.filter(
    (task) => task.status === "needs-info",
  );
  const supplies = maintenanceSupplyRows(sortedTasks);
  const categories = countMaintenanceCategories(sortedTasks);
  const today = new Date();

  return {
    title: "Home maintenance plan",
    summary:
      sortedTasks.length > 0
        ? `Organized ${sortedTasks.length} upkeep task${sortedTasks.length === 1 ? "" : "s"} with ${overdueTasks.length} overdue and ${dueSoonTasks.length} due within 14 days.`
        : "No maintenance tasks were detected. Paste lines with assets, upkeep tasks, last-done dates, due dates, or repeat intervals.",
    sections: [
      {
        title: "Planning request",
        items: [
          userPrompt ||
            "Build a low-noise maintenance plan from actual last-done dates and recurring intervals.",
          `Run date: ${formatReturnDate(today)}.`,
          "Local fallback uses pasted notes plus conservative upkeep intervals for common filters, appliances, seasonal chores, and safety checks.",
        ],
      },
      {
        title: "Do first",
        items: [...overdueTasks, ...dueSoonTasks].length
          ? [...overdueTasks, ...dueSoonTasks]
              .slice(0, 10)
              .map(formatMaintenanceLine)
          : [
              "No overdue or due-soon maintenance detected from the current notes.",
            ],
      },
      {
        title: "Upcoming schedule",
        items: scheduledTasks.length
          ? scheduledTasks.slice(0, 10).map(formatMaintenanceLine)
          : ["No future maintenance schedule could be calculated yet."],
      },
      {
        title: "Missing details",
        items: needsInfoTasks.length
          ? needsInfoTasks.slice(0, 8).map(formatMaintenanceLine)
          : [
              "Every detected task has enough date or interval detail for a first schedule.",
            ],
      },
      {
        title: "Supplies to stage",
        items: supplies.length
          ? supplies
              .slice(0, 10)
              .map(
                (row) =>
                  `${row.supply} - used by ${row.assets}; next needed ${row.next_due}.`,
              )
          : [
              "No filter size, battery, bulb, cleaner, or replacement part was detected. Add supply names or sizes to improve the next run.",
            ],
      },
      {
        title: "Home snapshot",
        items: [
          `${categories.filters} filter task(s), ${categories.appliances} appliance task(s), ${categories.safety} safety task(s), ${categories.seasonal} seasonal task(s), ${categories.cleaning} cleaning task(s).`,
          "For electrical, plumbing, structural, gas, roof, or safety-critical repairs, treat this as an organizer and verify with a qualified professional.",
        ],
      },
    ],
    artifacts: [
      {
        label: "Maintenance checklist",
        language: "markdown",
        content: maintenanceChecklistMarkdown(sortedTasks),
      },
      {
        label: "Maintenance calendar CSV",
        language: "csv",
        content: rowsToCsv(maintenanceCalendarRows(sortedTasks)),
      },
      {
        label: "Supply list CSV",
        language: "csv",
        content: rowsToCsv(supplies),
      },
      {
        label: "Home maintenance tracker JSON",
        language: "json",
        content: JSON.stringify(
          {
            run_date: formatReturnDate(today),
            request: userPrompt || null,
            tasks: sortedTasks,
          },
          null,
          2,
        ),
      },
    ],
  };
}

function runPantryMealPlanner(
  input: string,
  userPrompt: string,
): AgentRunResult {
  const pantryItems = parsePantryItems(input);
  const pantryNames = pantryItems.map((item) => item.name);
  const constraints = inferMealPlanningConstraints(`${userPrompt}\n${input}`);
  const suggestions = scoreMealTemplates(pantryItems, constraints);
  const selectedMeals = suggestions.slice(0, constraints.meals);
  const groceryRows = groceryRowsFromMeals(selectedMeals, pantryItems);
  const useFirstItems = pantryItems.filter((item) => item.useFirst);
  const categories = countPantryCategories(pantryItems);

  return {
    title: "Pantry-first meal plan",
    summary:
      selectedMeals.length > 0
        ? `Built ${selectedMeals.length} meal idea${selectedMeals.length === 1 ? "" : "s"} from ${pantryItems.length} pantry item${pantryItems.length === 1 ? "" : "s"} with ${groceryRows.length} focused grocery add-on${groceryRows.length === 1 ? "" : "s"}.`
        : "No meal plan could be built. Paste pantry, fridge, freezer, and dietary notes first.",
    sections: [
      {
        title: "Planning constraints",
        items: [
          userPrompt ||
            "Use existing ingredients first, keep meals practical, and buy only missing items.",
          `Target meals: ${constraints.meals}.`,
          constraints.maxMinutes
            ? `Preferred cook time: ${constraints.maxMinutes} minutes or less.`
            : "No hard cook-time limit detected.",
          constraints.budget
            ? `Budget signal detected: about ${formatMoney(constraints.budget)}.`
            : "No budget amount detected.",
          ...(constraints.notes.length
            ? constraints.notes
            : ["No allergy or diet note detected."]),
        ],
      },
      {
        title: "Use first",
        items: useFirstItems.length
          ? useFirstItems
              .slice(0, 8)
              .map((item) => `${titleCase(item.name)} (${item.category})`)
          : [
              "No explicit expiry, leftover, low-stock, or use-first item detected.",
            ],
      },
      {
        title: "Meal plan",
        items: selectedMeals.length
          ? selectedMeals.map(formatMealSuggestionLine)
          : ["No meal suggestions matched the current input."],
      },
      {
        title: "Grocery delta",
        items: groceryRows.length
          ? groceryRows
              .slice(0, 10)
              .map(
                (row) =>
                  `${row.item} (${row.category}) - needed for ${row.meals}.`,
              )
          : [
              "No missing grocery items detected for the selected meals. Recheck staples like oil, salt, and spices manually.",
            ],
      },
      {
        title: "Pantry snapshot",
        items: [
          `${categories.protein} protein, ${categories.produce} produce, ${categories.grain} grain, ${categories.legume} legume, ${categories.dairy} dairy, ${categories.sauce} sauce/spice/pantry item(s).`,
          pantryNames.length
            ? `Detected: ${pantryNames.slice(0, 16).map(titleCase).join(", ")}${pantryNames.length > 16 ? "..." : ""}.`
            : "No ingredient names detected.",
        ],
      },
    ],
    artifacts: [
      {
        label: "Meal plan",
        language: "markdown",
        content: mealPlanMarkdown(selectedMeals),
      },
      {
        label: "Grocery list CSV",
        language: "csv",
        content: rowsToCsv(groceryRows),
      },
      {
        label: "Pantry plan JSON",
        language: "json",
        content: JSON.stringify(
          {
            constraints,
            pantry_items: pantryItems,
            selected_meals: selectedMeals,
            grocery_delta: groceryRows,
          },
          null,
          2,
        ),
      },
      {
        label: "Prep checklist",
        language: "markdown",
        content: prepChecklistMarkdown(selectedMeals, useFirstItems),
      },
    ],
  };
}

function runTravelPacking(input: string, userPrompt: string): AgentRunResult {
  const profile = parseTripProfile(input, userPrompt);
  const items = sortPackingItems(buildPackingItems(profile, input));
  const essentials = items.filter((item) => item.priority === "essential");
  const optionalItems = items.filter((item) => item.priority === "optional");
  const preTripTasks = buildPreTripTasks(profile, input);
  const categories = Array.from(new Set(items.map((item) => item.category)));
  const packingRows = items.map((item) => ({
    Bag: item.bag,
    Category: item.category,
    Item: item.name,
    Priority: item.priority,
    Quantity: item.quantity,
    Reason: item.reason,
  }));

  return {
    title: "Travel packing plan",
    summary: `Built a ${profile.bagStyle} packing plan for ${profile.travelers} traveler${profile.travelers === 1 ? "" : "s"} over ${profile.durationDays} day${profile.durationDays === 1 ? "" : "s"} with ${items.length} categorized item${items.length === 1 ? "" : "s"}.`,
    sections: [
      {
        title: "Trip assumptions",
        items: [
          `Destination: ${profile.destination}.`,
          `Climate signal: ${profile.climate}; activities: ${profile.activities.join(", ") || "general travel"}.`,
          profile.laundry
            ? "Laundry is planned, so clothing quantities are intentionally reduced."
            : "No laundry signal found, so clothing quantities cover the full trip conservatively.",
          ...profile.notes,
        ],
      },
      {
        title: "Pack first",
        items: essentials.length
          ? essentials.slice(0, 12).map(formatPackingItem)
          : ["No essential items detected."],
      },
      {
        title: "Bag plan",
        items: formatBagPlan(items),
      },
      {
        title: "Pre-trip checklist",
        items: preTripTasks,
      },
      {
        title: "Optional or trip-dependent",
        items: optionalItems.length
          ? optionalItems.slice(0, 8).map(formatPackingItem)
          : ["No optional extras added. Keep the bag simple."],
      },
    ],
    artifacts: [
      {
        label: "Packing checklist",
        language: "markdown",
        content: packingChecklistMarkdown(categories, items, preTripTasks),
      },
      {
        label: "Packing CSV",
        language: "csv",
        content: rowsToCsv(packingRows),
      },
      {
        label: "Trip packing JSON",
        language: "json",
        content: JSON.stringify(
          {
            profile,
            items,
            pre_trip_tasks: preTripTasks,
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

function parseTripProfile(input: string, userPrompt: string): TripProfile {
  const combined = `${userPrompt}\n${input}`;
  const lower = combined.toLowerCase();

  return {
    activities: inferTripActivities(lower),
    bagStyle: inferTripBagStyle(lower),
    climate: inferTripClimate(lower),
    destination: inferTripDestination(input),
    durationDays: inferTripDurationDays(lower),
    laundry: /\b(laundry|wash clothes|washer|laundromat|sink wash)\b/i.test(
      combined,
    ),
    notes: inferTripNotes(combined),
    travelers: inferTravelerCount(lower),
  };
}

function inferTripDestination(input: string) {
  const lines = cleanLines(input);
  const explicitDestination =
    findHeader(lines, "Destination") ?? findHeader(lines, "Trip");

  if (explicitDestination) {
    return explicitDestination;
  }

  const toMatch = input.match(
    /\b(?:to|in|for)\s+([A-Z][A-Za-z\s.&'-]{2,48})(?:[,.\n]|$)/,
  );

  return toMatch?.[1]?.trim() ?? "the trip";
}

function inferTripDurationDays(text: string) {
  const weekMatch = text.match(/\b(\d+)\s*(?:week|weeks)\b/);
  if (weekMatch) {
    return Math.max(1, Number(weekMatch[1]) * 7);
  }

  const nightMatch = text.match(/\b(\d+)\s*(?:night|nights)\b/);
  if (nightMatch) {
    return Math.max(1, Number(nightMatch[1]) + 1);
  }

  const dayMatch = text.match(/\b(\d+)\s*(?:day|days)\b/);
  if (dayMatch) {
    return Math.max(1, Number(dayMatch[1]));
  }

  return 3;
}

function inferTravelerCount(text: string) {
  const matches = Array.from(
    text.matchAll(
      /\b(\d+)\s*(?:adult|adults|kid|kids|child|children|people|persons|travelers|travellers)\b/g,
    ),
  );
  const total = matches.reduce((sum, match) => sum + Number(match[1] ?? 0), 0);

  if (total > 0) {
    return Math.min(total, 12);
  }

  return /\b(family|kids|children|toddler|baby)\b/.test(text) ? 4 : 1;
}

function inferTripClimate(text: string): TripProfile["climate"] {
  if (/\b(rain|rainy|wet|monsoon|umbrella|storm)\b/.test(text)) {
    return "rainy";
  }

  if (/\b(cold|winter|snow|ski|freezing|chilly|cool)\b/.test(text)) {
    return "cold";
  }

  if (/\b(hot|summer|humid|tropical|beach|pool|desert)\b/.test(text)) {
    return "hot";
  }

  if (/\b(mixed|variable|layers|spring|fall|autumn)\b/.test(text)) {
    return "mixed";
  }

  return "temperate";
}

function inferTripBagStyle(text: string): TripProfile["bagStyle"] {
  if (/\b(carry on|carry-on|backpack only|one bag|onebag)\b/.test(text)) {
    return "carry-on";
  }

  if (/\b(personal item only|underseat)\b/.test(text)) {
    return "personal item";
  }

  if (/\b(checked bag|checked luggage|suitcase)\b/.test(text)) {
    return "checked";
  }

  return "flexible";
}

function inferTripActivities(text: string) {
  const activityRules: Array<[string, RegExp]> = [
    ["beach", /\b(beach|pool|swim|snorkel|island)\b/],
    ["business", /\b(work|cowork|conference|meeting|client|business)\b/],
    ["city walking", /\b(city|walking|sightseeing|museum|train|metro)\b/],
    ["event", /\b(wedding|nice dinner|formal|event|ceremony)\b/],
    ["family", /\b(family|kid|kids|child|children|toddler|baby)\b/],
    ["fitness", /\b(gym|workout|run|yoga|fitness)\b/],
    ["hiking", /\b(hike|hiking|trail|camp|outdoor|trek)\b/],
    ["photography", /\b(camera|photo|photography|lens|tripod)\b/],
    ["road trip", /\b(road trip|drive|car rental|rental car)\b/],
    ["international", /\b(passport|visa|customs|international|rail pass)\b/],
  ];

  return activityRules
    .filter(([, pattern]) => pattern.test(text))
    .map(([activity]) => activity);
}

function inferTripNotes(text: string) {
  const notes: string[] = [];

  if (/\b(passport|visa|customs|international)\b/i.test(text)) {
    notes.push(
      "International-document signal found; verify passport, visa, entry rules, and copies before travel.",
    );
  }

  if (/\b(medication|medicine|prescription|epi|inhaler)\b/i.test(text)) {
    notes.push(
      "Medication signal found; pack original-labeled essentials and verify health requirements yourself.",
    );
  }

  if (/\b(carry on|carry-on|personal item|liquid|tsa|airport)\b/i.test(text)) {
    notes.push(
      "Airport/carry-on signal found; keep liquids small and easy to remove for screening.",
    );
  }

  return notes;
}

function buildPackingItems(profile: TripProfile, input: string): PackingItem[] {
  const items: PackingItem[] = [];
  const clothingDays = profile.laundry
    ? Math.min(profile.durationDays, 5)
    : profile.durationDays;
  const travelerCount = Math.max(1, profile.travelers);
  const add = (item: PackingItem) => {
    const existing = items.find(
      (candidate) =>
        normalizePackingName(candidate.name) ===
          normalizePackingName(item.name) &&
        candidate.category === item.category,
    );

    if (!existing) {
      items.push(item);
      return;
    }

    existing.quantity = Math.max(existing.quantity, item.quantity);
    existing.priority = higherPackingPriority(existing.priority, item.priority);
    existing.reason = uniqueTextValues([existing.reason, item.reason]).join(
      "; ",
    );
    existing.bag = preferredPackingBag(existing.bag, item.bag);
  };

  addPackingItem(
    add,
    "Passport or government ID",
    "Documents",
    travelerCount,
    "essential",
    "travel-day pouch",
    "Required identity document.",
  );
  addPackingItem(
    add,
    "Wallet and payment cards",
    "Documents",
    1,
    "essential",
    "travel-day pouch",
    "Keep money and cards accessible.",
  );
  addPackingItem(
    add,
    "Phone",
    "Tech",
    travelerCount,
    "essential",
    "personal item",
    "Primary communication and navigation device.",
  );
  addPackingItem(
    add,
    "Phone charger and cable",
    "Tech",
    travelerCount,
    "essential",
    "personal item",
    "Prevents travel-day battery problems.",
  );
  addPackingItem(
    add,
    "Underwear",
    "Clothing",
    clothingDays * travelerCount,
    "essential",
    "main bag",
    "One per planned clothing day.",
  );
  addPackingItem(
    add,
    "Socks",
    "Clothing",
    clothingDays * travelerCount,
    "essential",
    "main bag",
    "One per planned clothing day.",
  );
  addPackingItem(
    add,
    "Tops",
    "Clothing",
    Math.ceil(clothingDays * 0.85) * travelerCount,
    "essential",
    "main bag",
    "Core outfits for the trip.",
  );
  addPackingItem(
    add,
    "Bottoms",
    "Clothing",
    Math.max(1, Math.ceil(clothingDays / 3)) * travelerCount,
    "recommended",
    "main bag",
    "Reusable outfit base.",
  );
  addPackingItem(
    add,
    "Sleepwear",
    "Clothing",
    travelerCount,
    "recommended",
    "main bag",
    "One compact sleep outfit per traveler.",
  );
  addPackingItem(
    add,
    "Toothbrush",
    "Toiletries",
    travelerCount,
    "essential",
    "main bag",
    "Daily hygiene.",
  );
  addPackingItem(
    add,
    "Toothpaste",
    "Toiletries",
    1,
    "essential",
    "main bag",
    "Shared toiletry.",
  );
  addPackingItem(
    add,
    "Deodorant",
    "Toiletries",
    travelerCount,
    "essential",
    "main bag",
    "Daily hygiene.",
  );
  addPackingItem(
    add,
    "Medication and prescriptions",
    "Health",
    travelerCount,
    "essential",
    "travel-day pouch",
    "Keep critical health items with you.",
  );
  addPackingItem(
    add,
    "Reusable water bottle",
    "Transit",
    travelerCount,
    "recommended",
    "personal item",
    "Useful during flights, train rides, and walking days.",
  );

  if (profile.climate === "rainy" || profile.climate === "mixed") {
    addPackingItem(
      add,
      "Compact umbrella",
      "Weather",
      1,
      "recommended",
      "personal item",
      "Rain signal found.",
    );
    addPackingItem(
      add,
      "Light rain shell",
      "Weather",
      travelerCount,
      "recommended",
      "wear",
      "Keeps the main bag lighter in wet weather.",
    );
  }

  if (profile.climate === "cold" || profile.climate === "mixed") {
    addPackingItem(
      add,
      "Warm layer",
      "Clothing",
      travelerCount,
      "essential",
      "wear",
      "Cool or variable weather signal found.",
    );
    addPackingItem(
      add,
      "Beanie or light gloves",
      "Weather",
      travelerCount,
      "optional",
      "main bag",
      "Useful if mornings or evenings are cold.",
    );
  }

  if (profile.climate === "hot") {
    addPackingItem(
      add,
      "Breathable sun hat",
      "Weather",
      travelerCount,
      "recommended",
      "wear",
      "Hot weather signal found.",
    );
    addPackingItem(
      add,
      "Sunscreen",
      "Toiletries",
      1,
      "recommended",
      "main bag",
      "Useful for sun exposure.",
    );
  }

  if (profile.activities.includes("city walking")) {
    addPackingItem(
      add,
      "Comfortable walking shoes",
      "Shoes",
      travelerCount,
      "essential",
      "wear",
      "Lots of walking or city transit signal found.",
    );
    addPackingItem(
      add,
      "Small day bag",
      "Transit",
      1,
      "recommended",
      "personal item",
      "Keeps daily essentials organized.",
    );
  }

  if (profile.activities.includes("business")) {
    addPackingItem(
      add,
      "Laptop and charger",
      "Tech",
      1,
      "essential",
      "personal item",
      "Work or coworking signal found.",
    );
    addPackingItem(
      add,
      "Work-ready outfit",
      "Clothing",
      Math.min(2, clothingDays) * travelerCount,
      "recommended",
      "main bag",
      "Keeps work mornings or meetings covered.",
    );
  }

  if (profile.activities.includes("event")) {
    addPackingItem(
      add,
      "Nicer outfit",
      "Clothing",
      travelerCount,
      "recommended",
      "main bag",
      "Event or nicer dinner signal found.",
    );
    addPackingItem(
      add,
      "Nicer shoes",
      "Shoes",
      travelerCount,
      "optional",
      "main bag",
      "Only pack if they are required for the event.",
    );
  }

  if (profile.activities.includes("beach")) {
    addPackingItem(
      add,
      "Swimwear",
      "Activity",
      travelerCount,
      "essential",
      "main bag",
      "Beach or pool signal found.",
    );
    addPackingItem(
      add,
      "Sandals",
      "Shoes",
      travelerCount,
      "recommended",
      "main bag",
      "Useful for beach or pool days.",
    );
  }

  if (profile.activities.includes("hiking")) {
    addPackingItem(
      add,
      "Trail shoes",
      "Shoes",
      travelerCount,
      "essential",
      "wear",
      "Hiking or trail signal found.",
    );
    addPackingItem(
      add,
      "Basic first-aid kit",
      "Health",
      1,
      "recommended",
      "personal item",
      "Useful for outdoor activity.",
    );
  }

  if (profile.activities.includes("photography")) {
    addPackingItem(
      add,
      "Camera kit",
      "Tech",
      1,
      "essential",
      "personal item",
      "Photography signal found.",
    );
    addPackingItem(
      add,
      "Memory cards and camera charger",
      "Tech",
      1,
      "recommended",
      "personal item",
      "Avoids hard-to-replace photography failures.",
    );
  }

  if (profile.activities.includes("family")) {
    addPackingItem(
      add,
      "Kid entertainment pack",
      "Family",
      1,
      "recommended",
      "personal item",
      "Helps on travel days and waits.",
    );
    addPackingItem(
      add,
      "Snacks",
      "Family",
      1,
      "recommended",
      "personal item",
      "Useful for family transit buffers.",
    );
    addPackingItem(
      add,
      "Spare kid outfit",
      "Family",
      1,
      "essential",
      "personal item",
      "Keep one change accessible during travel.",
    );
  }

  if (profile.bagStyle === "carry-on" || profile.bagStyle === "personal item") {
    addPackingItem(
      add,
      "Liquids pouch",
      "Toiletries",
      1,
      "essential",
      "personal item",
      "Carry-on packing needs visible small liquids.",
    );
    addPackingItem(
      add,
      "Laundry bag",
      "Organization",
      1,
      "recommended",
      "main bag",
      "Separates worn clothing in a small bag.",
    );
  }

  if (profile.laundry) {
    addPackingItem(
      add,
      "Laundry detergent sheets",
      "Organization",
      1,
      "recommended",
      "main bag",
      "Laundry signal found.",
    );
  }

  for (const customItem of extractMustBringItems(input)) {
    addPackingItem(
      add,
      customItem,
      inferPackingCategory(customItem),
      1,
      "essential",
      inferPackingBag(customItem),
      "User marked this as needed or must-bring.",
    );
  }

  return items;
}

function addPackingItem(
  add: (item: PackingItem) => void,
  name: string,
  category: string,
  quantity: number,
  priority: PackingPriority,
  bag: PackingItem["bag"],
  reason: string,
) {
  add({ bag, category, name, priority, quantity, reason });
}

function normalizePackingName(name: string) {
  const normalized = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  if (/\b(passport|government id|photo id|identity)\b/.test(normalized)) {
    return "passport or id";
  }

  if (/\b(medication|medicine|prescription)\b/.test(normalized)) {
    return "medication";
  }

  if (/\b(camera kit|camera)\b/.test(normalized)) {
    return "camera";
  }

  if (/\b(laptop)\b/.test(normalized)) {
    return "laptop";
  }

  if (
    /\b(comfortable walking shoes|comfortable shoes|walking shoes)\b/.test(
      normalized,
    )
  ) {
    return "comfortable walking shoes";
  }

  if (/\b(compact umbrella|umbrella)\b/.test(normalized)) {
    return "compact umbrella";
  }

  return normalized;
}

function uniqueTextValues(values: string[]) {
  return values.filter((value, index) => values.indexOf(value) === index);
}

function extractMustBringItems(input: string) {
  return cleanLines(input)
    .filter((line) => /^(need|must bring|bring|pack|required)\s*:/i.test(line))
    .flatMap((line) => line.slice(line.indexOf(":") + 1).split(/[,;]+/))
    .map((item) =>
      item
        .replace(/\b(and|plus)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(
      (item) =>
        item.length > 2 && !/\blaundry|wash clothes|washer\b/i.test(item),
    )
    .slice(0, 16);
}

function inferPackingCategory(item: string) {
  if (/\b(passport|visa|ticket|booking|pass|id|license)\b/i.test(item)) {
    return "Documents";
  }

  if (/\b(camera|laptop|charger|cable|phone|adapter|battery)\b/i.test(item)) {
    return "Tech";
  }

  if (/\b(medication|medicine|prescription|first aid|inhaler)\b/i.test(item)) {
    return "Health";
  }

  if (
    /\b(shoe|shoes|sneaker|sneakers|boot|boots|sandal|sandals)\b/i.test(item)
  ) {
    return "Shoes";
  }

  if (/\b(shirt|jacket|pants|dress|outfit|sock|underwear)\b/i.test(item)) {
    return "Clothing";
  }

  if (/\b(umbrella|rain|sunscreen|hat)\b/i.test(item)) {
    return "Weather";
  }

  return "Must bring";
}

function inferPackingBag(item: string): PackingItem["bag"] {
  if (
    /\b(passport|visa|ticket|medication|medicine|phone|wallet)\b/i.test(item)
  ) {
    return "travel-day pouch";
  }

  if (/\b(laptop|camera|charger|battery|headphone)\b/i.test(item)) {
    return "personal item";
  }

  return "main bag";
}

function higherPackingPriority(
  left: PackingPriority,
  right: PackingPriority,
): PackingPriority {
  const rank: Record<PackingPriority, number> = {
    essential: 3,
    recommended: 2,
    optional: 1,
  };

  return rank[right] > rank[left] ? right : left;
}

function preferredPackingBag(
  left: PackingItem["bag"],
  right: PackingItem["bag"],
): PackingItem["bag"] {
  const rank: Record<PackingItem["bag"], number> = {
    "travel-day pouch": 4,
    "personal item": 3,
    wear: 2,
    "main bag": 1,
  };

  return rank[right] > rank[left] ? right : left;
}

function sortPackingItems(items: PackingItem[]) {
  const priorityRank: Record<PackingPriority, number> = {
    essential: 0,
    recommended: 1,
    optional: 2,
  };

  return [...items].sort(
    (left, right) =>
      priorityRank[left.priority] - priorityRank[right.priority] ||
      left.category.localeCompare(right.category) ||
      left.name.localeCompare(right.name),
  );
}

function buildPreTripTasks(profile: TripProfile, input: string) {
  const tasks = [
    "Confirm dates, address, check-in rules, and local transport plan.",
    "Charge phone, power bank, headphones, and any camera or laptop batteries.",
    "Pack documents, payment cards, medicines, and one change of clothes before filling the main bag.",
  ];

  if (profile.activities.includes("international")) {
    tasks.push(
      "Verify passport validity, visa or entry rules, rail or transit passes, and offline copies.",
    );
  }

  if (profile.climate === "rainy" || profile.climate === "mixed") {
    tasks.push(
      "Check destination weather within 48 hours and move rain gear to the top of the bag.",
    );
  }

  if (profile.bagStyle === "carry-on" || profile.bagStyle === "personal item") {
    tasks.push(
      "Measure bag size and separate liquids before airport screening.",
    );
  }

  if (profile.laundry) {
    tasks.push(
      "Choose the laundry day and pack detergent sheets or confirm hotel laundry access.",
    );
  }

  if (/\b(medication|medicine|prescription|inhaler|epi)\b/i.test(input)) {
    tasks.push(
      "Verify medication quantity, labels, and destination rules before travel.",
    );
  }

  return tasks;
}

function formatPackingItem(item: PackingItem) {
  return `${item.name} x${item.quantity} - ${item.category}, ${item.bag}; ${item.reason}`;
}

function formatBagPlan(items: PackingItem[]) {
  const bags: PackingItem["bag"][] = [
    "travel-day pouch",
    "personal item",
    "wear",
    "main bag",
  ];

  return bags.map((bag) => {
    const bagItems = items
      .filter((item) => item.bag === bag)
      .slice(0, 8)
      .map((item) => `${item.name} x${item.quantity}`)
      .join(", ");

    return `${bag}: ${bagItems || "Nothing required."}`;
  });
}

function packingChecklistMarkdown(
  categories: string[],
  items: PackingItem[],
  preTripTasks: string[],
) {
  const packingSections = categories.map((category) => {
    const categoryItems = items
      .filter((item) => item.category === category)
      .map((item) => `- [ ] ${item.name} x${item.quantity} (${item.bag})`);

    return [`## ${category}`, ...categoryItems].join("\n");
  });

  return [
    "# Packing checklist",
    ...packingSections,
    "## Before leaving",
    ...preTripTasks.map((task) => `- [ ] ${task}`),
  ].join("\n\n");
}

const pantryMealTemplates: MealTemplate[] = [
  {
    category: "rice bowl",
    ingredients: ["rice", "egg", "chicken", "broccoli", "soy sauce"],
    instructions: [
      "Warm rice and protein together.",
      "Add a quick vegetable side.",
      "Finish with sauce and an egg if available.",
    ],
    name: "Leftover protein rice bowl",
    tags: ["quick", "high protein", "leftovers"],
    timeMinutes: 20,
  },
  {
    category: "pasta",
    ingredients: ["pasta", "tomato", "cheese", "spinach", "chicken"],
    instructions: [
      "Boil pasta while simmering tomato sauce.",
      "Fold in greens near the end.",
      "Top with cheese or leftover protein.",
    ],
    name: "Tomato pasta with greens",
    tags: ["weeknight", "vegetarian optional"],
    timeMinutes: 30,
  },
  {
    category: "wrap",
    ingredients: ["tortilla", "bean", "chicken", "cheese", "carrot"],
    instructions: [
      "Warm tortillas and fillings.",
      "Add crunchy produce or a yogurt sauce.",
      "Roll as wraps or serve as quesadillas.",
    ],
    name: "Pantry bean wraps",
    tags: ["quick", "lunch"],
    timeMinutes: 18,
  },
  {
    category: "frittata",
    ingredients: ["egg", "spinach", "cheese", "carrot", "broccoli"],
    instructions: [
      "Saute vegetables until tender.",
      "Add beaten eggs and cheese.",
      "Cook gently until set.",
    ],
    name: "Use-first vegetable frittata",
    tags: ["use first", "high protein", "vegetarian"],
    timeMinutes: 25,
  },
  {
    category: "noodle bowl",
    ingredients: ["rice noodle", "soy sauce", "egg", "pea", "carrot"],
    instructions: [
      "Soak or boil noodles.",
      "Stir-fry vegetables and egg.",
      "Toss with sauce and adjust seasoning.",
    ],
    name: "Fast soy noodle bowl",
    tags: ["quick", "pantry"],
    timeMinutes: 22,
  },
  {
    category: "stew",
    ingredients: ["chickpea", "tomato", "spinach", "rice", "yogurt"],
    instructions: [
      "Simmer chickpeas with tomatoes.",
      "Add greens until wilted.",
      "Serve with rice and yogurt if available.",
    ],
    name: "Chickpea tomato stew",
    tags: ["vegetarian", "batch"],
    timeMinutes: 30,
  },
  {
    category: "soup",
    ingredients: ["chicken", "carrot", "pea", "rice", "broccoli"],
    instructions: [
      "Simmer protein, vegetables, and grain in broth.",
      "Season simply and keep portions for lunch.",
      "Add quick greens at the end.",
    ],
    name: "Clean-out-the-fridge soup",
    tags: ["leftovers", "batch"],
    timeMinutes: 35,
  },
  {
    category: "breakfast",
    ingredients: ["oat", "peanut butter", "yogurt", "egg"],
    instructions: [
      "Use oats as overnight oats or a warm bowl.",
      "Add yogurt or peanut butter for protein.",
      "Pair with eggs if a larger meal is needed.",
    ],
    name: "Protein oats breakfast",
    tags: ["breakfast", "budget"],
    timeMinutes: 10,
  },
  {
    category: "salad bowl",
    ingredients: ["spinach", "chickpea", "chicken", "carrot", "yogurt"],
    instructions: [
      "Use greens as the base.",
      "Add chickpeas or protein.",
      "Make a quick yogurt dressing.",
    ],
    name: "Use-first salad bowl",
    tags: ["quick", "use first"],
    timeMinutes: 15,
  },
  {
    category: "fried rice",
    ingredients: ["rice", "egg", "pea", "carrot", "soy sauce"],
    instructions: [
      "Use cold rice if available.",
      "Cook egg and vegetables first.",
      "Stir in rice and sauce until hot.",
    ],
    name: "Vegetable fried rice",
    tags: ["quick", "budget"],
    timeMinutes: 20,
  },
];

function parsePantryItems(input: string): PantryItem[] {
  const seen = new Set<string>();
  const items: PantryItem[] = [];

  for (const line of cleanLines(input)) {
    for (const token of splitPantryLine(line)) {
      const normalized = normalizeIngredientName(token);

      if (!normalized || seen.has(normalized)) {
        continue;
      }

      seen.add(normalized);
      items.push({
        category: inferPantryCategory(normalized),
        name: normalized,
        raw: token,
        useFirst: inferUseFirst(token),
      });
    }
  }

  return items;
}

function splitPantryLine(line: string) {
  const withoutSection = line.replace(/^[a-z][a-z\s/+-]{1,24}:\s*/i, "");
  return withoutSection
    .split(/[,;|]+|\s+-\s+/)
    .map((item) =>
      item
        .replace(/^\s*[-*+]\s*/, "")
        .replace(/\([^)]*\)/g, "")
        .trim(),
    )
    .filter((item) => item.length > 1);
}

function normalizeIngredientName(value: string) {
  if (
    /^\s*(?:no|avoid|under|less than|need|needs?|budget|buy|high protein|low carb)\b/i.test(
      value,
    )
  ) {
    return "";
  }

  const cleaned = value
    .toLowerCase()
    .replace(
      /\b(expires?|expiry|tomorrow|today|soon|leftover|leftovers|fresh|frozen|canned|cooked|raw|need|under|minutes?|mins?|dinners?|lunches?|breakfasts?|meals?|budget|buy|avoid|no|less|more|high protein|low carb)\b/gi,
      "",
    )
    .replace(
      /\b\d+(?:\.\d+)?\s*(?:cups?|lbs?|pounds?|oz|ounces?|g|kg|grams?|pack|packs|cans?|jars?|bottles?)\b/gi,
      "",
    )
    .replace(/\b\d+\b/g, "")
    .replace(/[^a-z\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (
    !cleaned ||
    /^(fridge|freezer|pantry|diet|constraints|need|notes|and|or|with|for|as|possible|little possible|seafood|pork|gluten|dairy)$/i.test(
      cleaned,
    )
  ) {
    return "";
  }

  return singularIngredient(cleaned);
}

function singularIngredient(value: string) {
  return value
    .replace(/\brice noodles\b/g, "rice noodle")
    .replace(/\bcanned tomatoes\b/g, "tomato")
    .replace(/\btomatoes\b/g, "tomato")
    .replace(/\bblack beans\b/g, "black bean")
    .replace(/\bchickpeas\b/g, "chickpea")
    .replace(/\btortillas\b/g, "tortilla")
    .replace(/\beggs\b/g, "egg")
    .replace(/\bcarrots\b/g, "carrot")
    .replace(/\bpeas\b/g, "pea")
    .replace(/\boats\b/g, "oat");
}

function inferUseFirst(text: string) {
  return /\b(expir|use first|leftover|left over|today|tomorrow|soon|opened|ripe|wilting|last)\b/i.test(
    text,
  );
}

function inferPantryCategory(name: string): PantryCategory {
  if (
    /\b(chicken|beef|pork|turkey|tofu|fish|shrimp|salmon|tuna|egg|eggs)\b/i.test(
      name,
    )
  ) {
    return "protein";
  }

  if (
    /\b(spinach|carrot|broccoli|pea|tomato|onion|garlic|pepper|lettuce|potato|mushroom|vegetable|fruit|banana|apple)\b/i.test(
      name,
    )
  ) {
    return "produce";
  }

  if (/\b(rice|pasta|noodle|tortilla|bread|oat|quinoa|flour)\b/i.test(name)) {
    return "grain";
  }

  if (/\b(bean|chickpea|lentil)\b/i.test(name)) {
    return "legume";
  }

  if (/\b(yogurt|cheese|cheddar|milk|cream|butter)\b/i.test(name)) {
    return "dairy";
  }

  if (/\b(soy sauce|sauce|salsa|vinegar|oil|dressing)\b/i.test(name)) {
    return "sauce";
  }

  if (/\b(salt|pepper|cumin|paprika|curry|turmeric|spice)\b/i.test(name)) {
    return "spice";
  }

  if (/\b(peanut butter|nut|seed|cereal|can|jar)\b/i.test(name)) {
    return "pantry";
  }

  return "unknown";
}

function inferMealPlanningConstraints(text: string): MealPlanningConstraints {
  const mealMatch = text.match(
    /\b(\d{1,2})\s*(?:dinners?|lunches?|breakfasts?|meals?)\b/i,
  );
  const maxMinutesMatch = text.match(
    /\b(?:under|less than|within|max|quick|in)\s*(\d{1,3})\s*(?:minutes?|mins?)\b/i,
  );
  const budgetMatch =
    text.match(/\$\s*(\d{1,4})(?:\.\d{1,2})?\b/i) ??
    text.match(
      /\b(?:budget|groceries|grocery|shopping|spend|cost|buy)\D{0,24}(\d{1,4})(?:\.\d{1,2})?\b/i,
    );
  const notes = [
    /\b(no seafood|avoid seafood|allergy seafood)\b/i.test(text)
      ? "Avoid seafood."
      : "",
    /\b(no pork|avoid pork|pork allergy)\b/i.test(text) ? "Avoid pork." : "",
    /\b(vegetarian|no meat)\b/i.test(text) ? "Prefer vegetarian meals." : "",
    /\b(vegan|no dairy|no eggs)\b/i.test(text)
      ? "Check dairy and egg ingredients manually."
      : "",
    /\b(gluten free|no gluten)\b/i.test(text)
      ? "Avoid wheat-based meals unless gluten-free swaps are available."
      : "",
    /\b(high protein|more protein)\b/i.test(text)
      ? "Prioritize protein-forward meals."
      : "",
  ].filter(Boolean);

  return {
    budget: budgetMatch?.[1] ? Number(budgetMatch[1]) : null,
    meals: mealMatch?.[1] ? Math.min(10, Math.max(1, Number(mealMatch[1]))) : 5,
    maxMinutes: maxMinutesMatch?.[1] ? Number(maxMinutesMatch[1]) : null,
    notes,
  };
}

function scoreMealTemplates(
  pantryItems: PantryItem[],
  constraints: MealPlanningConstraints,
): MealSuggestion[] {
  const pantryNames = pantryItems.map((item) => item.name);

  return pantryMealTemplates
    .filter((template) => mealPassesConstraints(template, constraints))
    .map((template) => {
      const have = template.ingredients.filter((ingredient) =>
        pantryNames.some((item) => ingredientMatches(item, ingredient)),
      );
      const missing = template.ingredients.filter(
        (ingredient) =>
          !pantryNames.some((item) => ingredientMatches(item, ingredient)),
      );
      const useFirst = pantryItems
        .filter(
          (item) =>
            item.useFirst &&
            template.ingredients.some((ingredient) =>
              ingredientMatches(item.name, ingredient),
            ),
        )
        .map((item) => item.name);
      const matchScore =
        have.length * 3 +
        useFirst.length * 2 -
        missing.length -
        Math.max(0, template.timeMinutes - (constraints.maxMinutes ?? 60)) / 10;

      return {
        category: template.category,
        have,
        instructions: template.instructions,
        matchScore,
        missing,
        name: template.name,
        timeMinutes: template.timeMinutes,
        useFirst,
      };
    })
    .sort(
      (left, right) =>
        right.matchScore - left.matchScore ||
        left.missing.length - right.missing.length ||
        left.timeMinutes - right.timeMinutes ||
        left.name.localeCompare(right.name),
    );
}

function mealPassesConstraints(
  template: MealTemplate,
  constraints: MealPlanningConstraints,
) {
  const text = `${template.name} ${template.ingredients.join(" ")} ${template.tags.join(" ")}`;
  const notes = constraints.notes.join(" ").toLowerCase();

  if (constraints.maxMinutes && template.timeMinutes > constraints.maxMinutes) {
    return false;
  }

  if (
    notes.includes("avoid seafood") &&
    /\b(fish|shrimp|salmon|tuna)\b/i.test(text)
  ) {
    return false;
  }

  if (notes.includes("avoid pork") && /\b(pork|bacon|ham)\b/i.test(text)) {
    return false;
  }

  if (
    notes.includes("prefer vegetarian") &&
    /\b(chicken|beef|pork|turkey|fish|shrimp|salmon|tuna)\b/i.test(text)
  ) {
    return false;
  }

  return true;
}

function ingredientMatches(item: string, ingredient: string) {
  return (
    item === ingredient ||
    item.includes(ingredient) ||
    ingredient.includes(item) ||
    (ingredient === "bean" && /\b(bean|black bean|kidney bean)\b/.test(item)) ||
    (ingredient === "tomato" && /\b(tomato|canned tomato)\b/.test(item)) ||
    (ingredient === "rice" && /\b(rice|cooked rice)\b/.test(item))
  );
}

function groceryRowsFromMeals(
  meals: MealSuggestion[],
  pantryItems: PantryItem[],
): DataRow[] {
  const pantryNames = pantryItems.map((item) => item.name);
  const byIngredient = new Map<
    string,
    { category: PantryCategory; item: string; meals: string[] }
  >();

  for (const meal of meals) {
    for (const missing of meal.missing) {
      if (pantryNames.some((item) => ingredientMatches(item, missing))) {
        continue;
      }

      const row = byIngredient.get(missing) ?? {
        category: inferPantryCategory(missing),
        item: titleCase(missing),
        meals: [],
      };
      row.meals.push(meal.name);
      byIngredient.set(missing, row);
    }
  }

  return Array.from(byIngredient.values()).map((row) => ({
    category: row.category,
    item: row.item,
    meals: row.meals.join("; "),
    priority: row.meals.length > 1 ? "high" : "normal",
  }));
}

function countPantryCategories(items: PantryItem[]) {
  return {
    dairy: items.filter((item) => item.category === "dairy").length,
    grain: items.filter((item) => item.category === "grain").length,
    legume: items.filter((item) => item.category === "legume").length,
    produce: items.filter((item) => item.category === "produce").length,
    protein: items.filter((item) => item.category === "protein").length,
    sauce: items.filter((item) =>
      ["pantry", "sauce", "spice", "unknown"].includes(item.category),
    ).length,
  };
}

function formatMealSuggestionLine(meal: MealSuggestion) {
  const missing =
    meal.missing.length > 0
      ? `Missing: ${meal.missing.map(titleCase).join(", ")}.`
      : "No missing core ingredients.";
  const useFirst =
    meal.useFirst.length > 0
      ? ` Uses first: ${meal.useFirst.map(titleCase).join(", ")}.`
      : "";

  return `${meal.name} - ${meal.timeMinutes} min, ${meal.have.length}/${meal.have.length + meal.missing.length} core ingredients covered. ${missing}${useFirst}`;
}

function mealPlanMarkdown(meals: MealSuggestion[]) {
  if (meals.length === 0) {
    return "No meal plan generated.";
  }

  return meals
    .map((meal, index) =>
      [
        `## Meal ${index + 1}: ${meal.name}`,
        `- Time: ${meal.timeMinutes} minutes`,
        `- Have: ${meal.have.map(titleCase).join(", ") || "None detected"}`,
        `- Missing: ${meal.missing.map(titleCase).join(", ") || "None"}`,
        `- Use first: ${meal.useFirst.map(titleCase).join(", ") || "No explicit use-first item"}`,
        "",
        "### Steps",
        ...meal.instructions.map((step) => `- ${step}`),
      ].join("\n"),
    )
    .join("\n\n");
}

function prepChecklistMarkdown(
  meals: MealSuggestion[],
  useFirstItems: PantryItem[],
) {
  return [
    "## Before shopping",
    ...(useFirstItems.length
      ? useFirstItems.map(
          (item) => `- [ ] Check and use ${titleCase(item.name)} first.`,
        )
      : ["- [ ] Check fridge, freezer, and pantry before buying duplicates."]),
    "- [ ] Confirm staples: oil, salt, pepper, and preferred spices.",
    "",
    "## Prep once",
    "- [ ] Cook or portion the main grain for bowls, wraps, or fried rice.",
    "- [ ] Wash and chop sturdy vegetables.",
    "- [ ] Move leftovers to eye-level containers.",
    "",
    "## Meals",
    ...meals.map((meal) => `- [ ] ${meal.name} (${meal.timeMinutes} min)`),
  ].join("\n");
}

function titleCase(value: string) {
  return value.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function parseSubscriptionCharges(input: string): SubscriptionCharge[] {
  const lines = cleanLines(input);
  const lineCharges = lines
    .map(parseSubscriptionLine)
    .filter((charge): charge is SubscriptionCharge => Boolean(charge));

  if (lineCharges.length > 0) {
    return lineCharges;
  }

  return parseRows(input)
    .map(subscriptionFromRow)
    .filter((charge): charge is SubscriptionCharge => Boolean(charge));
}

function parseSubscriptionLine(line: string): SubscriptionCharge | null {
  const amount = extractMoneyAmount(line);

  if (amount === null) {
    return null;
  }

  const cadence = inferSubscriptionCadence(line);
  const name = inferSubscriptionName(line);
  const decision = inferSubscriptionDecision(line, name);
  const category = inferSubscriptionCategory(line, name);
  const nextCharge = inferSubscriptionNextCharge(line);
  const monthlyCost = monthlyCostFromCadence(amount, cadence);
  const annualCost = monthlyCost * 12;

  return {
    amount,
    annualCost,
    cadence,
    category,
    confidence: cadence === "unknown" ? "medium" : "high",
    decision,
    monthlyCost,
    name,
    nextCharge,
    raw: line,
    reason: subscriptionDecisionReason(line, decision, category),
  };
}

function subscriptionFromRow(row: DataRow): SubscriptionCharge | null {
  const entries = Object.entries(row);
  const amountEntry = entries.find(
    ([key, value]) =>
      /amount|cost|price|charge|total/i.test(key) && typeof value === "number",
  );

  if (!amountEntry) {
    return null;
  }

  const nameEntry = entries.find(([key]) =>
    /name|merchant|service|vendor|description|subscription/i.test(key),
  );
  const cadenceEntry = entries.find(([key]) =>
    /cadence|frequency|cycle|period|renewal/i.test(key),
  );
  const dateEntry = entries.find(([key]) => /date|renew|due|next/i.test(key));
  const text = entries.map(([, value]) => String(value ?? "")).join(" ");
  const amount = Number(amountEntry[1]);
  const cadence = cadenceEntry
    ? inferSubscriptionCadence(String(cadenceEntry[1]))
    : inferSubscriptionCadence(text);
  const name =
    nameEntry && String(nameEntry[1]).trim()
      ? String(nameEntry[1]).trim()
      : inferSubscriptionName(text);
  const decision = inferSubscriptionDecision(text, name);
  const category = inferSubscriptionCategory(text, name);
  const monthlyCost = monthlyCostFromCadence(amount, cadence);

  return {
    amount,
    annualCost: monthlyCost * 12,
    cadence,
    category,
    confidence: "medium",
    decision,
    monthlyCost,
    name,
    nextCharge:
      dateEntry && String(dateEntry[1]).trim()
        ? String(dateEntry[1]).trim()
        : inferSubscriptionNextCharge(text),
    raw: JSON.stringify(row),
    reason: subscriptionDecisionReason(text, decision, category),
  };
}

function extractMoneyAmount(text: string) {
  const currencyMatch = text.match(
    /(?:[$]|usd|eur|gbp|vnd)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i,
  );

  if (currencyMatch?.[1]) {
    return Number(currencyMatch[1].replace(/,/g, ""));
  }

  const numericMatches = Array.from(
    text.matchAll(
      /\b([0-9][0-9,]*(?:\.[0-9]{1,2})?)\s*(?:usd|eur|gbp|vnd)?\s*(?:\/\s*(?:mo|month|yr|year|week|quarter))?\b/gi,
    ),
  );
  const likelyAmount =
    numericMatches.find((match) => match[1]?.includes(".")) ??
    numericMatches.at(-1);

  if (!likelyAmount?.[1]) {
    return null;
  }

  const value = Number(likelyAmount[1].replace(/,/g, ""));
  return Number.isFinite(value) ? value : null;
}

function inferSubscriptionCadence(text: string): SubscriptionCadence {
  if (/\b(annual|annually|yearly|per year|\/yr|\/year|1y)\b/i.test(text)) {
    return "annual";
  }

  if (/\b(quarterly|per quarter|\/qtr|every 3 months)\b/i.test(text)) {
    return "quarterly";
  }

  if (/\b(weekly|per week|\/wk|\/week)\b/i.test(text)) {
    return "weekly";
  }

  if (/\b(monthly|per month|\/mo|\/month|every month|renews)\b/i.test(text)) {
    return "monthly";
  }

  return "unknown";
}

function inferSubscriptionName(text: string) {
  return (
    text
      .replace(/(?:[$]|usd|eur|gbp|vnd)\s*[0-9][0-9,]*(?:\.[0-9]{1,2})?/gi, "")
      .replace(/\b[0-9][0-9,]*(?:\.[0-9]{1,2})?\s*(?:usd|eur|gbp|vnd)\b/gi, "")
      .replace(
        /\b(monthly|annual|annually|yearly|weekly|quarterly|renews?|renewal|due|after|before|every|per|keep|cancel|review|maybe|unused|used daily|essential)\b/gi,
        "",
      )
      .replace(/\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/g, "")
      .replace(
        /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{1,2}\b/gi,
        "",
      )
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80) || "Unnamed recurring charge"
  );
}

function inferSubscriptionDecision(
  text: string,
  name: string,
): SubscriptionDecision {
  const combined = `${text} ${name}`.toLowerCase();

  if (
    /\b(cancel|unused|not using|forgot|duplicate|trial|free trial|waste|too expensive|kill|churn)\b/.test(
      combined,
    )
  ) {
    return "cancel";
  }

  if (
    /\b(essential|rent|mortgage|insurance|internet|phone|electric|water|gas|utility|school|medical|medicine|needed|daily|work|family|shared)\b/.test(
      combined,
    )
  ) {
    return "keep";
  }

  return "review";
}

function inferSubscriptionCategory(text: string, name: string) {
  const combined = `${text} ${name}`.toLowerCase();

  if (/\b(netflix|spotify|hulu|disney|youtube|music|stream)\b/.test(combined)) {
    return "entertainment";
  }

  if (
    /\b(chatgpt|notion|adobe|figma|github|cloud|saas|domain|hosting)\b/.test(
      combined,
    )
  ) {
    return "software";
  }

  if (/\b(gym|fitness|doctor|medical|medicine|health)\b/.test(combined)) {
    return "health";
  }

  if (
    /\b(internet|phone|electric|water|gas|utility|rent|insurance)\b/.test(
      combined,
    )
  ) {
    return "essential bill";
  }

  if (/\b(course|book|school|learn|education)\b/.test(combined)) {
    return "learning";
  }

  return "subscription";
}

function inferSubscriptionNextCharge(text: string) {
  const explicitDate = text.match(
    /\b(?:renews?|renewal|due|after|before|on)?\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{1,2}|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\b/i,
  );

  return explicitDate?.[1]?.trim() ?? "unknown";
}

function monthlyCostFromCadence(amount: number, cadence: SubscriptionCadence) {
  if (cadence === "annual") {
    return amount / 12;
  }

  if (cadence === "quarterly") {
    return amount / 3;
  }

  if (cadence === "weekly") {
    return (amount * 52) / 12;
  }

  return amount;
}

function subscriptionDecisionReason(
  text: string,
  decision: SubscriptionDecision,
  category: string,
) {
  if (decision === "cancel") {
    if (/\b(trial|free trial)\b/i.test(text)) {
      return "Trial or promo language detected; confirm before it converts.";
    }

    if (/\b(unused|not using|forgot|duplicate)\b/i.test(text)) {
      return "Usage text suggests this is not currently needed.";
    }

    return "Cancellation wording or waste signal detected.";
  }

  if (decision === "keep") {
    return category === "essential bill"
      ? "Essential bill or utility language detected."
      : "Usage, work, family, or shared-plan language detected.";
  }

  return "No strong keep or cancel signal; review usage and next charge date.";
}

function compareSubscriptionCharges(
  left: SubscriptionCharge,
  right: SubscriptionCharge,
) {
  return (
    subscriptionDecisionRank(left.decision) -
      subscriptionDecisionRank(right.decision) ||
    right.monthlyCost - left.monthlyCost ||
    left.name.localeCompare(right.name)
  );
}

function subscriptionDecisionRank(decision: SubscriptionDecision) {
  if (decision === "cancel") {
    return 0;
  }

  if (decision === "review") {
    return 1;
  }

  return 2;
}

function sumCharges(
  charges: SubscriptionCharge[],
  field: "annualCost" | "monthlyCost",
) {
  return charges.reduce((total, charge) => total + charge[field], 0);
}

function countByCadence(
  charges: SubscriptionCharge[],
  cadence: SubscriptionCadence,
) {
  return charges.filter((charge) => charge.cadence === cadence).length;
}

function formatSubscriptionLine(charge: SubscriptionCharge) {
  return `${charge.name}: ${formatMoney(charge.monthlyCost)}/mo (${charge.cadence}, ${charge.category}) - ${charge.reason}${charge.nextCharge === "unknown" ? "" : ` Next charge: ${charge.nextCharge}.`}`;
}

function subscriptionChecklistMarkdown(
  cancelCharges: SubscriptionCharge[],
  reviewCharges: SubscriptionCharge[],
) {
  return [
    "## Cancel first",
    ...(cancelCharges.length
      ? cancelCharges.map(
          (charge) =>
            `- [ ] ${charge.name} - ${formatMoney(charge.monthlyCost)}/mo. ${charge.reason}`,
        )
      : ["- [ ] No obvious cancel-first item detected from this input."]),
    "",
    "## Review before renewal",
    ...(reviewCharges.length
      ? reviewCharges.map(
          (charge) =>
            `- [ ] ${charge.name} - check usage, owner, and next charge${charge.nextCharge === "unknown" ? "." : ` on ${charge.nextCharge}.`}`,
        )
      : [
          "- [ ] Add annual plans, app-store subscriptions, and card-only charges.",
        ]),
    "",
    "## Before canceling",
    "- Export invoices or data you may need later.",
    "- Confirm family, team, storage, and work dependencies.",
    "- Save cancellation confirmation numbers or emails.",
  ].join("\n");
}

function renewalReminderRows(charges: SubscriptionCharge[]): DataRow[] {
  return charges
    .filter((charge) => charge.nextCharge !== "unknown")
    .map((charge) => ({
      Description: `${charge.decision.toUpperCase()}: ${charge.reason} Estimated ${formatMoney(charge.monthlyCost)}/mo.`,
      "Start Date": charge.nextCharge,
      Subject: `Review ${charge.name} renewal`,
    }));
}

function formatMoney(value: number) {
  return `$${roundMoney(value).toFixed(2)}`;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function parseReturnWarrantyItems(input: string): ReturnWarrantyItem[] {
  const lines = cleanLines(input);
  const lineItems = lines
    .map(parseReturnWarrantyLine)
    .filter((item): item is ReturnWarrantyItem => Boolean(item));

  if (lineItems.length > 0) {
    return lineItems;
  }

  return parseRows(input)
    .map(returnWarrantyFromRow)
    .filter((item): item is ReturnWarrantyItem => Boolean(item));
}

function parseReturnWarrantyLine(line: string): ReturnWarrantyItem | null {
  const purchaseDate = inferPurchaseDate(line);
  const amount = extractMoneyAmount(line);
  const merchant = inferPurchaseMerchant(line);
  const item = inferPurchaseItem(line, merchant);
  const returnDays = inferReturnDays(line, merchant, item);
  const warrantyMonths = inferWarrantyMonths(line, item);
  const returnDeadline = purchaseDate
    ? formatReturnDate(addDateDays(purchaseDate, returnDays))
    : "unknown";
  const warrantyDeadline =
    purchaseDate && warrantyMonths > 0
      ? formatReturnDate(addDateMonths(purchaseDate, warrantyMonths))
      : "unknown";
  const proofGaps = inferReturnWarrantyProofGaps(line);
  const status = inferReturnWarrantyStatus({
    purchaseDate,
    returnDeadline,
    warrantyDeadline,
  });

  if (
    !purchaseDate &&
    !amount &&
    !/\b(receipt|return|warranty|bought|purchased|order)\b/i.test(line)
  ) {
    return null;
  }

  return {
    action: returnWarrantyAction(status, returnDeadline, warrantyDeadline),
    amount,
    confidence: purchaseDate ? "high" : "low",
    item,
    merchant,
    proofGaps,
    purchaseDate: purchaseDate ? formatReturnDate(purchaseDate) : "unknown",
    raw: line,
    returnDays,
    returnDeadline,
    status,
    warrantyDeadline,
    warrantyMonths,
  };
}

function returnWarrantyFromRow(row: DataRow): ReturnWarrantyItem | null {
  const entries = Object.entries(row);
  const text = entries.map(([, value]) => String(value ?? "")).join(" ");
  const dateEntry = entries.find(([key]) =>
    /date|purchased|bought|order/i.test(key),
  );
  const merchantEntry = entries.find(([key]) =>
    /merchant|store|seller|vendor/i.test(key),
  );
  const itemEntry = entries.find(([key]) =>
    /item|product|description|name/i.test(key),
  );
  const amountEntry = entries.find(
    ([key, value]) =>
      /amount|price|total|cost/i.test(key) && typeof value === "number",
  );
  const purchaseDate =
    dateEntry && String(dateEntry[1]).trim()
      ? parseLooseDate(String(dateEntry[1]))
      : inferPurchaseDate(text);

  if (!purchaseDate && !amountEntry) {
    return null;
  }

  const merchant =
    merchantEntry && String(merchantEntry[1]).trim()
      ? String(merchantEntry[1]).trim()
      : inferPurchaseMerchant(text);
  const item =
    itemEntry && String(itemEntry[1]).trim()
      ? String(itemEntry[1]).trim()
      : inferPurchaseItem(text, merchant);
  const returnDays = inferReturnDays(text, merchant, item);
  const warrantyMonths = inferWarrantyMonths(text, item);
  const returnDeadline = purchaseDate
    ? formatReturnDate(addDateDays(purchaseDate, returnDays))
    : "unknown";
  const warrantyDeadline =
    purchaseDate && warrantyMonths > 0
      ? formatReturnDate(addDateMonths(purchaseDate, warrantyMonths))
      : "unknown";
  const status = inferReturnWarrantyStatus({
    purchaseDate,
    returnDeadline,
    warrantyDeadline,
  });

  return {
    action: returnWarrantyAction(status, returnDeadline, warrantyDeadline),
    amount:
      typeof amountEntry?.[1] === "number"
        ? Number(amountEntry[1])
        : extractMoneyAmount(text),
    confidence: purchaseDate ? "medium" : "low",
    item,
    merchant,
    proofGaps: inferReturnWarrantyProofGaps(text),
    purchaseDate: purchaseDate ? formatReturnDate(purchaseDate) : "unknown",
    raw: JSON.stringify(row),
    returnDays,
    returnDeadline,
    status,
    warrantyDeadline,
    warrantyMonths,
  };
}

function inferPurchaseDate(text: string) {
  const explicit =
    text.match(
      /\b(?:purchased|bought|ordered|order date|purchase date)\s*(?:on|:)?\s*([a-z]{3,9}\s+\d{1,2},?\s*\d{0,4}|\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\b/i,
    )?.[1] ??
    text.match(
      /\b([a-z]{3,9}\s+\d{1,2},?\s*\d{0,4}|\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\b/i,
    )?.[1];

  return explicit ? parseLooseDate(explicit) : null;
}

function parseLooseDate(value: string) {
  const cleaned = value.trim().replace(/,$/, "");
  const currentYear = new Date().getFullYear();
  const shortNumeric = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2})$/);

  if (shortNumeric) {
    const [, month = "1", day = "1", shortYear = "0"] = shortNumeric;
    return new Date(2000 + Number(shortYear), Number(month) - 1, Number(day));
  }

  const withYear = /\b\d{4}\b/.test(cleaned)
    ? cleaned
    : `${cleaned} ${currentYear}`;
  const parsed = new Date(withYear);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function inferPurchaseMerchant(text: string) {
  const knownMerchant = findKnownMerchant(text);
  if (knownMerchant) {
    return knownMerchant;
  }

  const beforeDash = text.split(/\s+-\s+|,/)[0]?.trim();
  const explicit =
    text.match(/\b(?:merchant|store|seller|vendor)\s*:\s*([^,\n-]+)/i)?.[1] ??
    beforeDash;

  const merchant = cleanupPurchaseLabel(
    (explicit || "Unknown merchant")
      .replace(/(?:[$]|usd|eur|gbp|vnd)\s*[0-9].*$/i, "")
      .replace(/\b(?:purchased|bought|ordered|return|warranty)\b.*$/i, ""),
  );

  return merchant || "Unknown merchant";
}

function inferPurchaseItem(text: string, merchant: string) {
  const parts = text
    .split(/\s+-\s+|,/)
    .map((part) => cleanupPurchaseLabel(part))
    .filter(Boolean);
  const afterMerchant = text
    .replace(
      new RegExp(`^\\s*${escapeRegExp(merchant)}\\b\\s*[-:]?\\s*`, "i"),
      "",
    )
    .replace(/^\s*[-*+]\s*/, "");
  const beforePolicy = afterMerchant.split(
    /\s+(?:purchased|bought|ordered|return|warranty|receipt|serial|box|email|saved|need|no receipt|maybe)\b/i,
  )[0];
  const beforeAmount = beforePolicy.split(
    /(?:[$]|usd|eur|gbp|vnd)\s*[0-9][0-9,]*(?:\.[0-9]{1,2})?/i,
  )[0];
  const directItem = cleanupPurchaseLabel(beforeAmount);

  if (directItem) {
    return directItem;
  }

  const candidate = parts.find(
    (part) =>
      part.toLowerCase() !== merchant.toLowerCase() &&
      !/\b(purchased|bought|ordered|return|warranty|receipt|serial|box|email|saved|maybe|too small|too large)\b/i.test(
        part,
      ) &&
      !/[$]\s*\d/.test(part),
  );

  if (candidate) {
    return candidate;
  }

  return (
    cleanupPurchaseLabel(
      text
        .replace(merchant, "")
        .replace(
          /(?:[$]|usd|eur|gbp|vnd)\s*[0-9][0-9,]*(?:\.[0-9]{1,2})?/gi,
          "",
        )
        .replace(
          /\b(purchased|bought|ordered|return|warranty|receipt|serial|saved|email|box|closet|need|no|yet)\b/gi,
          "",
        )
        .replace(
          /\b\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/g,
          "",
        )
        .slice(0, 90),
    ) || "Unnamed purchase"
  );
}

function findKnownMerchant(text: string) {
  const knownMerchants = [
    "Amazon",
    "Apple Store",
    "Apple",
    "Best Buy",
    "Costco",
    "Home Depot",
    "IKEA",
    "Nike",
    "Target",
    "Walmart",
    "Williams Sonoma",
    "Zappos",
  ];
  const normalizedText = text.toLowerCase();

  return (
    knownMerchants.find((merchant) =>
      new RegExp(`\\b${escapeRegExp(merchant.toLowerCase())}\\b`).test(
        normalizedText,
      ),
    ) ?? null
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanupPurchaseLabel(value: string) {
  return value
    .replace(/^\s*[-*+]\s*/, "")
    .replace(/\s+[-:]\s*$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);
}

function inferReturnDays(text: string, merchant: string, item: string) {
  const explicit = text.match(
    /\b(\d{1,3})\s*(?:day|days)[-\s]*(?:return|refund|exchange|window)\b/i,
  );

  if (explicit?.[1]) {
    return Number(explicit[1]);
  }

  const combined = `${merchant} ${item}`.toLowerCase();

  if (/\bapple\b/.test(combined)) {
    return 14;
  }

  if (/\bbest buy\b/.test(combined)) {
    return 30;
  }

  if (/\btarget|walmart|home depot|ikea\b/.test(combined)) {
    return 90;
  }

  if (/\bcostco\b/.test(combined)) {
    return 90;
  }

  if (/\bnike|zappos\b/.test(combined)) {
    return 60;
  }

  return 30;
}

function inferWarrantyMonths(text: string, item: string) {
  const years = text.match(
    /\b(\d{1,2})\s*(?:year|years|yr|yrs)[-\s]*(?:warranty|coverage|guarantee)\b/i,
  );

  if (years?.[1]) {
    return Number(years[1]) * 12;
  }

  const months = text.match(
    /\b(\d{1,3})\s*(?:month|months|mo)[-\s]*(?:warranty|coverage|guarantee)\b/i,
  );

  if (months?.[1]) {
    return Number(months[1]);
  }

  if (/\b(no warranty|as is|final sale)\b/i.test(text)) {
    return 0;
  }

  if (
    /\b(laptop|monitor|phone|headphone|airpods|camera|appliance|blender|desk|chair|tool|lamp|printer|router|watch)\b/i.test(
      item,
    )
  ) {
    return 12;
  }

  return 0;
}

function inferReturnWarrantyProofGaps(text: string) {
  const gaps: string[] = [];

  if (!/\b(receipt|invoice|order email|email receipt|proof)\b/i.test(text)) {
    gaps.push("Save receipt, invoice, order email, or card statement proof.");
  }

  if (
    /\b(warranty|serial|electronics?|monitor|airpods|appliance|tool|lamp)\b/i.test(
      text,
    ) &&
    !/\bserial\b/i.test(text)
  ) {
    gaps.push("Add serial number or product label photo for warranty claims.");
  }

  if (!/\b(box|packaging|tag|label|accessor|manual)\b/i.test(text)) {
    gaps.push(
      "Confirm packaging, tags, accessories, and manuals are still available.",
    );
  }

  return gaps.slice(0, 3);
}

function inferReturnWarrantyStatus({
  purchaseDate,
  returnDeadline,
  warrantyDeadline,
}: {
  purchaseDate: Date | null;
  returnDeadline: string;
  warrantyDeadline: string;
}): ReturnWarrantyStatus {
  if (!purchaseDate) {
    return "missing-date";
  }

  const returnDaysRemaining = daysUntilDate(returnDeadline);
  const warrantyDaysRemaining = daysUntilDate(warrantyDeadline);

  if (returnDaysRemaining !== null && returnDaysRemaining >= 0) {
    return returnDaysRemaining <= 7 ? "return-soon" : "return-open";
  }

  if (warrantyDaysRemaining !== null && warrantyDaysRemaining >= 0) {
    return "warranty-watch";
  }

  return "expired";
}

function returnWarrantyAction(
  status: ReturnWarrantyStatus,
  returnDeadline: string,
  warrantyDeadline: string,
) {
  if (status === "return-soon") {
    return `Decide keep vs return now; deadline ${returnDeadline}.`;
  }

  if (status === "return-open") {
    return `Set a reminder 3-7 days before the return deadline (${returnDeadline}).`;
  }

  if (status === "warranty-watch") {
    return `Test the item, save proof, and set warranty reminder before ${warrantyDeadline}.`;
  }

  if (status === "missing-date") {
    return "Add purchase date and merchant policy before relying on the tracker.";
  }

  return "Archive the receipt and keep warranty proof only if coverage still applies elsewhere.";
}

function compareReturnWarrantyItems(
  left: ReturnWarrantyItem,
  right: ReturnWarrantyItem,
) {
  return (
    returnWarrantyStatusRank(left.status) -
      returnWarrantyStatusRank(right.status) ||
    nullableDaysUntil(left.returnDeadline) -
      nullableDaysUntil(right.returnDeadline) ||
    left.item.localeCompare(right.item)
  );
}

function returnWarrantyStatusRank(status: ReturnWarrantyStatus) {
  const ranks: Record<ReturnWarrantyStatus, number> = {
    "return-soon": 0,
    "return-open": 1,
    "warranty-watch": 2,
    "missing-date": 3,
    expired: 4,
  };

  return ranks[status];
}

function nullableDaysUntil(dateText: string) {
  return daysUntilDate(dateText) ?? Number.POSITIVE_INFINITY;
}

function formatReturnWarrantyLine(item: ReturnWarrantyItem) {
  const amount = item.amount === null ? "" : `, ${formatMoney(item.amount)}`;
  const proof = item.proofGaps.length > 0 ? ` Proof: ${item.proofGaps[0]}` : "";

  return `${item.item} at ${item.merchant}${amount} - ${item.status}; return by ${item.returnDeadline}; warranty until ${item.warrantyDeadline}. ${item.action}${proof}`;
}

function returnWarrantyRows(items: ReturnWarrantyItem[]): DataRow[] {
  return items.map((item) => ({
    merchant: item.merchant,
    item: item.item,
    purchase_date: item.purchaseDate,
    amount: item.amount,
    return_days: item.returnDays,
    return_deadline: item.returnDeadline,
    warranty_months: item.warrantyMonths,
    warranty_deadline: item.warrantyDeadline,
    status: item.status,
    action: item.action,
    proof_gaps: item.proofGaps.join("; "),
  }));
}

function returnWarrantyReminderRows(items: ReturnWarrantyItem[]): DataRow[] {
  return items.flatMap((item) => {
    const rows: DataRow[] = [];

    if (item.returnDeadline !== "unknown" && item.status !== "expired") {
      rows.push({
        Description: `${item.action} Proof gaps: ${item.proofGaps.join("; ") || "none detected"}`,
        "Start Date": item.returnDeadline,
        Subject: `Return decision: ${item.item}`,
      });
    }

    if (item.warrantyDeadline !== "unknown") {
      rows.push({
        Description: `Test item and gather receipt/serial before warranty expires. Merchant: ${item.merchant}.`,
        "Start Date": item.warrantyDeadline,
        Subject: `Warranty check: ${item.item}`,
      });
    }

    return rows;
  });
}

function returnWarrantyChecklistMarkdown(items: ReturnWarrantyItem[]) {
  const urgent = items.filter((item) => item.status === "return-soon");
  const watch = items.filter((item) => item.status === "warranty-watch");

  return [
    "## Decide this week",
    ...(urgent.length
      ? urgent.map((item) => `- [ ] ${formatReturnWarrantyLine(item)}`)
      : ["- [ ] No return deadline appears to close this week."]),
    "",
    "## Proof to gather",
    ...items
      .flatMap((item) =>
        item.proofGaps.map((gap) => `- [ ] ${item.item}: ${gap}`),
      )
      .slice(0, 12),
    "",
    "## Warranty checks",
    ...(watch.length
      ? watch.map((item) => `- [ ] ${item.item}: ${item.action}`)
      : [
          "- [ ] Add serial numbers and warranty terms for expensive durable goods.",
        ]),
    "",
    "## Before acting",
    "- Verify the merchant return policy and refund method.",
    "- Keep copies of receipts, order emails, serial numbers, and support messages.",
    "- For legal or consumer-rights disputes, use official consumer-protection guidance instead of this tool.",
  ].join("\n");
}

function parseMaintenanceTasks(input: string): MaintenanceTask[] {
  const lines = cleanLines(input);
  const lineTasks = lines
    .map(parseMaintenanceLine)
    .filter((task): task is MaintenanceTask => Boolean(task));

  if (lineTasks.length > 0) {
    return lineTasks;
  }

  return parseRows(input)
    .map(maintenanceFromRow)
    .filter((task): task is MaintenanceTask => Boolean(task));
}

function parseMaintenanceLine(line: string): MaintenanceTask | null {
  if (!isLikelyMaintenanceLine(line)) {
    return null;
  }

  const task = inferMaintenanceTaskName(line);
  const asset = inferMaintenanceAsset(line, task);
  const category = inferMaintenanceCategory(line, asset, task);
  const cadence = inferMaintenanceCadence(line, category, task);
  const lastDoneDate = inferMaintenanceLastDone(line);
  const explicitDueDate = inferMaintenanceDueDate(line);
  const nextDueDate =
    explicitDueDate ?? nextMaintenanceDate(lastDoneDate, cadence);
  const supplies = inferMaintenanceSupplies(line);
  const notes = inferMaintenanceNotes(line, category);

  return {
    asset,
    cadence,
    category,
    confidence:
      explicitDueDate || (lastDoneDate && cadence !== "unknown")
        ? "high"
        : cadence === "unknown"
          ? "low"
          : "medium",
    lastDone: lastDoneDate ? formatReturnDate(lastDoneDate) : "unknown",
    nextDue: nextDueDate ? formatReturnDate(nextDueDate) : "unknown",
    notes,
    raw: line,
    status: inferMaintenanceStatus(nextDueDate, cadence, lastDoneDate),
    supplies,
    task,
  };
}

function maintenanceFromRow(row: DataRow): MaintenanceTask | null {
  const entries = Object.entries(row);
  const text = entries.map(([, value]) => String(value ?? "")).join(" ");

  if (!isLikelyMaintenanceLine(text)) {
    return null;
  }

  const taskEntry = entries.find(([key]) =>
    /task|maintenance|chore|job|action/i.test(key),
  );
  const assetEntry = entries.find(([key]) =>
    /asset|room|appliance|system|item|name/i.test(key),
  );
  const dueEntry = entries.find(([key]) => /due|next|deadline/i.test(key));
  const lastDoneEntry = entries.find(([key]) =>
    /last|done|completed|changed|cleaned|replaced/i.test(key),
  );
  const task =
    taskEntry && String(taskEntry[1]).trim()
      ? String(taskEntry[1]).trim()
      : inferMaintenanceTaskName(text);
  const asset =
    assetEntry && String(assetEntry[1]).trim()
      ? String(assetEntry[1]).trim()
      : inferMaintenanceAsset(text, task);
  const category = inferMaintenanceCategory(text, asset, task);
  const cadence = inferMaintenanceCadence(text, category, task);
  const lastDoneDate =
    lastDoneEntry && String(lastDoneEntry[1]).trim()
      ? parseLooseDate(String(lastDoneEntry[1]))
      : inferMaintenanceLastDone(text);
  const explicitDueDate =
    dueEntry && String(dueEntry[1]).trim()
      ? parseLooseDate(String(dueEntry[1]))
      : inferMaintenanceDueDate(text);
  const nextDueDate =
    explicitDueDate ?? nextMaintenanceDate(lastDoneDate, cadence);

  return {
    asset,
    cadence,
    category,
    confidence:
      explicitDueDate || (lastDoneDate && cadence !== "unknown")
        ? "medium"
        : cadence === "unknown"
          ? "low"
          : "medium",
    lastDone: lastDoneDate ? formatReturnDate(lastDoneDate) : "unknown",
    nextDue: nextDueDate ? formatReturnDate(nextDueDate) : "unknown",
    notes: inferMaintenanceNotes(text, category),
    raw: JSON.stringify(row),
    status: inferMaintenanceStatus(nextDueDate, cadence, lastDoneDate),
    supplies: inferMaintenanceSupplies(text),
    task,
  };
}

function isLikelyMaintenanceLine(text: string) {
  return /\b(filter|hvac|furnace|air purifier|water heater|dryer|vent|gutter|roof|smoke|detector|battery|appliance|washer|dishwasher|refrigerator|fridge|coil|clean|replace|changed|flush|inspect|service|repair|maintenance|monthly|quarterly|annual|annually|yearly|season|spring|fall|autumn|winter|summer|last done|last changed|due)\b/i.test(
    text,
  );
}

function inferMaintenanceTaskName(text: string) {
  const cleaned = cleanupPurchaseLabel(
    text
      .replace(
        /\b(?:last|done|changed|replaced|cleaned|serviced|completed|due|next)\b.*$/i,
        "",
      )
      .replace(/\b(?:every|monthly|quarterly|annually|annual|yearly)\b.*$/i, "")
      .replace(
        /\b(?:spring|summer|fall|autumn|winter)(?:\s+and\s+(?:spring|summer|fall|autumn|winter))*\b/gi,
        "",
      )
      .replace(/\b\d{1,2}x\d{1,2}x\d{1,2}\b/gi, "")
      .replace(/\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/g, "")
      .replace(/[,\s-]+$/g, "")
      .replace(/\s+/g, " "),
  );

  if (cleaned) {
    return titleCase(cleaned);
  }

  if (/\bfilter\b/i.test(text)) {
    return "Replace Filter";
  }

  if (/\bclean\b/i.test(text)) {
    return "Clean Asset";
  }

  if (/\binspect|check|test\b/i.test(text)) {
    return "Inspect Asset";
  }

  return "Maintenance Task";
}

function inferMaintenanceAsset(text: string, task: string) {
  const combined = `${text} ${task}`;

  const knownAssets = [
    "HVAC",
    "furnace",
    "air purifier",
    "water heater",
    "dryer vent",
    "dryer",
    "gutter",
    "smoke detector",
    "carbon monoxide detector",
    "refrigerator",
    "fridge",
    "washer",
    "washing machine",
    "dishwasher",
    "bathroom fan",
    "range hood",
    "roof",
    "sump pump",
    "car",
  ];

  const asset = knownAssets.find((knownAsset) =>
    new RegExp(`\\b${escapeRegExp(knownAsset)}s?\\b`, "i").test(combined),
  );

  if (asset) {
    return titleCase(asset);
  }

  const beforeDash = text.split(/\s+-\s+|:/)[0]?.trim();
  return cleanupPurchaseLabel(beforeDash || task).slice(0, 80) || "Home";
}

function inferMaintenanceCategory(text: string, asset: string, task: string) {
  const combined = `${text} ${asset} ${task}`.toLowerCase();

  if (/\b(filter|hvac|furnace|air purifier|water filter)\b/.test(combined)) {
    return "filters";
  }

  if (/\b(smoke|carbon monoxide|detector|battery|alarm)\b/.test(combined)) {
    return "safety";
  }

  if (
    /\b(gutter|roof|spring|fall|autumn|winter|summer|season)\b/.test(combined)
  ) {
    return "seasonal";
  }

  if (
    /\b(dryer|washer|dishwasher|refrigerator|fridge|water heater|appliance)\b/.test(
      combined,
    )
  ) {
    return "appliances";
  }

  if (/\b(clean|dust|wash|vent|coil|fan)\b/.test(combined)) {
    return "cleaning";
  }

  if (
    /\b(repair|noisy|leak|plumbing|electrical|gas|structural)\b/.test(combined)
  ) {
    return "repair review";
  }

  return "general upkeep";
}

function inferMaintenanceCadence(
  text: string,
  category: string,
  task: string,
): MaintenanceCadence {
  const combined = `${text} ${category} ${task}`;
  const explicit = combined.match(
    /\bevery\s+(\d{1,3})\s*(day|days|week|weeks|month|months|year|years)\b/i,
  );

  if (explicit?.[1] && explicit[2]) {
    return cadenceFromDays(
      intervalToDays(Number(explicit[1]), explicit[2].toLowerCase()),
    );
  }

  if (/\b(weekly|every week)\b/i.test(combined)) {
    return "weekly";
  }

  if (/\b(monthly|every month)\b/i.test(combined)) {
    return "monthly";
  }

  if (/\b(quarterly|every quarter|every 3 months|90 days)\b/i.test(combined)) {
    return "quarterly";
  }

  if (
    /\b(semiannual|semi-annual|twice a year|every 6 months|6 months)\b/i.test(
      combined,
    )
  ) {
    return "semiannual";
  }

  if (/\b(annual|annually|yearly|once a year|every year)\b/i.test(combined)) {
    return "annual";
  }

  if (
    /\b(spring|fall|autumn|winter|summer|seasonal|season)\b/i.test(combined)
  ) {
    return "seasonal";
  }

  if (category === "filters") {
    return "quarterly";
  }

  if (category === "safety" || category === "appliances") {
    return "annual";
  }

  if (category === "seasonal") {
    return "semiannual";
  }

  if (category === "cleaning") {
    return "monthly";
  }

  return "unknown";
}

function intervalToDays(value: number, unit: string) {
  if (unit.startsWith("day")) {
    return value;
  }

  if (unit.startsWith("week")) {
    return value * 7;
  }

  if (unit.startsWith("month")) {
    return value * 30;
  }

  return value * 365;
}

function cadenceFromDays(days: number): MaintenanceCadence {
  if (days <= 10) {
    return "weekly";
  }

  if (days <= 45) {
    return "monthly";
  }

  if (days <= 120) {
    return "quarterly";
  }

  if (days <= 240) {
    return "semiannual";
  }

  return "annual";
}

function maintenanceCadenceDays(cadence: MaintenanceCadence) {
  const days: Record<MaintenanceCadence, number | null> = {
    annual: 365,
    monthly: 30,
    quarterly: 90,
    seasonal: 180,
    semiannual: 180,
    unknown: null,
    weekly: 7,
  };

  return days[cadence];
}

function inferMaintenanceLastDone(text: string) {
  const explicit =
    text.match(
      /\b(?:last\s+(?:done|changed|replaced|cleaned|serviced|completed)|done|changed|replaced|cleaned|serviced|completed)\s*(?:on|:)?\s*([a-z]{3,9}\s+\d{1,2},?\s*\d{0,4}|\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\b/i,
    )?.[1] ??
    text.match(
      /\blast\s+(?:spring|summer|fall|autumn|winter|month|week|year)\b/i,
    )?.[0];

  if (!explicit) {
    return null;
  }

  return parseRelativeMaintenanceDate(explicit);
}

function inferMaintenanceDueDate(text: string) {
  const explicit = text.match(
    /\b(?:due|next|by)\s*(?:on|:)?\s*([a-z]{3,9}\s+\d{1,2},?\s*\d{0,4}|\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\b/i,
  )?.[1];

  return explicit ? parseLooseDate(explicit) : null;
}

function parseRelativeMaintenanceDate(value: string) {
  const lower = value.toLowerCase();
  const today = new Date();

  if (lower === "last week") {
    return addDateDays(today, -7);
  }

  if (lower === "last month") {
    return addDateMonths(today, -1);
  }

  if (lower === "last year") {
    return addDateMonths(today, -12);
  }

  if (lower.includes("spring")) {
    return new Date(today.getFullYear() - 1, 3, 1);
  }

  if (lower.includes("summer")) {
    return new Date(today.getFullYear() - 1, 6, 1);
  }

  if (lower.includes("fall") || lower.includes("autumn")) {
    return new Date(today.getFullYear() - 1, 9, 1);
  }

  if (lower.includes("winter")) {
    return new Date(today.getFullYear() - 1, 0, 1);
  }

  return parseLooseDate(value);
}

function nextMaintenanceDate(
  lastDoneDate: Date | null,
  cadence: MaintenanceCadence,
) {
  if (!lastDoneDate) {
    return null;
  }

  const days = maintenanceCadenceDays(cadence);
  return days ? addDateDays(lastDoneDate, days) : null;
}

function inferMaintenanceStatus(
  nextDueDate: Date | null,
  cadence: MaintenanceCadence,
  lastDoneDate: Date | null,
): MaintenanceStatus {
  if (!nextDueDate) {
    return cadence === "unknown" && !lastDoneDate ? "needs-info" : "scheduled";
  }

  const days = daysUntilDate(formatReturnDate(nextDueDate));

  if (days === null) {
    return "needs-info";
  }

  if (days < 0) {
    return "overdue";
  }

  if (days <= 14) {
    return "due-soon";
  }

  return "scheduled";
}

function inferMaintenanceSupplies(text: string) {
  const supplies = new Set<string>();
  const filterSize = text.match(/\b\d{1,2}x\d{1,2}x\d{1,2}\b/i)?.[0];

  if (filterSize) {
    supplies.add(`${filterSize} filter`);
  }

  const knownSupplies = [
    "AA batteries",
    "AAA batteries",
    "9V battery",
    "furnace filters",
    "HVAC filter",
    "water filter",
    "air filter",
    "bulb",
    "cleaner",
    "vinegar",
    "descaler",
    "screws",
  ];

  for (const supply of knownSupplies) {
    if (new RegExp(`\\b${escapeRegExp(supply)}s?\\b`, "i").test(text)) {
      supplies.add(titleCase(supply));
    }
  }

  return Array.from(supplies);
}

function inferMaintenanceNotes(text: string, category: string) {
  const notes: string[] = [];

  if (
    /\b(noisy|leak|smell|burning|sparking|mold|water damage|gas)\b/i.test(text)
  ) {
    notes.push(
      "Potential repair or safety issue; do not treat this as DIY instructions.",
    );
  }

  if (category === "repair review") {
    notes.push(
      "Capture photos, model numbers, warranty status, and contractor notes.",
    );
  }

  if (/\b(filter|size|battery|supply|buy)\b/i.test(text)) {
    notes.push("Stage supplies before the maintenance block.");
  }

  return notes.length
    ? notes
    : ["Use completion date as the source of truth for the next reminder."];
}

function compareMaintenanceTasks(
  left: MaintenanceTask,
  right: MaintenanceTask,
) {
  return (
    maintenanceStatusRank(left.status) - maintenanceStatusRank(right.status) ||
    nullableDaysUntil(left.nextDue) - nullableDaysUntil(right.nextDue) ||
    left.asset.localeCompare(right.asset) ||
    left.task.localeCompare(right.task)
  );
}

function maintenanceStatusRank(status: MaintenanceStatus) {
  const ranks: Record<MaintenanceStatus, number> = {
    overdue: 0,
    "due-soon": 1,
    "needs-info": 2,
    scheduled: 3,
  };

  return ranks[status];
}

function formatMaintenanceLine(task: MaintenanceTask) {
  const due =
    task.nextDue === "unknown"
      ? "next due unknown"
      : `${task.nextDue} (${task.status})`;
  const supplyText = task.supplies.length
    ? ` Supplies: ${task.supplies.join(", ")}.`
    : "";

  return `${task.asset}: ${task.task} - ${task.cadence}, last done ${task.lastDone}, ${due}.${supplyText} ${task.notes[0] ?? ""}`;
}

function maintenanceCalendarRows(tasks: MaintenanceTask[]): DataRow[] {
  return tasks
    .filter((task) => task.nextDue !== "unknown")
    .map((task) => ({
      Description: `${task.status}; ${task.category}; cadence ${task.cadence}; supplies ${task.supplies.join("; ") || "none detected"}`,
      "Start Date": task.nextDue,
      Subject: `${task.asset}: ${task.task}`,
    }));
}

function maintenanceSupplyRows(tasks: MaintenanceTask[]): DataRow[] {
  const bySupply = new Map<
    string,
    { assets: string[]; nextDue: string; supply: string; tasks: string[] }
  >();

  for (const task of tasks) {
    for (const supply of task.supplies) {
      const row = bySupply.get(supply) ?? {
        assets: [],
        nextDue: task.nextDue,
        supply,
        tasks: [],
      };

      row.assets.push(task.asset);
      row.tasks.push(task.task);

      if (
        nullableDaysUntil(task.nextDue) < nullableDaysUntil(row.nextDue) ||
        row.nextDue === "unknown"
      ) {
        row.nextDue = task.nextDue;
      }

      bySupply.set(supply, row);
    }
  }

  return Array.from(bySupply.values()).map((row) => ({
    assets: Array.from(new Set(row.assets)).join("; "),
    next_due: row.nextDue,
    supply: row.supply,
    tasks: Array.from(new Set(row.tasks)).join("; "),
  }));
}

function countMaintenanceCategories(tasks: MaintenanceTask[]) {
  return {
    appliances: tasks.filter((task) => task.category === "appliances").length,
    cleaning: tasks.filter((task) => task.category === "cleaning").length,
    filters: tasks.filter((task) => task.category === "filters").length,
    safety: tasks.filter((task) => task.category === "safety").length,
    seasonal: tasks.filter((task) => task.category === "seasonal").length,
  };
}

function maintenanceChecklistMarkdown(tasks: MaintenanceTask[]) {
  const actionable = tasks.filter((task) =>
    ["overdue", "due-soon"].includes(task.status),
  );
  const scheduled = tasks.filter((task) => task.status === "scheduled");
  const needsInfo = tasks.filter((task) => task.status === "needs-info");

  return [
    "## Do first",
    ...(actionable.length
      ? actionable.map((task) => `- [ ] ${formatMaintenanceLine(task)}`)
      : ["- [ ] No overdue or due-soon task detected."]),
    "",
    "## Upcoming",
    ...(scheduled.length
      ? scheduled
          .slice(0, 12)
          .map((task) => `- [ ] ${formatMaintenanceLine(task)}`)
      : ["- [ ] Add last-done dates to calculate future reminders."]),
    "",
    "## Add details",
    ...(needsInfo.length
      ? needsInfo.map(
          (task) =>
            `- [ ] ${task.asset}: add last-done date, due date, or interval for ${task.task}.`,
        )
      : [
          "- [ ] Keep model numbers, supply sizes, manuals, and repair notes beside the asset record.",
        ]),
    "",
    "## Verify before acting",
    "- Use this as an organizer, not professional repair guidance.",
    "- For electrical, plumbing, structural, gas, roof, or safety-critical work, verify with a qualified professional.",
  ].join("\n");
}

function addDateDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addDateMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function daysUntilDate(dateText: string) {
  if (dateText === "unknown") {
    return null;
  }

  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  return Math.ceil(
    (startOfDate.getTime() - startOfToday.getTime()) / 86_400_000,
  );
}

function formatReturnDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
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
