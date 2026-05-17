"use client";

import {
  BracesIcon,
  CalendarClockIcon,
  ClockIcon,
  Code2Icon,
  DiffIcon,
  FileImageIcon,
  FileTextIcon,
  FingerprintIcon,
  HashIcon,
  ImageDownIcon,
  ImageIcon,
  KeyRoundIcon,
  LinkIcon,
  PaletteIcon,
  QrCodeIcon,
  RegexIcon,
  ScanTextIcon,
  SearchIcon,
  ShieldCheckIcon,
  SwatchBookIcon,
  TextIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import {
  type ComponentType,
  type SVGProps,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pill } from "~/components/kibo-ui/pill";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { trackSiteEvent } from "~/lib/site/analytics-events";
import { CatalogPageNavigation } from "~/lib/site/catalog-page-navigation";
import {
  catalogItemsPerPage,
  getCatalogPageCount,
  getCatalogPageItems,
} from "~/lib/site/catalog-pagination";
import { cn } from "~/lib/utils";
import { type FreeTool, freeToolCategories, freeTools } from "./tool-meta";

type FreeToolCategoryFilter = (typeof freeToolCategories)[number];

const toolIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  "qr-code-generator": QrCodeIcon,
  "json-formatter": BracesIcon,
  "jwt-decoder": ShieldCheckIcon,
  "uuid-generator": FingerprintIcon,
  "password-generator": KeyRoundIcon,
  "base64-encoder": Code2Icon,
  "url-encoder": LinkIcon,
  "regex-tester": RegexIcon,
  "hash-generator": HashIcon,
  "timestamp-converter": ClockIcon,
  "timezone-converter": CalendarClockIcon,
  "word-counter": TextIcon,
  "text-diff-checker": DiffIcon,
  "markdown-preview": ScanTextIcon,
  "css-gradient-generator": SwatchBookIcon,
  "color-converter": PaletteIcon,
  "palette-from-image": ImageIcon,
  "image-compressor": ImageDownIcon,
  "image-resizer": FileImageIcon,
  "images-to-pdf": FileTextIcon,
};

