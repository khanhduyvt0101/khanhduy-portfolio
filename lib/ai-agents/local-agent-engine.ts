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
    case "pantry-meal-planner":
      return runPantryMealPlanner(input, userPrompt);
    case "prompt-builder":
      return runPromptBuilder(input, userPrompt);
    case "private-summarizer":
      return runPrivateSummarizer(input, userPrompt);
    case "subscription-audit":
      return runSubscriptionAudit(input, userPrompt);
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
