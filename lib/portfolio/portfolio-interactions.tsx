"use client";

import {
  Bot,
  Braces,
  Code2,
  Coffee,
  Copy,
  Dumbbell,
  ExternalLink,
  FileText,
  Home,
  ImageIcon,
  type LucideIcon,
  Mail,
  Moon,
  Music2,
  Palette,
  School,
  Type,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Fragment,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "~/components/ui/command";
import {
  agentBlueprints,
  getAgentSearchText,
} from "~/lib/ai-agents/agent-catalog";
import { getAgentIcon } from "~/lib/ai-agents/agent-presentation";
import {
  type FreeTool,
  freeTools,
  type ToolCategory,
} from "~/lib/free-tools/tool-meta";
import {
  isPortfolioCommandPaletteShortcut,
  type PortfolioCommandPaletteOpenDetail,
  portfolioCommandPaletteOpenEvent,
} from "~/lib/portfolio/command-palette-events";
import { trackSiteEvent } from "~/lib/site/analytics-events";

const email = "khanhduyvt0101@gmail.com";
const brief =
  "Khanh Duy is a full-stack developer in Ho Chi Minh City building practical apps for focus, fitness, and family logistics with JavaScript, React, TypeScript, and Next.js.";

type CommandAction = {
  title: string;
  description: string;
  icon: LucideIcon;
  keywords: string[];
  shortcut?: string;
  run: () => void;
};

type CommandGroupName =
  | "Routes"
  | "AI agents"
  | "Free tools"
  | "Quick actions"
  | "Products and links";

type RouteCommand = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  keywords: string[];
  shortcut?: string;
};

type PaletteItem = {
  id: string;
  group: CommandGroupName;
  title: string;
  description: string;
  icon: LucideIcon;
  keywords: string[];
  shortcut?: ReactNode;
  run: () => void;
};

const commandGroupOrder = [
  "Routes",
  "AI agents",
  "Free tools",
  "Quick actions",
  "Products and links",
] satisfies CommandGroupName[];

const toolCategoryIcons: Record<ToolCategory, LucideIcon> = {
  Design: Palette,
  Developer: Braces,
  Image: ImageIcon,
  PDF: FileText,
  Text: Type,
};

const routeCommands: RouteCommand[] = [
  {
    title: "Home",
    description: "Open the portfolio command center.",
    href: "/",
    icon: Home,
    keywords: ["portfolio", "khanh duy", "about", "home page", "profile"],
    shortcut: "G H",
  },
  {
    title: "AI Agents",
    description: "Browse all free browser-first AI agents.",
    href: "/ai-agents",
    icon: Bot,
    keywords: [
      "agents",
      "browser ai",
      "local ai",
      "automation",
      "summarize",
      "extract",
    ],
    shortcut: "G A",
  },
  {
    title: "Free Tools",
    description: `Browse all ${freeTools.length} private browser utilities.`,
    href: "/free-tools",
    icon: Wrench,
    keywords: [
      "tools",
      "utilities",
      "developer",
      "image",
      "pdf",
      "text",
      "design",
    ],
    shortcut: "G T",
  },
];

const productCommands = [
  {
    title: "LofiHood",
    description: "Open the local-first macOS menu bar lofi player.",
    href: "https://lofihood.com",
    icon: Music2,
    keywords: ["lofi", "macos", "menu bar", "music", "focus", "product"],
  },
  {
    title: "SpotterFuel",
    description: "Open the crowded-gym exercise swap app.",
    href: "https://spotterfuel.com",
    icon: Dumbbell,
    keywords: ["fitness", "gym", "exercise swaps", "iphone", "product"],
  },
  {
    title: "CampusCue",
    description: "Open the school notice action-card app.",
    href: "https://campuscue.app",
    icon: School,
    keywords: ["school", "parents", "notices", "calendar", "ios", "product"],
  },
  {
    title: "WakeArc",
    description:
      "Open the sleep-cycle alarm planner for iPhone and Apple Watch.",
    href: "https://wakearc.com",
    icon: Moon,
    keywords: [
      "sleep",
      "alarm",
      "sleep cycle",
      "iphone",
      "apple watch",
      "product",
    ],
  },
  {
    title: "CafeSignal",
    description: "Open the macOS public Wi-Fi menu bar assistant.",
    href: "https://cafesignal.com",
    icon: Coffee,
    keywords: ["wifi", "public wifi", "cafe", "macos", "menu bar", "product"],
  },
  {
    title: "GitHub",
    description: "Browse public work and repositories.",
    href: "https://github.com/khanhduyvt0101",
    icon: Code2,
    keywords: ["code", "repositories", "source", "projects", "open source"],
  },
];

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function getSearchTokens(value: string) {
  return normalizeSearchText(value).split(" ").filter(Boolean);
}

function getAcronym(value: string) {
  return getSearchTokens(value)
    .map((token) => token.at(0) ?? "")
    .join("");
}

