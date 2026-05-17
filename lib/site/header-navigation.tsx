"use client";

import {
  ArrowRight,
  Bot,
  Braces,
  FileText,
  ImageIcon,
  type LucideIcon,
  Paintbrush,
  Sparkles,
  Type,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import { agentBlueprints } from "~/lib/ai-agents/agent-catalog";
import { freeTools, type ToolCategory } from "~/lib/free-tools/tool-meta";
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
        "h-10 rounded-lg bg-transparent px-4 font-semibold text-base hover:bg-muted focus:bg-muted data-[state=open]:bg-muted",
        active && "bg-muted text-foreground",
      )}
    >
      {children}
    </NavigationMenuTrigger>
  );
}

export function HeaderNavigation(): ReactNode {
  const pathname = usePathname();

  return (
    <NavigationMenu
      aria-label="Primary"
      className="flex-none rounded-2xl border bg-background/80 p-1 shadow-xs backdrop-blur-md"
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
                      icon={Bot}
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