export function FreeToolsGallery({
  basePath = "/free-tools",
  currentPage = 1,
  pageCount = getCatalogPageCount(freeTools),
  tools = getCatalogPageItems(freeTools, currentPage),
}: {
  basePath?: string;
  currentPage?: number;
  pageCount?: number;
  tools?: FreeTool[];
}) {
  const [activeCategory, setActiveCategory] =
    useState<FreeToolCategoryFilter>("All");
  const [filteredPage, setFilteredPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const normalizedSearchQuery = normalizeSearchText(searchQuery);
  const isFiltered = activeCategory !== "All" || Boolean(normalizedSearchQuery);

  useEffect(() => {
    const focusSearchInput = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "k" ||
        !(event.metaKey || event.ctrlKey)
      ) {
        return;
      }

      event.preventDefault();
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    };

    document.addEventListener("keydown", focusSearchInput);

    return () => {
      document.removeEventListener("keydown", focusSearchInput);
    };
  }, []);

  const matchingTools = useMemo(() => {
    const categoryTools =
      activeCategory === "All"
        ? freeTools
        : freeTools.filter((tool) => tool.category === activeCategory);

    if (!normalizedSearchQuery) {
      return categoryTools;
    }

    return categoryTools
      .map((tool) => ({
        score: getToolSearchScore(tool, normalizedSearchQuery),
        tool,
      }))
      .filter(({ score }) => score > 0)
      .sort((first, second) => second.score - first.score)
      .map(({ tool }) => tool);
  }, [activeCategory, normalizedSearchQuery]);

  const filteredPageCount = getCatalogPageCount(matchingTools);
  const activePage = isFiltered ? filteredPage : currentPage;
  const visibleTools = isFiltered
    ? getCatalogPageItems(matchingTools, filteredPage)
    : tools;
  const resultCount = isFiltered ? matchingTools.length : freeTools.length;
  const shownStart =
    visibleTools.length > 0 ? (activePage - 1) * catalogItemsPerPage + 1 : 0;
  const shownEnd =
    visibleTools.length > 0 ? shownStart + visibleTools.length - 1 : 0;
  const resultText = `${visibleTools.length} ${
    visibleTools.length === 1 ? "tool" : "tools"
  }`;

  return (
    <section className="container mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 md:py-16">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Tool gallery
          </h2>
          <p className="text-muted-foreground">
            Choose a free utility and start using it right away.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 md:justify-end">
          {freeToolCategories.map((category) => {
            const isActive = category === activeCategory;

            return (
              <Pill
                asChild
                className={cn(
                  "cursor-pointer select-none transition-colors",
                  isActive
                    ? "shadow-xs"
                    : "hover:bg-accent hover:text-accent-foreground",
                )}
                key={category}
                variant={isActive ? "default" : "outline"}
              >
                <button
                  aria-pressed={isActive}
                  onClick={() => {
                    trackSiteEvent("Free Tools Category Selected", {
                      category,
                    });
                    setFilteredPage(1);
                    setActiveCategory(category);
                  }}
                  type="button"
                >
                  {category}
                </button>
              </Pill>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-xs md:flex-row md:items-center">
        <div className="relative flex-1">
          <SearchIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            aria-label="Search free tools"
            className="h-11 pr-24 pl-9"
            onChange={(event) => {
              setFilteredPage(1);
              setSearchQuery(event.target.value);
            }}
            placeholder="Search by name, feature, function, or description..."
            ref={searchInputRef}
            type="search"
            value={searchQuery}
          />
          <div className="-translate-y-1/2 absolute top-1/2 right-2 flex items-center gap-1">
            {searchQuery ? (
              <Button
                aria-label="Clear search"
                className="size-7"
                onClick={() => {
                  setFilteredPage(1);
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                size="icon"
                type="button"
                variant="ghost"
              >
                <XIcon />
              </Button>
            ) : null}
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-medium text-muted-foreground text-xs">
              ⌘K
            </kbd>
          </div>
        </div>
        <p className="px-1 text-muted-foreground text-sm md:min-w-20 md:text-right">
          {resultText}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {visibleTools.length > 0 ? (
          visibleTools.map((tool, index) => (
            <ToolCard
              index={(activePage - 1) * catalogItemsPerPage + index}
              key={tool.slug}
              tool={tool}
            />
          ))
        ) : (
          <Card className="rounded-lg md:col-span-2">
            <CardHeader>
              <CardTitle>No tools found</CardTitle>
              <CardDescription>
                Try another tool name, feature, action, or category.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="text-center text-muted-foreground text-sm">
          {visibleTools.length > 0
            ? `Showing ${shownStart}-${shownEnd} of ${resultCount} tools`
            : "No matching tools to page through"}
        </p>
        <CatalogPageNavigation
          basePath={basePath}
          currentPage={activePage}
          label="Free tools pages"
          onPageSelect={isFiltered ? setFilteredPage : undefined}
          pageCount={isFiltered ? filteredPageCount : pageCount}
        />
      </div>
    </section>
  );
}

function ToolCard({ index, tool }: { index: number; tool: FreeTool }) {
  const Icon = toolIcons[tool.slug] ?? QrCodeIcon;

  return (
    <Card className="group h-full gap-5 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-md border bg-muted text-foreground transition-colors group-hover:bg-background">
              <Icon className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <CardTitle className="text-lg leading-tight">
                {tool.title}
              </CardTitle>
              <CardDescription>{tool.category}</CardDescription>
            </div>
          </div>
          <Pill variant="secondary">#{String(index + 1).padStart(2, "0")}</Pill>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {tool.summary}
        </p>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full" variant="outline">
          <Link
            href={`/free-tools/${tool.slug}`}
            onClick={() =>
              trackSiteEvent("Free Tool Opened", {
                source: "gallery_card",
                tool: tool.slug,
              })
            }
          >
            Open tool
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function getToolSearchScore(tool: FreeTool, normalizedQuery: string) {
  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  const title = normalizeSearchText(tool.title);
  const category = normalizeSearchText(tool.category);
  const summary = normalizeSearchText(tool.summary);
  const slug = normalizeSearchText(tool.slug.replaceAll("-", " "));
  const keywords = normalizeSearchText(tool.keywords.join(" "));
  const searchText = [title, category, summary, slug, keywords].join(" ");

  if (!queryTokens.every((token) => searchText.includes(token))) {
    return 0;
  }

  let score = 1;

  if (title.includes(normalizedQuery)) {
    score += 80;
  }

  if (keywords.includes(normalizedQuery)) {
    score += 50;
  }

  if (summary.includes(normalizedQuery)) {
    score += 35;
  }

  if (category.includes(normalizedQuery)) {
    score += 25;
  }

  for (const token of queryTokens) {
    if (title.includes(token)) {
      score += 12;
    }

    if (keywords.includes(token)) {
      score += 8;
    }

    if (summary.includes(token)) {
      score += 5;
    }

    if (slug.includes(token)) {
      score += 4;
    }
  }

  return score;
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