function scoreText(value: string, query: string, weight: number) {
  const normalizedValue = normalizeSearchText(value);

  if (!(normalizedValue && query)) {
    return 0;
  }

  if (normalizedValue === query) {
    return 120 * weight;
  }

  if (normalizedValue.startsWith(query)) {
    return 95 * weight;
  }

  if (normalizedValue.includes(` ${query}`)) {
    return 82 * weight;
  }

  if (normalizedValue.includes(query)) {
    return 55 * weight;
  }

  if (getAcronym(normalizedValue).startsWith(query)) {
    return 48 * weight;
  }

  return 0;
}

function scoreCommandItem(value: string, search: string, keywords?: string[]) {
  const normalizedSearch = normalizeSearchText(search);

  if (!normalizedSearch) {
    return 1;
  }

  const tokens = getSearchTokens(normalizedSearch);
  const searchableFields = [
    { text: value, weight: 1 },
    ...(keywords ?? []).map((keyword, index) => ({
      text: keyword,
      weight: index < 4 ? 0.78 : 0.44,
    })),
  ];

  const phraseScore = Math.max(
    ...searchableFields.map(({ text, weight }) =>
      scoreText(text, normalizedSearch, weight),
    ),
  );
  const tokenScore = tokens.reduce((total, token) => {
    const bestTokenScore = Math.max(
      ...searchableFields.map(({ text, weight }) =>
        scoreText(text, token, weight),
      ),
    );

    return bestTokenScore > 0
      ? total + bestTokenScore
      : Number.NEGATIVE_INFINITY;
  }, 0);

  if (!Number.isFinite(tokenScore)) {
    return phraseScore > 0 ? phraseScore / 100 : 0;
  }

  return (phraseScore + tokenScore / Math.max(tokens.length, 1)) / 100;
}

function toolKeywords(tool: FreeTool) {
  return [
    tool.slug.replaceAll("-", " "),
    tool.slug,
    tool.category,
    tool.summary,
    ...tool.keywords,
  ];
}

function scorePaletteItem(item: PaletteItem, search: string) {
  return scoreCommandItem(item.title, search, [
    item.description,
    item.group,
    ...item.keywords,
  ]);
}

export type PortfolioCommandPaletteOpenRequest = {
  id: number;
  source: PortfolioCommandPaletteOpenDetail["source"];
};

