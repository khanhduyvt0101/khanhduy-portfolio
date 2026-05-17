"use client";

import {
  ArrowRight,
  Bot,
  Braces,
  FileText,
  ImageIcon,
  Keyboard,
  type LucideIcon,
  Paintbrush,
  Search,
  Sparkles,
  Type,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import { agentBlueprints } from "~/lib/ai-agents/agent-catalog";
import { getAgentIcon } from "~/lib/ai-agents/agent-presentation";
import { freeTools, type ToolCategory } from "~/lib/free-tools/tool-meta";
import {
  type PortfolioCommandPaletteOpenDetail,
  portfolioCommandPaletteOpenEvent,
} from "~/lib/portfolio/command-palette-events";
import { cn } from "~/lib/utils";

const toolCategoryIcons: Record<ToolCategory, LucideIcon> = {
  Design: Paintbrush,
  Developer: Braces,
  Image: ImageIcon,
  PDF: FileText,
  Text: Type,
};

const toolCategories = [
  "Developer",
  "Image",
  "PDF",
  "Text",
  "Design",
] satisfies ToolCategory[];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MenuFeature({
  href,
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  href: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <NavigationMenuLink asChild>
      <Link
        className="group grid gap-4 rounded-2xl border bg-muted/35 p-4 text-foreground outline-none transition-colors duration-200 hover:border-foreground/20 hover:bg-muted/75 focus:border-foreground/20 focus:bg-muted/75"
        href={href}
      >
        <span className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
            {eyebrow}
          </span>
          <span className="grid size-9 place-items-center rounded-full border bg-background shadow-xs transition-colors group-hover:border-foreground/20">
            <Icon aria-hidden="true" />
          </span>
        </span>
        <span className="grid gap-2">
          <span className="text-2xl font-black leading-none">{title}</span>
          <span className="text-muted-foreground text-sm leading-6">
            {description}
          </span>
        </span>
        <span className="inline-flex items-center gap-2 font-semibold text-sm">
          Open
          <ArrowRight
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </Link>
    </NavigationMenuLink>
  );
}

function MenuItemLink({
  href,
  title,
  description,
  active,
  icon: Icon = Sparkles,
}: {
  href: string;
  title: string;
  description?: string;
  active?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <NavigationMenuLink asChild active={active}>
      <Link
        className={cn(
          "group grid min-w-0 gap-1 rounded-xl border border-transparent p-3 text-left outline-none transition-colors hover:border-border hover:bg-muted/60 focus:border-border focus:bg-muted/60",
          active && "border-border bg-muted text-foreground",
        )}
        href={href}
      >
        <span className="flex items-center gap-2 font-semibold text-sm leading-5">
          <Icon aria-hidden="true" />
          <span className="truncate">{title}</span>
        </span>
        {description ? (
          <span className="line-clamp-2 text-muted-foreground text-xs leading-5">
            {description}
          </span>
        ) : null}
      </Link>
    </NavigationMenuLink>
  );
}

function MenuPanel({
  children,
  className,
  width = "min(calc(100vw - 2rem), 34rem)",
}: {
  children: ReactNode;
  className?: string;
  width?: string;
}) {
  return (
    <NavigationMenuContent
      className={cn(
        "left-auto right-0 mt-3 max-h-[min(78vh,40rem)] overflow-hidden rounded-3xl border bg-background/95 p-3 shadow-2xl shadow-foreground/10 backdrop-blur-xl",
        className,
      )}
      style={{ width }}
    >
      {children}
    </NavigationMenuContent>
  );
}

function MenuScrollArea({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-menu-scroll-area=""
      className={cn(
        "min-h-0 overflow-y-auto overscroll-contain pr-1 [scrollbar-gutter:stable] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent",
        className,
      )}
    >
      {children}
    </div>
  );
}

function MenuTrigger({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return (
    <NavigationMenuTrigger
      className={cn(
        "relative h-10 rounded-none bg-transparent px-2.5 font-semibold text-muted-foreground text-sm shadow-none transition-colors hover:bg-transparent hover:text-foreground focus:bg-transparent focus:text-foreground focus-visible:ring-0 data-[state=open]:bg-transparent data-[state=open]:text-foreground data-[state=open]:hover:bg-transparent data-[state=open]:focus:bg-transparent after:absolute after:right-2.5 after:bottom-1.5 after:left-2.5 after:h-px after:origin-left after:scale-x-0 after:bg-foreground after:transition-transform after:duration-200 hover:after:scale-x-100 data-[state=open]:after:scale-x-100",
        active && "text-foreground after:scale-x-100",
      )}
    >
      {children}
    </NavigationMenuTrigger>
  );
}

export function HeaderCommandSearch(): ReactNode {
  const [isOpening, setIsOpening] = useState(false);

  const openCommandPalette = () => {
    setIsOpening(true);
    window.setTimeout(() => setIsOpening(false), 360);
    window.dispatchEvent(
      new CustomEvent<PortfolioCommandPaletteOpenDetail>(
        portfolioCommandPaletteOpenEvent,
        {
          detail: { source: "header_search" },
        },
      ),
    );
  };

  return (
    <button
      aria-label="Search the site"
      className={cn(
        "group/search relative hidden h-10 w-[min(30vw,18rem)] items-center overflow-hidden rounded-lg border bg-background/80 px-3 text-left shadow-xs backdrop-blur-md transition-[width,transform,border-color,background-color,box-shadow] duration-300 ease-out hover:w-[min(32vw,19rem)] hover:border-foreground/20 hover:bg-background hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 md:inline-flex",
        isOpening &&
          "scale-[0.985] border-foreground/25 bg-muted shadow-lg shadow-foreground/10",
      )}
      onClick={openCommandPalette}
      type="button"
    >
      <span className="absolute inset-y-0 left-0 w-12 bg-[radial-gradient(circle_at_35%_50%,var(--accent),transparent_68%)] opacity-0 transition-opacity duration-300 group-hover/search:opacity-80" />
      <span className="relative grid size-6 shrink-0 place-items-center rounded-md border bg-muted/60 text-muted-foreground transition-colors duration-300 group-hover/search:text-foreground">
        <Search className="size-3.5" />
      </span>
      <span className="relative ml-2 min-w-0 flex-1 truncate text-muted-foreground text-sm transition-colors duration-300 group-hover/search:text-foreground">
        Search agents, tools, links
      </span>
      <span className="relative ml-3 hidden items-center gap-1 rounded-md border bg-background/80 px-1.5 py-1 font-mono text-[0.68rem] text-muted-foreground shadow-xs lg:inline-flex">
        <Keyboard className="size-3" />
        <span>⌘K</span>
      </span>
    </button>
  );
}

export function HeaderNavigation(): ReactNode {
  const pathname = usePathname();

  return (
    <NavigationMenu
      aria-label="Primary"
      className="flex-none"
      delayDuration={90}
      skipDelayDuration={180}
      viewport={false}
    >
      <NavigationMenuList>
        <NavigationMenuItem>
          <MenuTrigger active={isActivePath(pathname, "/ai-agents")}>
            Agents
          </MenuTrigger>
          <MenuPanel>
            <div className="grid max-h-[calc(min(78vh,40rem)-1.5rem)] min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3">
              <MenuFeature
                description="Browser-first agents for summaries, files, data cleanup, and prompt work."
                eyebrow="Free AI agents"
                href="/ai-agents"
                icon={Bot}
                title="Agent shelf"
              />
              <MenuScrollArea className="grid content-start gap-2">
                <p className="px-2 pt-1 text-muted-foreground text-xs uppercase tracking-[0.18em]">
                  Pick an agent
                </p>
                <div className="grid gap-1">
                  {agentBlueprints.map((agent) => (
                    <MenuItemLink
                      active={pathname === `/ai-agents/${agent.id}`}
                      description={agent.tagline}
                      href={`/ai-agents/${agent.id}`}
                      icon={getAgentIcon(agent)}
                      key={agent.id}
                      title={agent.name.replace(" Agent", "")}
                    />
                  ))}
                </div>
              </MenuScrollArea>
            </div>
          </MenuPanel>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <MenuTrigger active={isActivePath(pathname, "/free-tools")}>
            Tools
          </MenuTrigger>
          <MenuPanel width="min(calc(100vw - 2rem), 36rem)">
            <div className="grid max-h-[calc(min(78vh,40rem)-1.5rem)] min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3">
              <MenuFeature
                description={`${freeTools.length} private browser utilities for developer, image, PDF, text, and design work.`}
                eyebrow="Free tools"
                href="/free-tools"
                icon={Braces}
                title="Utility shelf"
              />
              <MenuScrollArea>
                <div className="grid gap-3">
                  {toolCategories.map((category) => {
                    const Icon = toolCategoryIcons[category];
                    const tools = freeTools.filter(
                      (tool) => tool.category === category,
                    );

                    return (
                      <section
                        className="grid content-start gap-1"
                        key={category}
                      >
                        <p className="flex items-center gap-2 px-2 text-muted-foreground text-xs uppercase tracking-[0.18em]">
                          <Icon aria-hidden="true" />
                          {category}
                        </p>
                        {tools.map((tool) => (
                          <MenuItemLink
                            active={pathname === `/free-tools/${tool.slug}`}
                            description={tool.summary}
                            href={`/free-tools/${tool.slug}`}
                            icon={Icon}
                            key={tool.slug}
                            title={tool.title}
                          />
                        ))}
                      </section>
                    );
                  })}
                </div>
              </MenuScrollArea>
            </div>
          </MenuPanel>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
