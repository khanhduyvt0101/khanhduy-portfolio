import {
  ArrowUpRight,
  Braces,
  Code2,
  ExternalLink,
  FileText,
  type LucideIcon,
  MessageSquareText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { agentBlueprints } from "~/lib/ai-agents/agent-catalog";
import { AiAgentMarketplace } from "~/lib/ai-agents/ai-agent-marketplace";
import { freeTools } from "~/lib/free-tools/tool-meta";
import { LocalTime } from "~/lib/portfolio/local-time";
import { PortfolioSocialLinks } from "~/lib/portfolio/portfolio-social-links";
import { CatalogPageNavigation } from "~/lib/site/catalog-page-navigation";
import { getCatalogPageCount } from "~/lib/site/catalog-pagination";
import { cn } from "~/lib/utils";

const experienceStartYear = 2021;

type Product = {
  name: string;
  label: string;
  href: string;
  image: string;
  metric: string;
  description: string;
  accent: string;
  icon: LucideIcon;
  stack: string[];
};

const products: Product[] = [
  {
    name: "ChatAcademia",
    label: "AI research platform",
    href: "https://chatacademia.com",
    image: "https://www.chatacademia.com/og.png",
    metric: "2,000+ researchers",
    description:
      "A research workspace for searching papers, talking with frontier models, finding gaps, and moving from idea to citation-backed draft.",
    accent: "from-cyan-300 via-sky-400 to-lime-300",
    icon: MessageSquareText,
    stack: ["Next.js", "AI agents", "Academic search", "Subscriptions"],
  },
  {
    name: "PDF Vector",
    label: "Document intelligence API",
    href: "https://pdfvector.com",
    image: "https://www.pdfvector.com/og.png",
    metric: "structured extraction",
    description:
      "A scalable PDF processing API for extracting structured data from complex documents and powering document automation systems.",
    accent: "from-orange-300 via-rose-300 to-cyan-300",
    icon: FileText,
    stack: ["API design", "PDF parsing", "RAG pipelines", "Schema extraction"],
  },
];

const featuredTools = [
  "palette-from-image",
  "image-compressor",
  "images-to-pdf",
  "json-formatter",
  "qr-code-generator",
  "timestamp-converter",
]
  .map((slug) => freeTools.find((tool) => tool.slug === slug))
  .filter((tool): tool is (typeof freeTools)[number] => Boolean(tool));

export function PortfolioCommandCenter(): ReactNode {
  const yearsOfExperience = Math.max(
    0,
    new Date().getFullYear() - experienceStartYear,
  );

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative isolate border-b border-border/70">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-25" />
        <div className="absolute inset-x-0 top-0 -z-10 h-36 bg-[linear-gradient(180deg,var(--accent),transparent)] opacity-45" />

        <div className="container mx-auto grid max-w-7xl gap-8 px-4 py-8 md:py-12 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center">
          <div className="flex min-w-0 flex-col gap-6">
            <div className="max-w-4xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Bui Trong Khanh Duy / Full-stack developer / Vietnam
              </p>
              <h1 className="mt-5 text-5xl font-black leading-[0.95] tracking-normal md:text-7xl">
                Software engineer simplifying ideas with technology.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                I'm Khanh Duy, a full-stack developer in Ho Chi Minh City. For{" "}
                {yearsOfExperience}+ years, I've shipped web and mobile products
                that turn complex ideas into fast, simple, reliable experiences
                with JavaScript, React, TypeScript, and Next.js.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <HeroMetric
                icon={Code2}
                label="Experience"
                value={`${yearsOfExperience}+ years`}
              />
              <HeroMetric icon={Braces} label="Stack" value="JS / TS / React" />
              <HeroMetric
                icon={FileText}
                label="Free tools"
                value={`${freeTools.length} tools`}
              />
              <HeroMetric
                icon={MessageSquareText}
                label="AI agents"
                value={`${agentBlueprints.length} agents`}
              />
            </div>

            <PortfolioSocialLinks />
          </div>

          <div className="relative mx-auto w-full max-w-[430px]">
            <div className="rounded-lg border bg-card p-3 shadow-2xl">
              <div className="relative aspect-[5/6] overflow-hidden rounded-md border bg-muted sm:aspect-[4/5] lg:aspect-[5/6]">
                <Image
                  alt="Khanh Duy"
                  src="/avatar.webp"
                  fill
                  preload
                  sizes="(max-width: 1024px) 82vw, 430px"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="absolute inset-x-3 bottom-3 rounded-lg border bg-background/92 p-4 shadow-xl backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Currently
                </p>
                <Badge variant="secondary" className="rounded-lg">
                  Vietnam / <LocalTime />
                </Badge>
              </div>
              <p className="mt-3 text-xl font-black leading-tight">
                Building useful AI systems that people can actually operate.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="products"
        className="border-b border-border/70 bg-muted/25 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Products
              </p>
              <h2 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
                Two serious products, one compact story.
              </h2>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {products.map((product) => (
              <Card
                key={product.name}
                className="overflow-hidden rounded-lg py-0"
              >
                <CardHeader className="gap-4 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="rounded-lg">
                      <product.icon />
                      {product.label}
                    </Badge>
                    <Badge variant="secondary" className="rounded-lg">
                      {product.metric}
                    </Badge>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <CardTitle className="text-3xl font-black">
                        {product.name}
                      </CardTitle>
                      <CardDescription className="mt-3 text-base leading-7">
                        {product.description}
                      </CardDescription>
                    </div>
                    <Button asChild variant="ghost" size="icon">
                      <a
                        href={product.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${product.name}`}
                      >
                        <ExternalLink />
                      </a>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-white">
                    <Image
                      alt={`${product.name} product preview`}
                      src={product.image}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-contain p-3"
                    />
                    <div className="absolute inset-x-3 bottom-3 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full bg-gradient-to-r",
                          product.accent,
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {product.stack.map((item) => (
                      <Badge
                        key={item}
                        variant="outline"
                        className="rounded-lg"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <AiAgentMarketplace compact />

      <section className="container mx-auto max-w-7xl px-4 py-14 md:py-20">
        <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Free tools
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
              The useful links, without the maze.
            </h2>
          </div>
          <Button asChild variant="outline" className="w-fit rounded-lg">
            <Link href="/free-tools">
              Show all
              <ArrowUpRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTools.map((tool) => (
            <Card key={tool.slug} className="rounded-lg py-5">
              <CardHeader className="gap-3">
                <CardTitle className="text-xl">{tool.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-base leading-7">
                  {tool.summary}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="secondary" className="rounded-lg">
                  <Link href={`/free-tools/${tool.slug}`}>Open tool</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-7 flex flex-col items-center gap-3">
          <p className="text-center text-muted-foreground text-sm">
            Showing 1-{featuredTools.length} of {freeTools.length} free tools
          </p>
          <CatalogPageNavigation
            basePath="/free-tools"
            currentPage={1}
            label="Free tools pages"
            pageCount={getCatalogPageCount(freeTools)}
          />
        </div>
      </section>
    </div>
  );
}

function HeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}): ReactNode {
  return (
    <div className="rounded-lg border border-border/70 bg-background/80 p-3 backdrop-blur">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