export function PortfolioCommandPalette({
  openRequest,
}: {
  openRequest?: PortfolioCommandPaletteOpenRequest | null;
}): ReactNode {
  const router = useRouter();
  const handledOpenRequestId = useRef<number | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const openPalette = useCallback(
    (source: PortfolioCommandPaletteOpenDetail["source"]) => {
      setSearchQuery("");
      setPaletteOpen(true);
      trackSiteEvent("Command Palette Opened", { source });
    },
    [],
  );

  useEffect(() => {
    if (!openRequest || handledOpenRequestId.current === openRequest.id) {
      return;
    }

    handledOpenRequestId.current = openRequest.id;
    openPalette(openRequest.source);
  }, [openPalette, openRequest]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isPortfolioCommandPaletteShortcut(event)) {
        event.preventDefault();
        setPaletteOpen((current) => {
          if (!current) {
            setSearchQuery("");
            trackSiteEvent("Command Palette Opened", {
              source: "keyboard_shortcut",
            });
          }

          return !current;
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onPaletteOpen = (event: Event) => {
      const detail = (event as CustomEvent<PortfolioCommandPaletteOpenDetail>)
        .detail;
      openPalette(detail?.source ?? "header_search");
    };

    window.addEventListener(portfolioCommandPaletteOpenEvent, onPaletteOpen);
    return () =>
      window.removeEventListener(
        portfolioCommandPaletteOpenEvent,
        onPaletteOpen,
      );
  }, [openPalette]);

  const copyText = useCallback(
    async (kind: "email" | "brief", value: string) => {
      await navigator.clipboard.writeText(value);
      trackSiteEvent("Clipboard Copied", { kind });
    },
    [],
  );

  const commandActions = useMemo<CommandAction[]>(
    () => [
      {
        title: "Open AI Agents",
        description: "Run free browser agents for email, files, and data.",
        icon: Bot,
        keywords: [
          "ai agents",
          "browser ai",
          "summaries",
          "files",
          "data cleanup",
        ],
        shortcut: "G A",
        run: () => router.push("/ai-agents"),
      },
      {
        title: "Open Free Tools",
        description: `Browse all ${freeTools.length} local browser tools.`,
        icon: Wrench,
        keywords: ["free tools", "utilities", "browser tools", "local tools"],
        shortcut: "G T",
        run: () => router.push("/free-tools"),
      },
      {
        title: "Copy Email",
        description: email,
        icon: Mail,
        keywords: ["contact", "mail", "email address", "gmail"],
        shortcut: "C E",
        run: () => void copyText("email", email),
      },
      {
        title: "Copy Short Brief",
        description: "A concise intro for opportunities and referrals.",
        icon: Copy,
        keywords: ["bio", "intro", "about", "summary", "profile"],
        shortcut: "C B",
        run: () => void copyText("brief", brief),
      },
    ],
    [copyText, router],
  );

  const paletteItems = useMemo<PaletteItem[]>(
    () => [
      ...routeCommands.map((route) => ({
        id: `route:${route.href}`,
        group: "Routes" as const,
        title: route.title,
        description: route.description,
        icon: route.icon,
        keywords: route.keywords,
        shortcut: route.shortcut,
        run: () => {
          setPaletteOpen(false);
          router.push(route.href);
        },
      })),
      ...agentBlueprints.map((agent) => ({
        id: `agent:${agent.id}`,
        group: "AI agents" as const,
        title: agent.name,
        description: agent.tagline,
        icon: getAgentIcon(agent),
        keywords: [
          agent.id,
          agent.id.replaceAll("-", " "),
          agent.description,
          agent.privacy,
          agent.runtime,
          ...agent.inputs,
          ...agent.outputs,
          ...agent.useCases,
          ...agent.stack,
          getAgentSearchText(agent),
        ],
        shortcut: agent.privacy,
        run: () => {
          setPaletteOpen(false);
          router.push(`/ai-agents/${agent.id}`);
        },
      })),
      ...freeTools.map((tool) => ({
        id: `tool:${tool.slug}`,
        group: "Free tools" as const,
        title: tool.title,
        description: tool.summary,
        icon: toolCategoryIcons[tool.category],
        keywords: toolKeywords(tool),
        shortcut: tool.category,
        run: () => {
          setPaletteOpen(false);
          router.push(`/free-tools/${tool.slug}`);
        },
      })),
      ...commandActions.map((action) => ({
        id: `action:${action.title}`,
        group: "Quick actions" as const,
        title: action.title,
        description: action.description,
        icon: action.icon,
        keywords: action.keywords,
        shortcut: action.shortcut,
        run: () => {
          setPaletteOpen(false);
          action.run();
        },
      })),
      ...productCommands.map((product) => ({
        id: `product:${product.href}`,
        group: "Products and links" as const,
        title: product.title,
        description: product.description,
        icon: product.icon,
        keywords: product.keywords,
        shortcut: <ExternalLink />,
        run: () => {
          setPaletteOpen(false);
          window.open(product.href, "_blank");
        },
      })),
    ],
    [commandActions, router],
  );

  const groupedItems = useMemo(
    () =>
      commandGroupOrder
        .map((group) => ({
          group,
          items: paletteItems.filter((item) => item.group === group),
        }))
        .filter(({ items }) => items.length > 0),
    [paletteItems],
  );

  const matchingItems = useMemo(() => {
    if (!normalizeSearchText(searchQuery)) {
      return [];
    }

    return paletteItems
      .map((item) => ({
        item,
        score: scorePaletteItem(item, searchQuery),
      }))
      .filter(({ score }) => score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 12)
      .map(({ item }) => item);
  }, [paletteItems, searchQuery]);

  const hasSearchQuery = Boolean(normalizeSearchText(searchQuery));

  return (
    <CommandDialog
      className="border-border/70 bg-background/95 shadow-2xl shadow-foreground/15 backdrop-blur-xl duration-300 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 sm:max-w-2xl"
      commandProps={{
        loop: true,
        shouldFilter: false,
      }}
      description="Search products, links, and quick actions."
      onOpenChange={setPaletteOpen}
      open={paletteOpen}
      title="Khanh Duy Command Center"
    >
      <CommandInput
        onValueChange={setSearchQuery}
        placeholder="Search products, tools, links..."
        value={searchQuery}
      />
      <CommandList className="max-h-[420px]">
        {hasSearchQuery ? (
          matchingItems.length > 0 ? (
            <CommandGroup heading="Best matches">
              {matchingItems.map((item) => (
                <PaletteCommandItem item={item} key={item.id} />
              ))}
            </CommandGroup>
          ) : (
            <CommandEmpty>
              No matching route, tool, agent, or action.
            </CommandEmpty>
          )
        ) : (
          groupedItems.map(({ group, items }, index) => (
            <Fragment key={group}>
              {index > 0 ? <CommandSeparator /> : null}
              <CommandGroup heading={group}>
                {items.map((item) => (
                  <PaletteCommandItem item={item} key={item.id} />
                ))}
              </CommandGroup>
            </Fragment>
          ))
        )}
      </CommandList>
    </CommandDialog>
  );
}

function PaletteCommandItem({ item }: { item: PaletteItem }): ReactNode {
  return (
    <CommandItem
      keywords={[item.description, item.group, ...item.keywords]}
      onSelect={() => {
        trackSiteEvent("Command Palette Action", { action: item.title });
        item.run();
      }}
      value={item.id}
    >
      <item.icon />
      <div className="flex min-w-0 flex-col">
        <span>{item.title}</span>
        <span className="truncate text-muted-foreground text-xs">
          {item.description}
        </span>
      </div>
      {item.shortcut ? (
        <CommandShortcut>{item.shortcut}</CommandShortcut>
      ) : null}
    </CommandItem>
  );
}
