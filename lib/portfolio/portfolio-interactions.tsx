"use client";

import {
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandThreads,
  IconBrandX,
  IconMail,
} from "@tabler/icons-react";
import {
  Bot,
  Braces,
  Code2,
  Copy,
  ExternalLink,
  FileText,
  Home,
  ImageIcon,
  type LucideIcon,
  Mail,
  MessageSquareText,
  Palette,
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
  useState,
} from "react";

import { Button } from "~/components/ui/button";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
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
  type PortfolioCommandPaletteOpenDetail,
  portfolioCommandPaletteOpenEvent,
} from "~/lib/portfolio/command-palette-events";
import { trackSiteEvent } from "~/lib/site/analytics-events";
import { cn } from "~/lib/utils";

const email = "khanhduyvt0101@gmail.com";
const brief =
  "Khanh Duy is a full-stack software engineer in Ho Chi Minh City, Vietnam with experience building web and mobile products with JavaScript, React, TypeScript, and Next.js.";

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/khanhduyvt0101",
    icon: IconBrandGithub,
    tone: "bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-white/90",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/buitrongkhanhduy/",
    icon: IconBrandLinkedin,
  },
  {
    label: "X",
    href: "https://x.com/khanhduyvt",
    icon: IconBrandX,
  },
  {
    label: "Threads",
    href: "https://www.threads.net/@_khanhduy",
    icon: IconBrandThreads,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/_khanhduy",
    icon: IconBrandInstagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/khanhduyvt0101",
    icon: IconBrandFacebook,
  },
  {
    label: "Email",
    href: `mailto:${email}`,
    icon: IconMail,
  },
];

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
    title: "ChatAcademia",
    description: "Open the AI research product.",
    href: "https://chatacademia.com",
    icon: MessageSquareText,
    keywords: ["research", "papers", "citations", "academic search", "product"],
  },
  {
    title: "PDF Vector",
    description: "Open the document intelligence API.",
    href: "https://pdfvector.com",
    icon: FileText,
    keywords: ["pdf", "documents", "extraction", "schema", "api", "product"],
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

export function LocalTime(): ReactNode {
  const [localTime, setLocalTime] = useState("--:--");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    });

    const updateTime = () => setLocalTime(formatter.format(new Date()));
    updateTime();

    const timer = window.setInterval(updateTime, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return <span suppressHydrationWarning>{localTime}</span>;
}

export function PortfolioSocialLinks(): ReactNode {
  return (
    <TooltipProvider delayDuration={120}>
      <div className="flex flex-wrap gap-2">
        {socialLinks.map(({ href, icon: Icon, label, tone }) => (
          <Tooltip key={href}>
            <TooltipTrigger asChild>
              <Button
                asChild
                className={cn(
                  "size-12 rounded-lg p-0",
                  tone ?? "bg-background/80",
                )}
                size="sm"
                variant={tone ? "default" : "outline"}
              >
                <a
                  aria-label={label}
                  href={href}
                  onClick={() =>
                    trackSiteEvent("Social Link Clicked", {
                      platform: label,
                    })
                  }
                  rel="noreferrer"
                  target="_blank"
                >
                  <Icon className="size-5" stroke={1.8} />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

export function PortfolioCommandPalette(): ReactNode {
  const router = useRouter();
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
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
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
