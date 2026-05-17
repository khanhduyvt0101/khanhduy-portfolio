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
  FileText,
  type LucideIcon,
  Mail,
  MessageSquareText,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

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
import { agentBlueprints } from "~/lib/ai-agents/agent-catalog";
import { freeTools } from "~/lib/free-tools/tool-meta";
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
  shortcut?: string;
  run: () => void;
};

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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((current) => {
          if (!current) {
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
        shortcut: "G A",
        run: () => router.push("/ai-agents"),
      },
      {
        title: "Open Free Tools",
        description: `Browse all ${freeTools.length} local browser tools.`,
        icon: Wrench,
        shortcut: "G T",
        run: () => router.push("/free-tools"),
      },
      {
        title: "Copy Email",
        description: email,
        icon: Mail,
        shortcut: "C E",
        run: () => void copyText("email", email),
      },
      {
        title: "Copy Short Brief",
        description: "A concise intro for opportunities and referrals.",
        icon: Copy,
        shortcut: "C B",
        run: () => void copyText("brief", brief),
      },
      {
        title: "Open GitHub",
        description: "Browse public work and repositories.",
        icon: Code2,
        shortcut: "G H",
        run: () => window.open("https://github.com/khanhduyvt0101", "_blank"),
      },
      {
        title: "Open ChatAcademia",
        description: "AI research product.",
        icon: MessageSquareText,
        run: () => window.open("https://chatacademia.com", "_blank"),
      },
      {
        title: "Open PDF Vector",
        description: "Document intelligence API.",
        icon: FileText,
        run: () => window.open("https://pdfvector.com", "_blank"),
      },
    ],
    [copyText, router],
  );

  const runCommand = (action: CommandAction) => {
    trackSiteEvent("Command Palette Action", { action: action.title });
    setPaletteOpen(false);
    action.run();
  };

  return (
    <CommandDialog
      className="border-border/70 bg-background/95 shadow-2xl backdrop-blur-xl sm:max-w-2xl"
      description="Search products, links, and quick actions."
      onOpenChange={setPaletteOpen}
      open={paletteOpen}
      title="Khanh Duy Command Center"
    >
      <CommandInput placeholder="Search products, tools, links..." />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>No matching action.</CommandEmpty>
        <CommandGroup heading="Quick actions">
          {commandActions.map((action) => (
            <CommandItem
              key={action.title}
              onSelect={() => runCommand(action)}
              value={`${action.title} ${action.description}`}
            >
              <action.icon />
              <div className="flex min-w-0 flex-col">
                <span>{action.title}</span>
                <span className="truncate text-muted-foreground text-xs">
                  {action.description}
                </span>
              </div>
              {action.shortcut ? (
                <CommandShortcut>{action.shortcut}</CommandShortcut>
              ) : null}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="AI agents">
          {agentBlueprints.map((agent) => (
            <CommandItem
              key={agent.id}
              onSelect={() => {
                setPaletteOpen(false);
                router.push(`/ai-agents/${agent.id}`);
              }}
              value={`${agent.name} ${agent.tagline} ${agent.description} ${agent.stack.join(" ")}`}
            >
              <Bot />
              <div className="flex min-w-0 flex-col">
                <span>{agent.name}</span>
                <span className="truncate text-muted-foreground text-xs">
                  {agent.tagline}
                </span>
              </div>
              <CommandShortcut>{agent.privacy}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Featured tools">
          {freeTools.slice(0, 8).map((tool) => (
            <CommandItem
              key={tool.slug}
              onSelect={() => {
                setPaletteOpen(false);
                router.push(`/free-tools/${tool.slug}`);
              }}
              value={`${tool.title} ${tool.summary} ${tool.keywords.join(" ")}`}
            >
              <Braces />
              <div className="flex min-w-0 flex-col">
                <span>{tool.title}</span>
                <span className="truncate text-muted-foreground text-xs">
                  {tool.summary}
                </span>
              </div>
              <CommandShortcut>{tool.category}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
