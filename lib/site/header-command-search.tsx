"use client";

import { Keyboard, Search } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  type PortfolioCommandPaletteOpenDetail,
  portfolioCommandPaletteOpenEvent,
} from "~/lib/portfolio/command-palette-events";
import { cn } from "~/lib/utils";

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
